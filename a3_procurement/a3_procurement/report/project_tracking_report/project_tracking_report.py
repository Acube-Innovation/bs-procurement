# Copyright (c) 2025, Acube and contributors
# For license information, please see license.txt

import frappe

def execute(filters=None):
    filters = filters or {}
    columns = get_columns()
    data = get_data(filters)
    return columns, data


def get_columns():
    return [
        {"label": "Project ID", "fieldname": "project", "fieldtype": "Link", "options": "Project", "width": 150},
        {"label": "Reference", "fieldname": "reference", "fieldtype": "Data", "width": 180},
        {"label": "Status", "fieldname": "status", "fieldtype": "Data", "width": 120},
        {"label": "SCR Review ID", "fieldname": "scr_review", "fieldtype": "Link", "options": "SCR Review", "width": 150},
        {"label": "SCR Review Status", "fieldname": "scr_review_status", "fieldtype": "Data", "width": 150},

        {"label": "Tender Enquiry", "fieldname": "tender_id", "fieldtype": "Link", "options": "Tender", "width": 150},
        {"label": "Tender Enquiry Status", "fieldname": "tender_status", "fieldtype": "Data", "width": 150},

        {"label": "Tender Response", "fieldname": "tender_response", "fieldtype": "Link", "options": "Tender Response", "width": 150},
        {"label": "Tender Response Status", "fieldname": "tender_response_status", "fieldtype": "Data", "width": 150},

        {"label": "Tender Opening", "fieldname": "tender_opening", "fieldtype": "Link", "options": "Tender Opening", "width": 150},
        {"label": "Tender Opening Status", "fieldname": "tender_opening_status", "fieldtype": "Data", "width": 150},

        {"label": "Supplier Quotation", "fieldname": "supplier_quotation", "fieldtype": "Link", "options": "Supplier Quotation", "width": 150},
        {"label": "Supplier Quotation Status", "fieldname": "supplier_quotation_status", "fieldtype": "Data", "width": 150},

        {"label": "Comparative Statement", "fieldname": "comparative_statement", "fieldtype": "Link", "options": "Comparative Statement", "width": 150},
        {"label": "Comparative Statement Status", "fieldname": "comparative_statement_status", "fieldtype": "Data", "width": 150},

        {"label": "Purchase Recommendation", "fieldname": "purchase_recommendation", "fieldtype": "Link", "options": "Purchase Recommendation", "width": 150},
        {"label": "Purchase Recommendation Status", "fieldname": "purchase_recommendation_status", "fieldtype": "Data", "width": 150},

        {"label": "Purchase Approval", "fieldname": "purchase_approval", "fieldtype": "Link", "options": "Purchase Approval", "width": 150},
        {"label": "Purchase Approval Status", "fieldname": "purchase_approval_status", "fieldtype": "Data", "width": 150},

        {"label": "Purchase and Negotiation Committee", "fieldname": "pnc", "fieldtype": "Link", "options": "Purchase and Negotiation Committee", "width": 200},
        {"label": "PNC Status", "fieldname": "pnc_status", "fieldtype": "Data", "width": 150},

        {"label": "Purchase Order", "fieldname": "purchase_order", "fieldtype": "Link", "options": "Purchase Order", "width": 150},
        {"label": "Purchase Order Status", "fieldname": "purchase_order_status", "fieldtype": "Data", "width": 150},
    ]


def get_data(filters):
    data = []
    project_filter = filters.get("project")
    from_date = filters.get("from_date")
    to_date = filters.get("to_date")

    # --- Fetch Indents ---
    indent_conditions = {}
    if project_filter:
        indent_conditions["project"] = project_filter
    if filters.get("indent"):
        indent_conditions["name"] = filters.get("indent")
    if from_date and to_date:
        indent_conditions["indent_date"] = ["between", [from_date, to_date]]

    indents = frappe.get_all("Indent", fields=["name", "document_status", "indent_date", "project"], filters=indent_conditions)

    for indent in indents:
        row = {
            "project": indent.project,
            "reference": indent.name,
            "status": indent.document_status,
        }

        # Fetch related docs (for Indent)
        row.update(get_linked_docs(indent.name, is_scr=False))
        data.append(row)

    # --- Fetch Sub-Contract Requests ---
    scr_conditions = {}
    if project_filter:
        scr_conditions["project"] = project_filter
    if filters.get("sub_contract_request"):
        scr_conditions["name"] = filters.get("sub_contract_request")
    if from_date and to_date:
        scr_conditions["scr_date"] = ["between", [from_date, to_date]]

    scrs = frappe.get_all("Sub-Contract Request", fields=["name", "document_status", "scr_date", "project"], filters=scr_conditions)

    for scr in scrs:
        row = {
            "project": scr.project,
            "reference": scr.name,
            "status": scr.document_status,
        }

        # SCR Review
        scr_review = frappe.db.get_value("SCR Review", {"scr_no": scr.name}, ["name", "workflow_state"], as_dict=True)
        if scr_review:
            row.update({
                "scr_review": scr_review.name,
                "scr_review_status": scr_review.workflow_state,
            })

        # Fetch related docs (for SCR)
        row.update(get_linked_docs(scr.name, is_scr=True))
        data.append(row)

    return data


def get_linked_docs(reference_name, is_scr=False):
    """Fetch all linked docs based on reference (Indent or SCR)."""
    linked_data = {}

    if is_scr:
        # Sub-Contract Request-based link fields
        mappings = {
            "Tender": ("scr_id", ["name", "status"]),
            "Tender Response": ("scr_reference", ["name", "status"]),
            "Tender Opening": ("scr_id", ["name", "status"]),
            "Supplier Quotation": ("custom_scr_reference", ["name", "status"]),
            "Comparative Statement": ("scr_request", ["name", "workflow_state"]),
            "Purchase Recommendation": ("scr_reference", ["name", "workflow_state"]),
            "Purchase Approval": ("scr_reference", ["name", "workflow_state"]),
            "Purchase and Negotiation Committee": ("scr_reference", ["name", "workflow_state"]),
            "Purchase Order": ("custom_scr_reference", ["name", "status"]),
        }
    else:
        # Indent-based link fields
        mappings = {
            "Tender": ("purchase_indent_reference", ["name", "status"]),
            "Tender Response": ("indent_reference", ["name", "status"]),
            "Tender Opening": ("purchase_indent", ["name", "status"]),
            "Supplier Quotation": ("custom_indent_reference", ["name", "status"]),
            "Comparative Statement": ("indent_id", ["name", "workflow_state"]),
            "Purchase Recommendation": ("indent_reference", ["name", "workflow_state"]),
            "Purchase Approval": ("indent_reference", ["name", "workflow_state"]),
            "Purchase and Negotiation Committee": ("indent_reference", ["name", "workflow_state"]),
            "Purchase Order": ("custom_indent_reference", ["name", "status"]),
        }

    for doctype, (field, fields_to_fetch) in mappings.items():
        record = frappe.db.get_value(doctype, {field: reference_name}, fields_to_fetch, as_dict=True)
        if record:
            fieldname_prefix = doctype.lower().replace(" ", "_")
            linked_data[f"{fieldname_prefix}"] = record.name
            linked_data[f"{fieldname_prefix}_status"] = record.get("status") or record.get("workflow_state")

    return linked_data
