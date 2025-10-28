// Copyright (c) 2025, Acube and contributors
// For license information, please see license.txt

frappe.query_reports["Project Tracking Report"] = {
    "filters": [
        {
            "fieldname": "project",
            "label": __("Project"),
            "fieldtype": "Link",
            "options": "Project",
        },
        {
            "fieldname": "indent",
            "label": __("Indent"),
            "fieldtype": "Link",
            "options": "Indent",
        },
        {
            "fieldname": "sub_contract_request",
            "label": __("Sub-Contract Request"),
            "fieldtype": "Link",
            "options": "Sub-Contract Request",
        },
        {
            "fieldname": "from_date",
            "label": __("From Date"),
            "fieldtype": "Date",
        },
        {
            "fieldname": "to_date",
            "label": __("To Date"),
            "fieldtype": "Date",
        },
    ]
};
