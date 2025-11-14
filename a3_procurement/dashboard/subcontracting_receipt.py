from frappe import _


def get_data(data=None):
	return {
		"fieldname": "subcontracting_receipt",
		"non_standard_fieldnames": {
			"Subcontracting Receipt": "return_against",
			"QA Request": "subcontracting_receipt",
			"QA Clearance": "subcontracting_receipt"
		},
		"internal_links": {
			"Subcontracting Order": ["items", "subcontracting_order"],
			"Purchase Order": ["items", "purchase_order"],
			"Project": ["items", "project"],
			# "Quality Inspection": ["items", "quality_inspection"],
			"QA Request": ["items", "subcontracting_receipt"],
            "QA Clearance": ["items", "subcontracting_receipt"],
		},
		"transactions": [
			{
				"label": _("Reference"),
				"items": [
					"Purchase Order",
					"Purchase Receipt",
					"Subcontracting Order",
					# "Quality Inspection",
					"Project",
				],
			},
			
			{"label": _("QA"), "items": ["QA Request","QA Clearance"]},
			{"label": _("Returns"), "items": ["Subcontracting Receipt"]},
		],
	}
