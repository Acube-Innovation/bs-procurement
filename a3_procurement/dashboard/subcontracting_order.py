from frappe import _


def get_data(data=None):
	return {
		"fieldname": "subcontracting_order",
		"internal_links": {
			"Gate Entry": ["items", "gate_entry"],
		},
		"transactions": [{"label": _("Reference"), "items": ["Subcontracting Receipt", "Stock Entry", "Gate Entry"]}],
	}
