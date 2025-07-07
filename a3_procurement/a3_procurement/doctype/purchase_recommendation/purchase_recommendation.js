// Copyright (c) 2025, Acube and contributors
// For license information, please see license.txt

frappe.ui.form.on('Purchase Recommendation Detail', {
    // Trigger the total calculation whenever qty or rate changes
    quantity: function(frm, cdt, cdn) {
        let child = locals[cdt][cdn];  // Get the current child row data
        if (child.quantity && child.rate) {
            child.total = child.quantity * child.rate;  // Calculate total
        } else {
            child.total = 0;  // If no qty or rate, set total to 0
        }
        frm.refresh_field('table_lylr');  // Refresh the child table to reflect the changes
    },
    rate: function(frm, cdt, cdn) {
        let child = locals[cdt][cdn];  // Get the current child row data
        if (child.quantity && child.rate) {
            child.total = child.quantity * child.rate;  // Calculate total
        } else {
            child.total = 0;  // If no qty or rate, set total to 0
        }
        frm.refresh_field('table_lylr');  // Refresh the child table to reflect the changes
    }
});