# Copyright (c) 2025, Acube and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class CostEstimate(Document):

    def after_insert(self):
        """After Cost Estimate is created, auto-link it to Indent or Sub-Contract Request"""
        
        if self.type == "Purchase" and self.indent_reference:
            # Update Indent with Cost Estimate ID
            frappe.db.set_value(
                "Indent",
                self.indent_reference,
                "cost_estimate",
                self.name
            )

            # Also update Indent child table from Cost Estimate purchase_estimate
            indent_doc = frappe.get_doc("Indent", self.indent_reference)
            indent_doc.set("table_ckhr", [])  # clear old
            for row in self.purchase_estimate:
                indent_doc.append("table_ckhr", {
                    "item": row.item,
                    "quantity": row.quantity,
                    "estimated_cost_batl": row.estimated_cost_batl,
                    "total_estimated_cost": row.total_estimated_cost
                })

            # update totals
            indent_doc.total = self.total
            indent_doc.gst = self.gst
            indent_doc.new_total = self.new_total
            indent_doc.save(ignore_permissions=True)

        elif self.type == "Sub-Contract" and self.sub_contract_reference:
            # Update Sub-Contract Request with Cost Estimate ID
            frappe.db.set_value(
                "Sub-Contract Request",
                self.sub_contract_reference,
                "cost_estimate",
                self.name
            )

            # Also update SCR child table from Cost Estimate sub_contract_estimate
            scr_doc = frappe.get_doc("Sub-Contract Request", self.sub_contract_reference)
            scr_doc.set("table_xpza", [])  # clear old
            for row in self.sub_contract_estimate:
                scr_doc.append("table_xpza", {
                    "itempart_name": row.itempart_name,
                    "drawing_no": row.drawing_no,
                    "quantity": row.quantity,
                    "material": row.material,
                    "batl_estimated_cost_to_vendorqty": row.batl_estimated_cost_to_vendorqty,
                    "total_estimated_cost": row.total_estimated_cost
                })

            # update totals
            scr_doc.total = self.total
            scr_doc.gst = self.gst
            scr_doc.net_total = self.new_total
            scr_doc.save(ignore_permissions=True)
