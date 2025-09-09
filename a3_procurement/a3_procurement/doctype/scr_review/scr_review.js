// Copyright (c) 2025, Acube and contributors
// For license information, please see license.txt

// frappe.ui.form.on("SCR Review", {
// 	refresh(frm) {

// 	},
// });
frappe.ui.form.on("SCR Review", {
    scr_no: function(frm) {
        if (!frm.doc.scr_no) return;

        // clear old child table
        frm.clear_table("vendors_proposed_by_project_department");

        frappe.call({
            method: "frappe.client.get",
            args: {
                doctype: "Sub-Contract Request",
                name: frm.doc.scr_no
            },
            callback: function(res) {
                if (res.message) {
                    let scr_doc = res.message;

                    // loop through child table table_scrb in Sub-Contract Request
                    (scr_doc.table_scrb || []).forEach(row => {
                        let child = frm.add_child("vendors_proposed_by_project_department");
                        child.vendor = row.supplier; // map supplier → vendor
                    });

                    frm.refresh_field("vendors_proposed_by_project_department");
                }
            }
        });
    }
});
