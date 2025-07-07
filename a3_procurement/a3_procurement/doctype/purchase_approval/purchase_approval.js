// Copyright (c) 2025, Acube and contributors
// For license information, please see license.txt

frappe.ui.form.on("Purchase Approval", {
    // refresh(frm) {

    // }
    payment_terms_template: function(frm) {
        // Triggering the server-side method when payment_terms field is changed
       frappe.call({
                method: "erpnext.controllers.accounts_controller.get_payment_terms",
                args: {
                    terms_template: frm.doc.payment_terms_template,
                    posting_date: frm.doc.date    ,
                    grand_total: frm.doc.estimated_cost_of_tender,
                    base_grand_total: frm.doc.estimated_cost_of_tender,
                },
                callback: function(r) {
                    if(r.message && !r.exc) {
                        frm.set_value("payment_schedule", r.message);
                    }
                }
            })
    }
});