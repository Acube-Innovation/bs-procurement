from frappe import _

def get_data(data=None):
    return {
        "heatmap": True,
        "heatmap_message": _("This is based on the Time Sheets created against this project"),
        "fieldname": "project",
        "transactions": [
            {
                "label": _("Project"),
                "items": ["Task", "Timesheet", "Issue", "Project Update"],
            },
            {"label": _("Material"), "items": ["Material Request", "BOM", "Stock Entry"]},
            {"label": _("Sales"), "items": ["Sales Order", "Delivery Note", "Sales Invoice"]},
            {"label": _("Purchase"), "items": ["Purchase Order", "Purchase Receipt", "Purchase Invoice","Purchase Approval","Purchase Recommendation","Purchase and Negotiation Committee"]},

            {"label": _("Procurement"), "items": [
                "In-Principle Approval for CAPEX",
                "Proprietory Article Certificate",
                "Indent",
                "Sub-Contract Request",
                "SCR Review",
                "Cost Estimate",
                
            ]},
            {"label": _("Tender"), "items": [
                "Tender",
                "Tender Opening",
                "Tender Response",
                "Supplier Quotation",
                "Comparative Statement"
            ]},
            {"label": _("Payment"), "items": ["Payment Entry"]},
        ],
    }
