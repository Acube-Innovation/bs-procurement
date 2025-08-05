// Copyright (c) 2025, Acube and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Tender", {
// 	refresh(frm) {

// 	},
// });
frappe.ui.form.on('Tender', {
    purchase_indent_reference: function(frm) {
        if (frm.doc.purchase_indent_reference) {
            // Clear existing child table
            frm.clear_table("items");

            // Fetch the In-Principle Approval for CAPEX document
            frappe.call({
                method: "frappe.client.get",
                args: {
                    doctype: "Indent",
                    name: frm.doc.purchase_indent_reference
                },
                callback: function(r) {
                    if (r.message) {
                        let indent_doc = r.message;

                        // Loop through the particulars table and add to items table
                        (indent_doc.items || []).forEach(row => {
                            let child = frm.add_child("items");
                            child.item = row.item;
                            child.description = row.description;
                            child.quantity = row.qty;
                            child.unit = row.unit;
                            child.delivery_period = row.required_date;
                        });

                        frm.refresh_field("items");
                    }
                }
            });
        }
    }
});
