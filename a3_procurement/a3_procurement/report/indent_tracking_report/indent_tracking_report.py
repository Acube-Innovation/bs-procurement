# import frappe

# def execute(filters=None):
#     filters = filters or {}
#     columns = get_columns()
#     data = get_data(filters)
#     return columns, data


# def get_columns():
#     return [
#         {"label": "Indent ID", "fieldname": "indent_id", "fieldtype": "Link", "options": "Indent", "width": 150},
#         {"label": "Indent Status", "fieldname": "indent_status", "fieldtype": "Data", "width": 150},
#         {"label": "Tender Enquiry", "fieldname": "tender_id", "fieldtype": "Link", "options": "Tender", "width": 150},
#         {"label": "Tender Enquiry Status", "fieldname": "tender_status", "fieldtype": "Data", "width": 150},
#         {"label": "Tender Response", "fieldname": "tender_response", "fieldtype": "Link", "options": "Tender Response", "width": 150},
#         {"label": "Tender Response Status", "fieldname": "tender_response_status", "fieldtype": "Data", "width": 150},
#         {"label": "Tender Opening", "fieldname": "tender_opening", "fieldtype": "Link", "options": "Tender Opening", "width": 150},
#         {"label": "Tender Opening Status", "fieldname": "tender_opening_status", "fieldtype": "Data", "width": 150},
#         {"label": "Supplier Quotation", "fieldname": "supplier_quotation", "fieldtype": "Link", "options": "Supplier Quotation", "width": 150},
#         {"label": "Supplier Quotation Status", "fieldname": "supplier_quotation_status", "fieldtype": "Data", "width": 150},
#         {"label": "Comparative Statement", "fieldname": "comparative_statement", "fieldtype": "Link", "options": "Comparative Statement", "width": 150},
#         {"label": "Comparative Statement Status", "fieldname": "comparative_statement_status", "fieldtype": "Data", "width": 150},
#         {"label": "Purchase Recommendation", "fieldname": "purchase_recommendation", "fieldtype": "Link", "options": "Purchase Recommendation", "width": 150},
#         {"label": "Purchase Recommendation Status", "fieldname": "purchase_recommendation_status", "fieldtype": "Data", "width": 150},
#         {"label": "Purchase Approval", "fieldname": "purchase_approval", "fieldtype": "Link", "options": "Purchase Approval", "width": 150},
#         {"label": "Purchase Approval Status", "fieldname": "purchase_approval_status", "fieldtype": "Data", "width": 150},
#         {"label": "Purchase and Negotiation Committee", "fieldname": "pnc", "fieldtype": "Link", "options": "Purchase and Negotiation Committee", "width": 180},
#         {"label": "PNC Status", "fieldname": "pnc_status", "fieldtype": "Data", "width": 150},
#         {"label": "Purchase Order", "fieldname": "purchase_order", "fieldtype": "Link", "options": "Purchase Order", "width": 150},
#         {"label": "Purchase Order Status", "fieldname": "purchase_order_status", "fieldtype": "Data", "width": 150},
#     ]


# def get_data(filters):
#     conditions = {}
#     if filters.get("indent"):
#         conditions["name"] = filters.get("indent")
#     if filters.get("indent_status"):
#         conditions["document_status"] = filters.get("indent_status")

#     indents = frappe.get_all("Indent", fields=["name", "document_status"], filters=conditions)
#     data = []

#     for indent in indents:
#         row = {
#             "indent_id": indent.name,
#             "indent_status": indent.document_status,
#         }

#         # Tender Enquiry
#         tender = frappe.db.get_value("Tender", {"purchase_indent_reference": indent.name}, ["name", "status"], as_dict=True)
#         if tender:
#             row.update({
#                 "tender_id": tender.name,
#                 "tender_status": tender.status,
#             })

#         # Tender Response
#         response = frappe.db.get_value("Tender Response", {"indent_reference": indent.name}, ["name", "status"], as_dict=True)
#         if response:
#             row.update({
#                 "tender_response": response.name,
#                 "tender_response_status": response.status,
#             })

#         # Tender Opening
#         opening = frappe.db.get_value("Tender Opening", {"purchase_indent": indent.name}, ["name", "status"], as_dict=True)
#         if opening:
#             row.update({
#                 "tender_opening": opening.name,
#                 "tender_opening_status": opening.status,
#             })

#         # Supplier Quotation
#         quotation = frappe.db.get_value("Supplier Quotation", {"custom_indent_reference": indent.name}, ["name", "status"], as_dict=True)
#         if quotation:
#             row.update({
#                 "supplier_quotation": quotation.name,
#                 "supplier_quotation_status": quotation.status,
#             })

#         # Comparative Statement
#         cs = frappe.db.get_value("Comparative Statement", {"indent_id": indent.name}, ["name", "workflow_state"], as_dict=True)
#         if cs:
#             row.update({
#                 "comparative_statement": cs.name,
#                 "comparative_statement_status": cs.workflow_state,
#             })

#         # Purchase Recommendation
#         pr = frappe.db.get_value("Purchase Recommendation", {"indent_reference": indent.name}, ["name", "workflow_state"], as_dict=True)
#         if pr:
#             row.update({
#                 "purchase_recommendation": pr.name,
#                 "purchase_recommendation_status": pr.workflow_state,
#             })

