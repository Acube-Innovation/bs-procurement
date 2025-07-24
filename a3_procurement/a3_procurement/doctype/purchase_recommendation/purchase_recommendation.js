// Copyright (c) 2025, Acube and contributors
// For license information, please see license.txt

// frappe.ui.form.on('Purchase Recommendation Detail', {
//     // Trigger the total calculation whenever qty or rate changes
//     quantity: function(frm, cdt, cdn) {
//         let child = locals[cdt][cdn];  // Get the current child row data
//         if (child.quantity && child.rate) {
//             child.total = child.quantity * child.rate;  // Calculate total
//         } else {
//             child.total = 0;  // If no qty or rate, set total to 0
//         }
//         frm.refresh_field('table_lylr');  // Refresh the child table to reflect the changes
//     },
//     rate: function(frm, cdt, cdn) {
//         let child = locals[cdt][cdn];  // Get the current child row data
//         if (child.quantity && child.rate) {
//             child.total = child.quantity * child.rate;  // Calculate total
//         } else {
//             child.total = 0;  // If no qty or rate, set total to 0
//         }
//         frm.refresh_field('table_lylr');  // Refresh the child table to reflect the changes
//     }
// });

frappe.ui.form.on('Purchase Recommendation', {
  comparative_statement(frm) {
    if (!frm.doc.comparative_statement) return;

    // Clear existing recommendation table
    frm.clear_table('table_lylr');

    // Get the table_flub rows from the selected Comparative Statement
    frappe.call({
      method: 'frappe.client.get',
      args: {
        doctype: 'Comparative Statement',
        name: frm.doc.comparative_statement
      },
      callback: function (res) {
        const comp_stmt = res.message;

        if (comp_stmt && comp_stmt.table_flub && comp_stmt.table_flub.length) {
          comp_stmt.table_flub.forEach(row => {
            if (row.recommended == 1) {
              const new_row = frm.add_child('table_lylr');
              new_row.item = row.item;
              new_row.description = row.description;
              new_row.supplier = row.supplier;
              new_row.quantity = row.quantity;
              new_row.rate = row.rate;
              new_row.total = row.total;
              new_row.price_rank = row.price_rank;
              new_row.recommended = row.recommended;
              new_row.reason = row.reason;
            }
          });

          frm.refresh_field('table_lylr');
          frappe.msgprint(__('Recommended items fetched from Comparative Statement.'));
        } else {
          frappe.msgprint(__('No data found in the selected Comparative Statement.'));
        }
      }
    });
  }
});
