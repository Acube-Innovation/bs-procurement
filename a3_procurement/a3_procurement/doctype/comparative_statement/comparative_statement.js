// Copyright (c) 2025, Acube and contributors
// For license information, please see license.txt

frappe.ui.form.on("Comparative Statement", {
	// refresh(frm) {

	// }
    payment_terms_template: function(frm) {
       frappe.call({
				method: "erpnext.controllers.accounts_controller.get_payment_terms",
				args: {
					terms_template: frm.doc.payment_terms_template,
					posting_date: frm.doc.due_on    ,
					grand_total: frm.doc.total,
					base_grand_total: frm.doc.total,
				},
				callback: function(r) {
					if(r.message && !r.exc) {
						frm.set_value("payment_schedule", r.message);
					}
				}
			})
    }
});

frappe.ui.form.on('Comparative Statement  Details', {
    // Trigger the total calculation whenever qty or rate changes
    qty_no: function(frm, cdt, cdn) {
        let child = locals[cdt][cdn];  // Get the current child row data
        if (child.qty_no && child.rate) {
            child.amount = child.qty_no * child.rate;  // Calculate total
        } else {
            child.amount = 0;  // If no qty or rate, set total to 0
        }
        frm.refresh_field('table_qfpf');  // Refresh the child table to reflect the changes
    },
    rate: function(frm, cdt, cdn) {
        let child = locals[cdt][cdn];  // Get the current child row data
        if (child.qty_no && child.rate) {
            child.amount = child.qty_no * child.rate;  // Calculate total
        } else {
            child.amount = 0;  // If no qty or rate, set total to 0
        }
        frm.refresh_field('table_qfpf');  // Refresh the child table to reflect the changes
    }
});
