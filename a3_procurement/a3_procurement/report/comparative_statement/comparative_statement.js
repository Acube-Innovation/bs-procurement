// Copyright (c) 2025, Acube and contributors
// For license information, please see license.txt

// frappe.query_reports["Comparative Statement"] = {
//     filters: [
//         {
//             fieldname: "tender",
//             label: "Tender",
//             fieldtype: "Link",
//             options: "Tender",
//             reqd: 1
//         },
//         {
//             fieldname: "categorize_by",
//             label: "Categorize By",
//             fieldtype: "Select",
//             options: ["Item", "Supplier"],
//             default: "Item"
//         },
//         {
//             fieldname: "supplier",
//             label: "Supplier",
//             fieldtype: "MultiSelectList",
//             get_data: function(txt) {
//                 const tender = frappe.query_report.get_filter_value("tender");
//                 if (!tender) return [];

//                 return frappe.db.get_list("Tender Response", {
//                     fields: ["vendor"],
//                     filters: { tender_reference: tender },
//                     distinct: true,
//                     limit: 100
//                 }).then(results => {
//                     return results.map(r => r.vendor);
//                 });
//             }
//         }
//     ]
// };
frappe.query_reports["Comparative Statement"] = {
    filters: [
        {
            fieldname: "tender",
            label: "Tender",
            fieldtype: "Link",
            options: "Tender",
            reqd: 1
        },
        {
            fieldname: "categorize_by",
            label: "Categorize By",
            fieldtype: "Select",
            options: ["Item", "Supplier"],
            default: "Item"
        },
        {
            fieldname: "supplier",
            label: "Supplier",
            fieldtype: "MultiSelectList",
            get_data: function(txt) {
                const tender = frappe.query_report.get_filter_value("tender");
                if (!tender) return [];

                return frappe.db.get_list("Tender Response", {
                    fields: ["vendor"],
                    filters: { tender_reference: tender },
                    distinct: true,
                    limit: 100
                }).then(results => {
                    return results.map(r => r.vendor);
                });
            }
        }
    ]
};