#         # Purchase Approval
#         paf = frappe.db.get_value("Purchase Approval", {"indent_reference": indent.name}, ["name", "workflow_state"], as_dict=True)
#         if paf:
#             row.update({
#                 "purchase_approval": paf.name,
#                 "purchase_approval_status": paf.workflow_state,
#             })

#         # PNC
#         pnc = frappe.db.get_value("Purchase and Negotiation Committee", {"indent_reference": indent.name}, ["name", "workflow_state"], as_dict=True)
#         if pnc:
#             row.update({
#                 "pnc": pnc.name,
#                 "pnc_status": pnc.workflow_state,
#             })

#         # Purchase Order
#         po = frappe.db.get_value("Purchase Order", {"custom_indent_reference": indent.name}, ["name", "status"], as_dict=True)
#         if po:
#             row.update({
#                 "purchase_order": po.name,
#                 "purchase_order_status": po.status,
#             })

#         data.append(row)

#     return data


import frappe

def execute(filters=None):
    filters = filters or {}
    columns = get_columns()
    data = get_data(filters)
    return columns, data


def get_columns():
    return [
        {"label": "Indent ID", "fieldname": "indent_id", "fieldtype": "Link", "options": "Indent", "width": 150},
        {"label": "Indent Status", "fieldname": "indent_status", "fieldtype": "Data", "width": 150},
        {"label": "Indent Date", "fieldname": "indent_date", "fieldtype": "Date", "width": 120},

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

        {"label": "Purchase and Negotiation Committee", "fieldname": "pnc", "fieldtype": "Link", "options": "Purchase and Negotiation Committee", "width": 180},
        {"label": "PNC Status", "fieldname": "pnc_status", "fieldtype": "Data", "width": 150},

        {"label": "Purchase Order", "fieldname": "purchase_order", "fieldtype": "Link", "options": "Purchase Order", "width": 150},
        {"label": "Purchase Order Status", "fieldname": "purchase_order_status", "fieldtype": "Data", "width": 150},
    ]


def get_data(filters):
    conditions = {}
    if filters.get("indent"):
        conditions["name"] = filters.get("indent")
    if filters.get("indent_status"):
        conditions["document_status"] = filters.get("indent_status")

    # Handle date range filters
    if filters.get("from_date") and filters.get("to_date"):
        conditions["indent_date"] = ["between", [filters.get("from_date"), filters.get("to_date")]]
    elif filters.get("from_date"):
        conditions["indent_date"] = [">=", filters.get("from_date")]
    elif filters.get("to_date"):
        conditions["indent_date"] = ["<=", filters.get("to_date")]

    indents = frappe.get_all(
        "Indent",
        fields=["name", "document_status", "indent_date"],
        filters=conditions,
        order_by="indent_date desc"
    )

    data = []

    for indent in indents:
        row = {
            "indent_id": indent.name,
            "indent_status": indent.document_status,
            "indent_date": indent.indent_date,
        }

        # Tender Enquiry
        tender = frappe.db.get_value("Tender", {"purchase_indent_reference": indent.name}, ["name", "status"], as_dict=True)
        if tender:
            row.update({
                "tender_id": tender.name,
                "tender_status": tender.status,
            })

        # Tender Response
        response = frappe.db.get_value("Tender Response", {"indent_reference": indent.name}, ["name", "status"], as_dict=True)
        if response:
            row.update({
                "tender_response": response.name,
                "tender_response_status": response.status,
            })

        # Tender Opening
        opening = frappe.db.get_value("Tender Opening", {"purchase_indent": indent.name}, ["name", "status"], as_dict=True)
        if opening:
            row.update({
                "tender_opening": opening.name,
                "tender_opening_status": opening.status,
            })

        # Supplier Quotation
        quotation = frappe.db.get_value("Supplier Quotation", {"custom_indent_reference": indent.name}, ["name", "status"], as_dict=True)
        if quotation:
            row.update({
                "supplier_quotation": quotation.name,
                "supplier_quotation_status": quotation.status,
            })

        # Comparative Statement
        cs = frappe.db.get_value("Comparative Statement", {"indent_id": indent.name}, ["name", "workflow_state"], as_dict=True)
        if cs:
            row.update({
                "comparative_statement": cs.name,
                "comparative_statement_status": cs.workflow_state,
            })

        # Purchase Recommendation
        pr = frappe.db.get_value("Purchase Recommendation", {"indent_reference": indent.name}, ["name", "workflow_state"], as_dict=True)
        if pr:
            row.update({
                "purchase_recommendation": pr.name,
                "purchase_recommendation_status": pr.workflow_state,
            })

        # Purchase Approval
        paf = frappe.db.get_value("Purchase Approval", {"indent_reference": indent.name}, ["name", "workflow_state"], as_dict=True)
        if paf:
            row.update({
                "purchase_approval": paf.name,
                "purchase_approval_status": paf.workflow_state,
            })

        # PNC
        pnc = frappe.db.get_value("Purchase and Negotiation Committee", {"indent_reference": indent.name}, ["name", "workflow_state"], as_dict=True)
        if pnc:
            row.update({
                "pnc": pnc.name,
                "pnc_status": pnc.workflow_state,
            })

        # Purchase Order
        po = frappe.db.get_value("Purchase Order", {"custom_indent_reference": indent.name}, ["name", "status"], as_dict=True)
        if po:
            row.update({
                "purchase_order": po.name,
                "purchase_order_status": po.status,
            })

        data.append(row)

    return data

