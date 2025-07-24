// Copyright (c) 2025, Acube and contributors
// For license information, please see license.txt

frappe.ui.form.on('Tender Response', {
  indent_reference: function(frm) {
    if (frm.doc.indent_reference) {
      frm.clear_table("items");

      frappe.call({
        method: "frappe.client.get",
        args: {
          doctype: "Indent",
          name: frm.doc.indent_reference,
        },
        callback: function(r) {
          if (r.message && r.message.items) {
            let indent_items = r.message.items;

            indent_items.forEach(function(d) {
              let row = frm.add_child("items", {
                item: d.item,
                description: d.description,
                quantity: d.qty,
                unit: d.unit,
                delivery_period: d.required_date
              });
            });

            frm.refresh_field("items");
          }
        }
      });
    }
  }
});
