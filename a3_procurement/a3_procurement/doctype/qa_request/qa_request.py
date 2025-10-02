# Copyright (c) 2025, Acube and contributors
# For license information, please see license.txt


import frappe
from frappe.model.document import Document
from frappe.utils import today

class QARequest(Document):
    pass


# @frappe.whitelist()
# def create_stock_entry_from_qa_request(qa_request_name):
#     qa_request = frappe.get_doc("QA Request", qa_request_name)

#     if not qa_request.qa_warehouse:
#         frappe.throw("Please set QA Warehouse in QA Request")

#     # Determine reference doc
#     if qa_request.reference_type == "Purchase" and qa_request.purchase_receipt:
#         ref_doc = frappe.get_doc("Purchase Receipt", qa_request.purchase_receipt)
#     elif qa_request.reference_type == "Sub-Contract" and qa_request.subcontracting_receipt:
#         ref_doc = frappe.get_doc("Subcontracting Receipt", qa_request.subcontracting_receipt)
#     else:
#         frappe.throw("Invalid Reference Type or missing reference document.")

#     company = getattr(ref_doc, "company", None)
#     if not company:
#         frappe.throw("Company not found in reference document.")

#     # Create Stock Entry
#     stock_entry = frappe.new_doc("Stock Entry")
#     stock_entry.stock_entry_type = "Material Transfer"
#     stock_entry.to_warehouse = qa_request.qa_warehouse
#     stock_entry.company = company
#     stock_entry.reference_doctype = "QA Request"
#     stock_entry.reference_name = qa_request.name

#     # Determine source warehouse
#     source_warehouse = None
#     for item in ref_doc.items:
#         if getattr(item, "warehouse", None):
#             source_warehouse = item.warehouse
#             break
#     if not source_warehouse:
#         frappe.throw(f"No source warehouse found from {qa_request.reference_type} Receipt.")

#     # Add items to Stock Entry
#     for d in qa_request.items:
#         if d.total_qty > 0:
#             stock_entry.append("items", {
#                 "item_code": d.item_code,
#                 "s_warehouse": source_warehouse,
#                 "t_warehouse": qa_request.qa_warehouse,
#                 "qty": d.total_qty,
#                 "uom": d.uom
#             })

#     stock_entry.insert()
#     stock_entry.submit()

#     return stock_entry.name

@frappe.whitelist()
def create_stock_entry_from_qa_request(qa_request_name):
    qa_request = frappe.get_doc("QA Request", qa_request_name)

    if not qa_request.qa_warehouse:
        frappe.throw("Please set QA Warehouse in QA Request")

    # Check if a Stock Entry already exists for this QA Request
    existing_se = frappe.db.get_value(
        "Stock Entry",
        {"custom_qa_request": qa_request.name},
        "name"
    )
    if existing_se:
        frappe.msgprint(f"Stock Entry <b>{existing_se}</b> already exists for this QA Request.")
        return existing_se

    # Determine reference doc
    if qa_request.reference_type == "Purchase" and qa_request.purchase_receipt:
        ref_doc = frappe.get_doc("Purchase Receipt", qa_request.purchase_receipt)
    elif qa_request.reference_type == "Sub-Contract" and qa_request.subcontracting_receipt:
        ref_doc = frappe.get_doc("Subcontracting Receipt", qa_request.subcontracting_receipt)
    else:
        frappe.throw("Invalid Reference Type or missing reference document.")

    company = getattr(ref_doc, "company", None)
    if not company:
        frappe.throw("Company not found in reference document.")

    # Create Stock Entry
    stock_entry = frappe.new_doc("Stock Entry")
    stock_entry.stock_entry_type = "Material Transfer"
    stock_entry.to_warehouse = qa_request.qa_warehouse
    stock_entry.company = company
    stock_entry.custom_qa_request = qa_request.name  # <-- set the custom link

    # Determine source warehouse for each item individually
    for item in qa_request.items:
        ref_item = None
        for r in ref_doc.items:
            if r.item_code == item.item_code:
                ref_item = r
                break

        if not ref_item:
            frappe.throw(f"Item {item.item_code} not found in {qa_request.reference_type} Receipt.")

        source_warehouse = getattr(ref_item, "warehouse", None)
        if not source_warehouse and qa_request.reference_type == "Sub-Contract":
            source_warehouse = getattr(ref_item, "rejected_warehouse", None)

        if not source_warehouse:
            frappe.throw(f"No source warehouse found for item {item.item_code} in {qa_request.reference_type} Receipt.")

        if item.total_qty > 0:
            stock_entry.append("items", {
                "item_code": item.item_code,
                "s_warehouse": source_warehouse,
                "t_warehouse": qa_request.qa_warehouse,
                "qty": item.total_qty,
                "uom": item.uom
            })

    stock_entry.insert()
    stock_entry.submit()

    return stock_entry.name

