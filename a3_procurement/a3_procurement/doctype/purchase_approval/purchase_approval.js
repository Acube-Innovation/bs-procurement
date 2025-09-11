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

frappe.ui.form.on('Purchase Approval', {
  purchase_recommendation: async function(frm) {
    if (!frm.doc.purchase_recommendation) return;

    // Clear existing child tables
    frm.clear_table('item_description');
    frm.clear_table('table_fbtg');
    frm.clear_table('table_higc');

    // Fetch linked Purchase Recommendation document
    const res = await frappe.call({
      method: 'frappe.client.get',
      args: {
        doctype: 'Purchase Recommendation',
        name: frm.doc.purchase_recommendation
      }
    });

    const pr = res.message;
    const details = pr.table_lylr || [];

    const seen_items = new Set();

    details.forEach(detail => {
      // 1. item_description (unique items)
      if (!seen_items.has(detail.item)) {
        seen_items.add(detail.item);
        frm.add_child('item_description', {
          item: detail.item,
          description: detail.description
        });
      }

      // 2. table_fbtg (all supplier-price-rank-reason rows)
      frm.add_child('table_fbtg', {
        item: detail.item,
        supplier: detail.supplier,
        price_rank: detail.price_rank,
        reason: detail.reason
      });

      // 3. table_higc (full detail rows)
      frm.add_child('table_higc', {
        item: detail.item,
        description: detail.description,
        qty: detail.quantity,
        rate: detail.rate,
        amount: detail.total,
        required_date: detail.required_date,
        uom: detail.uom,
        finished_good: detail.finished_good,
        drawing_no: detail.drawing_no
      });
    });

    frm.refresh_fields(['item_description', 'table_fbtg', 'table_higc']);
    frappe.msgprint(__('Details fetched from Purchase Recommendation'));
  }
});
