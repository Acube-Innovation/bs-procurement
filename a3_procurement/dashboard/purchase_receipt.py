from frappe import _


def get_data(data=None):
	return {
		"fieldname": "purchase_receipt_no",
		"non_standard_fieldnames": {
			"Purchase Invoice": "purchase_receipt",
			"Asset": "purchase_receipt",
			"Landed Cost Voucher": "receipt_document",
			"Auto Repeat": "reference_document",
			"Purchase Receipt": "return_against",
			"Stock Reservation Entry": "from_voucher_no",
			# "Quality Inspection": "reference_name",
			"QA Request": "purchase_receipt",
			"QA Clearance": "purchase_receipt"
		},
		"internal_links": {
			"Material Request": ["items", "material_request"],
			"Purchase Order": ["items", "purchase_order"],
			"Project": ["items", "project"],
			"QA Request": ["items", "purchase_receipt"],
			"QA Clearance": ["items", "purchase_receipt"],
		},
		"transactions": [
			{
				"label": _("Related"),
				"items": ["Purchase Invoice", "Landed Cost Voucher", "Asset", "Stock Reservation Entry"],
			},
			{
				"label": _("Reference"),
				"items": ["Material Request", "Purchase Order", "Project"],
			},
			{"label": _("Returns"), "items": ["Purchase Receipt"]},
			{"label": _("Subscription"), "items": ["Auto Repeat"]},
			{"label": _("QA"), "items": ["QA Request","QA Clearance"]},
        ],  
    }
	   
# from frappe import _


# def get_data(data=None):
#     return {
#         "fieldname": "purchase_receipt_no",
#         "non_standard_fieldnames": {
#             "Purchase Invoice": "purchase_receipt",
#             "Asset": "purchase_receipt",
#             "Landed Cost Voucher": "receipt_document",
#             "Auto Repeat": "reference_document",
#             "Purchase Receipt": "return_against",
#             "Stock Reservation Entry": "from_voucher_no",
#             "Quality Inspection": "reference_name",
#             "QA Request": "purchase_receipt"
#         },
#         "internal_links": {
#             "Material Request": ["items", "material_request"],
#             "Purchase Order": ["items", "purchase_order"],
#             "Project": ["items", "project"],
#         },
#         "transactions": [
#             {
#                 "label": _("Related"),
#                 "items": ["Purchase Invoice", "Landed Cost Voucher", "Asset", "Stock Reservation Entry"],
#             },
#             {
#                 "label": _("Reference"),
#                 "items": ["Material Request", "Purchase Order", "Quality Inspection", "Project"],
#             },
#             {"label": _("Returns"), "items": ["Purchase Receipt"]},
#             {"label": _("Subscription"), "items": ["Auto Repeat"]},

#             {
#                 "label": _("Procurement"),
#                 "items": [
#                     {
#                         "doctype": "QA Request",
#                         "no_create": True    # 🔥 hides the + button
#                     }
#                 ]
#             },
#         ],
#     }
