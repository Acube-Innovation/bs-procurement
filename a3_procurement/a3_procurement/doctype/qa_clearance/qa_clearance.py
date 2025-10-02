# Copyright (c) 2025, Acube and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import today

class QAClearance(Document):
    def on_submit(self):
        """
        When QA Clearance status becomes Completed, perform:
        1) Stock Entry (Material Transfer) for accepted quantities
           - source depends on qa_request.transfer_to_qa_warehouse or reference doc warehouses
        2) Purchase Receipt (is_return) in DRAFT for rejected+rework qty if purchase_receipt is present
        3) Subcontracting Receipt (is_return) in DRAFT for rejected+rework qty if subcontracting_receipt is present
        Serial handling: only include serials if self.has_serial_no is truthy.
        Company fetched from reference doc (PR / SCR).
        """
        try:
            if self.status != "Completed":
                return

            # qa_request linked on this clearance (should exist)
            qa_request_name = getattr(self, "qa_request", None)
            qa_request = None
            if qa_request_name:
                qa_request = frappe.get_doc("QA Request", qa_request_name)

            # Decide reference doc (PR or SCR) if present, to fetch company and per-item source warehouses
            ref_doc = None
            ref_type = None
            if getattr(self, "purchase_receipt", None):
                ref_doc = frappe.get_doc("Purchase Receipt", self.purchase_receipt)
                ref_type = "Purchase"
            elif getattr(self, "subcontracting_receipt", None):
                ref_doc = frappe.get_doc("Subcontracting Receipt", self.subcontracting_receipt)
                ref_type = "Sub-Contract"

            # Company resolution: prefer reference doc company
            company = None
            if ref_doc:
                company = getattr(ref_doc, "company", None)

            if not company and qa_request:
                # fallback: maybe qa_request has company (if you added it) — try getattr
                company = getattr(qa_request, "company", None)

            if not company:
                frappe.throw("Company not found in reference document or QA Request. Cannot create stock/return documents.")

            # ---------------------------
            # 1) Stock Entry for accepted quantities
            # ---------------------------
            # Build stock entry items list
            se_items = []
            # For serial handling: collect serials per item for "Accepted" status in QA Clearance serial table
            serials_by_item = {}
            if getattr(self, "has_serial_no", False):
                for srow in getattr(self, "table_putu", []) or []:
                    if srow.serial_number and (srow.status == "Accepted"):
                        serials_by_item.setdefault(srow.item, []).append(srow.serial_number)

            # If qa_request.transfer_to_qa_warehouse true -> source is qa_request.qa_warehouse
            transfer_to_qa_wh = bool(getattr(qa_request, "transfer_to_qa_warehouse", False)) if qa_request else False
            qa_wh = getattr(qa_request, "qa_warehouse", None) if qa_request else None

            for item_row in getattr(self, "items", []) or []:
                accepted_qty = item_row.accepted_quantity or 0
                if accepted_qty <= 0:
                    continue

                # Determine source warehouse
                source_warehouse = None
                if transfer_to_qa_wh:
                    # source is QA warehouse (items currently there)
                    source_warehouse = qa_wh
                    if not source_warehouse:
                        frappe.throw("QA Request has transfer_to_qa_warehouse enabled but qa_warehouse is not set.")
                else:
                    # find corresponding row in reference doc to get per-item warehouse
                    if not ref_doc:
                        frappe.throw("Reference document not found and transfer_to_qa_warehouse is not enabled. Cannot determine source warehouse.")
                    # find matching child row by item_code; prefer exact match and matching qty if necessary
                    ref_item_row = None
                    for r in ref_doc.items:
                        if r.item_code == item_row.item_code:
                            # For Purchase Receipt, the field is `warehouse`
                            # For Subcontracting Receipt, it may be `warehouse` or have `rejected_warehouse`
                            ref_item_row = r
                            break
                    if not ref_item_row:
                        frappe.throw(f"Item {item_row.item_code} not found in reference {ref_type} {ref_doc.name}.")

                    source_warehouse = getattr(ref_item_row, "warehouse", None)
                    # For subcontracting receipts, if warehouse not set, try rejected_warehouse
                    if not source_warehouse and ref_type == "Sub-Contract":
                        source_warehouse = getattr(ref_item_row, "rejected_warehouse", None)

                    if not source_warehouse:
                        frappe.throw(f"No source warehouse found for item {item_row.item_code} in {ref_type} {ref_doc.name}.")

                # prepare serials if any
                serials = serials_by_item.get(item_row.item_code) if serials_by_item else None
                serials_str = None
                if serials:
                    # ERPNext expects comma separated serial numbers in stock entry item serial_no field
                    serials_str = ",".join(serials)

                se_item = {
                    "item_code": item_row.item_code,
                    "s_warehouse": source_warehouse,
                    "t_warehouse": getattr(self, "accepted_warehouse", None),
                    "qty": accepted_qty,
                    "uom": item_row.uom,
                }
                if serials_str:
                    se_item["serial_no"] = serials_str

                se_items.append(se_item)

            created_se_name = None
            if se_items:
                se = frappe.new_doc("Stock Entry")
                se.stock_entry_type = "Material Transfer"
                se.company = company
                se.to_warehouse = getattr(self, "accepted_warehouse", None)
                se.reference_doctype = "QA Clearance" if frappe.db.has_column("Stock Entry", "reference_doctype") else None
                se.reference_name = self.name if se.reference_doctype else None
                # If you added a custom link field like `custom_qa_clearance` in Stock Entry, set it:
                if frappe.db.has_column("Stock Entry", "custom_qa_clearance"):
                    se.custom_qa_clearance = self.name
                # Append items
                for it in se_items:
                    se.append("items", {
                        "item_code": it["item_code"],
                        "s_warehouse": it["s_warehouse"],
                        "t_warehouse": it["t_warehouse"],
                        "qty": it["qty"],
                        "uom": it.get("uom"),
                        "serial_no": it.get("serial_no")
                    })
                se.insert(ignore_permissions=True)
                # submit stock entry
                se.submit()
                created_se_name = se.name
                frappe.msgprint(f"Stock Entry {se.name} created and submitted for accepted quantities.")

            # ---------------------------
            # 2) Purchase Receipt Return (draft) for rejected+rework if purchase_receipt present
            # ---------------------------
            pr_return_name = None
            if getattr(self, "purchase_receipt", None):
                pr_ref = frappe.get_doc("Purchase Receipt", self.purchase_receipt)
                pr_items = []
                # collect serials for Rejected or Rework
                serials_rej_by_item = {}
                if getattr(self, "has_serial_no", False):
                    for srow in getattr(self, "table_putu", []) or []:
                        if srow.serial_number and (srow.status in ("Rejected", "Rework")):
                            serials_rej_by_item.setdefault(srow.item, []).append(srow.serial_number)

                for item_row in getattr(self, "items", []) or []:
                    qty_to_return = (item_row.rejected_quantity or 0) + (item_row.rework_quantity or 0)
                    if qty_to_return <= 0:
                        continue

                    # rate: try get rate from original purchase receipt item row
                    rate = 0
                    for r in pr_ref.items:
                        if r.item_code == item_row.item_code:
                            # take rate if available
                            rate = getattr(r, "rate", 0) or 0
                            break

                    serials = serials_rej_by_item.get(item_row.item_code)
                    serials_str = ",".join(serials) if serials else None

                    pr_items.append({
                        "item_code": item_row.item_code,
                        "qty": -qty_to_return,   # negative qty for return (per your earlier requirement)
                        "uom": item_row.uom,
                        "rate": rate,
                        "serial_no": serials_str
                    })

                if pr_items:
                    pr_ret = frappe.new_doc("Purchase Receipt")
                    pr_ret.supplier = pr_ref.supplier
                    pr_ret.is_return = 1
                    pr_ret.purchase_receipt = pr_ref.name
                    pr_ret.posting_date = today()
                    pr_ret.company = company
                    # Append items
                    for it in pr_items:
                        pr_ret.append("items", {
                            "item_code": it["item_code"],
                            "qty": it["qty"],
                            "uom": it["uom"],
                            "rate": it["rate"],
                            "serial_no": it.get("serial_no")
                        })
                    pr_ret.insert(ignore_permissions=True)  # DRAFT (not submitted)
                    pr_return_name = pr_ret.name
                    frappe.msgprint(f"Purchase Receipt Return {pr_ret.name} created in Draft for rejected/rework items.")

            # ---------------------------
            # 3) Subcontracting Receipt Return (draft) for rejected+rework if subcontracting_receipt present
            # ---------------------------
            scr_return_name = None
            if getattr(self, "subcontracting_receipt", None):
                scr_ref = frappe.get_doc("Subcontracting Receipt", self.subcontracting_receipt)
                scr_items = []
                serials_scr_rej_by_item = {}
                if getattr(self, "has_serial_no", False):
                    for srow in getattr(self, "table_putu", []) or []:
                        if srow.serial_number and (srow.status in ("Rejected", "Rework")):
                            serials_scr_rej_by_item.setdefault(srow.item, []).append(srow.serial_number)

                for item_row in getattr(self, "items", []) or []:
                    qty_to_return = (item_row.rejected_quantity or 0) + (item_row.rework_quantity or 0)
                    if qty_to_return <= 0:
                        continue

                    serials = serials_scr_rej_by_item.get(item_row.item_code)
                    serials_str = ",".join(serials) if serials else None

                    scr_items.append({
                        "item_code": item_row.item_code,
                        "qty": -qty_to_return,  # negative qty per your previous pattern
                        "uom": item_row.uom,
                        "serial_no": serials_str
                    })

                if scr_items:
                    scr_ret = frappe.new_doc("Subcontracting Receipt")
                    scr_ret.is_return = 1
                    scr_ret.subcontracting_receipt = scr_ref.name
                    scr_ret.supplier = scr_ref.supplier if hasattr(scr_ref, "supplier") else None
                    scr_ret.posting_date = today()
                    scr_ret.company = company
                    for it in scr_items:
                        scr_ret.append("items", {
                            "item_code": it["item_code"],
                            "qty": it["qty"],
                            "uom": it["uom"],
                            "serial_no": it.get("serial_no")
                        })
                    scr_ret.insert(ignore_permissions=True)  # DRAFT
                    scr_return_name = scr_ret.name
                    frappe.msgprint(f"Subcontracting Receipt Return {scr_ret.name} created in Draft for rejected/rework items.")

            # Finished
            # Optionally set fields on QA Clearance to link to created documents
            # (only if such fields exist in your doctype)
            if created_se_name and hasattr(self, "stock_entry_reference"):
                self.db_set("stock_entry_reference", created_se_name)
            if pr_return_name and hasattr(self, "purchase_return"):
                self.db_set("purchase_return", pr_return_name)
            if scr_return_name and hasattr(self, "subcontracting_return"):
                self.db_set("subcontracting_return", scr_return_name)

        except Exception as e:
            frappe.log_error(message=str(e), title="QA Clearance Completion Processing Error")
            # Re-raise as user-facing exception so the user sees the reason
            frappe.throw(f"Error while processing QA Clearance completion: {e}")
