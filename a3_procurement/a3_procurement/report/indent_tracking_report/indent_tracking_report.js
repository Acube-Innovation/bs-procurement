// Copyright (c) 2025, Acube and contributors
// For license information, please see license.txt

// frappe.query_reports["Indent Tracking Report"] = {
//     "filters": [
//         {
//             "fieldname": "indent",
//             "label": __("Indent"),
//             "fieldtype": "Link",
//             "options": "Indent",
//         },
//         {
//             "fieldname": "indent_status",
//             "label": __("Indent Status"),
//             "fieldtype": "Select",
//             "options": ["", "Draft", "Submitted", "Cancelled"],
//         },
//     ]
// };

// Copyright (c) 2025, Acube and contributors
// For license information, please see license.txt

frappe.query_reports["Indent Tracking Report"] = {
    "filters": [
        {
            "fieldname": "indent",
            "label": __("Indent"),
            "fieldtype": "Link",
            "options": "Indent",
        },
        {
            "fieldname": "indent_status",
            "label": __("Indent Status"),
            "fieldtype": "Select",
            "options": ["", "Draft", "Submitted", "Cancelled"],
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
