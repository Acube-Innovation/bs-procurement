// Copyright (c) 2025, Acube and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Gate Entry", {
//     reference_doctype: function(frm) {
//         frm.set_value("document", "");

//         frm.set_query("document", function() {
//             let filters = { docstatus: ["!=", 2] }; // Exclude cancelled documents

//             // Apply specific filters
//             if (frm.doc.reference_doctype === "Material Request") {
//                 filters["material_request_type"] = "Customer Provided";
//             }

//             if (frm.doc.reference_doctype === "Purchase Order") {
//                 filters["is_subcontracted"] = 0;
//             }

//             return {
//                 filters: filters,
//                 doctype: frm.doc.reference_doctype
//             };
//         });
//     },

//     document: function(frm) {
//         if (!frm.doc.reference_doctype || !frm.doc.document) return;

//         // Clear Gate Entry Details first
//         frm.clear_table("items");

//         frappe.call({
//             method: "frappe.client.get",
//             args: {
//                 doctype: frm.doc.reference_doctype,
//                 name: frm.doc.document
//             },
//             callback: function(r) {
//                 if (r.message) {
//                     const doc = r.message;

//                     // ✅ Fetch supplier or customer based on doctype
//                     if (["Purchase Order", "Subcontracting Order"].includes(frm.doc.reference_doctype)) {
//                         frm.set_value("supplier", doc.supplier || "");
//                         frm.set_value("customer", "");
//                     } else if (["Sales Order", "Material Request"].includes(frm.doc.reference_doctype)) {
//                         frm.set_value("customer", doc.customer || "");
//                         frm.set_value("supplier", "");
//                     }

//                     // ✅ Fetch child table details (Gate Entry Detail)
//                     if (doc.items && doc.items.length) {
//                         doc.items.forEach(row => {
//                             let child = frm.add_child("items");
//                             child.item_code = row.item_code;
//                             child.item_name = row.item_name;
//                             child.qty = row.qty;
//                             child.uom = row.uom;
//                             child.description = row.description;
//                         });
//                         frm.refresh_field("items");
//                     }
//                 }
//             }
//         });
//     }
// });


frappe.ui.form.on("Gate Entry", {

    reference_doctype(frm) {
        frm.set_value("document", "");
        
        // Clear all link fields
        frm.set_value("purchase_order", "");
        frm.set_value("sales_order", "");
        frm.set_value("subcontracting_order", "");
        frm.set_value("material_request", "");

        frm.set_query("document", function() {
            let filters = { docstatus: ["!=", 2] };

            if (frm.doc.reference_doctype === "Material Request") {
                filters["material_request_type"] = "Customer Provided";
            }

            if (frm.doc.reference_doctype === "Purchase Order") {
                filters["is_subcontracted"] = 0;
            }

            return {
                filters: filters,
                doctype: frm.doc.reference_doctype
            };
        });
    },

    document(frm) {
        if (!frm.doc.reference_doctype || !frm.doc.document) return;

        // Reset all Link fields
        frm.set_value("purchase_order", "");
        frm.set_value("sales_order", "");
        frm.set_value("subcontracting_order", "");
        frm.set_value("material_request", "");

        // Map reference_doctype → fieldname
        const field_map = {
            "Purchase Order": "purchase_order",
            "Sales Order": "sales_order",
            "Subcontracting Order": "subcontracting_order",
            "Material Request": "material_request"
        };

        // Set the correct link field
        if (field_map[frm.doc.reference_doctype]) {
            frm.set_value(field_map[frm.doc.reference_doctype], frm.doc.document);
        }

        // Clear Gate Entry Items
        frm.clear_table("items");

        frappe.call({
            method: "frappe.client.get",
            args: {
                doctype: frm.doc.reference_doctype,
                name: frm.doc.document
            },
            callback(r) {
                if (!r.message) return;

                const doc = r.message;

                // Set supplier or customer
                if (["Purchase Order", "Subcontracting Order"].includes(frm.doc.reference_doctype)) {
                    frm.set_value("supplier", doc.supplier || "");
                    frm.set_value("customer", "");
                } else if (["Sales Order", "Material Request"].includes(frm.doc.reference_doctype)) {
                    frm.set_value("customer", doc.customer || "");
                    frm.set_value("supplier", "");
                }

                // Child table items
                if (doc.items && doc.items.length) {
                    doc.items.forEach(row => {
                        const child = frm.add_child("items");
                        child.item_code = row.item_code;
                        child.item_name = row.item_name;
                        child.qty = row.qty;
                        child.uom = row.uom;
                        child.description = row.description;
                    });
                    frm.refresh_field("items");
                }
            }
        });
    }
});
