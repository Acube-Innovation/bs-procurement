// Copyright (c) 2025, Acube and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Purchase and Negotiation Committee", {
// 	refresh(frm) {

// 	},
// });

frappe.ui.form.on('Purchase and Negotiation Committee', {
  pnc_committee: function(frm) {
    if (frm.doc.pnc_committee) {
      frm.clear_table("table_lilx");

      frappe.call({
        method: "frappe.client.get",
        args: {
          doctype: "PNC Committee",
          name: frm.doc.pnc_committee
        },
        callback: function(r) {
          if (r.message && r.message.committee) {
            r.message.committee.forEach(function(d) {
              let row = frm.add_child("table_lilx", {
                members: d.members,
                invitees: d.invitees
              });
            });
            frm.refresh_field("table_lilx");
          }
        }
      });
    }
  }
});

frappe.ui.form.on("Purchase and Negotiation Committee", {
    payment_terms: function(frm) {
        // Triggering the server-side method when payment_terms field is changed
       frappe.call({
                method: "erpnext.controllers.accounts_controller.get_payment_terms",
                args: {
                    terms_template: frm.doc.payment_terms,
                    posting_date: frm.doc.date    ,
                    grand_total: frm.doc.estimated_cost_of_tender,
                    base_grand_total: frm.doc.estimated_cost_of_tender,
                },
                callback: function(r) {
                    if(r.message && !r.exc) {
                        frm.set_value("table_ciim", r.message);
                    }
                }
            })
    }
});

// frappe.ui.form.on('Purchase and Negotiation Committee', {
//   purchase_recommendation_reference: async function(frm) {
//     if (!frm.doc.purchase_recommendation_reference) return;

//     // Clear previous data
//     frm.clear_table('table_zxij');
//     frm.clear_table('table_doig');

//     // Fetch Purchase Recommendation and its child table
//     const res = await frappe.call({
//       method: 'frappe.client.get',
//       args: {
//         doctype: 'Purchase Recommendation',
//         name: frm.doc.purchase_recommendation_reference
//       }
//     });

//     const pr = res.message;
//     const details = pr.table_lylr || [];

//     const supplierSet = new Set();

//     for (const row of details) {
//       // Add to Purchase Recommendation Detail
//       frm.add_child('table_zxij', {
//         item: row.item,
//         supplier: row.supplier,
//         quantity: row.quantity,
//         rate: row.rate,
//         total: row.total,
//         price_rank: row.price_rank,
//         recommended: row.recommended,
//         reason: row.reason,
//         description: row.description
//       });

//       // Collect unique supplier-price_rank pairs for Source Details
//       const key = row.supplier + row.price_rank;
//       if (row.supplier && row.price_rank && !supplierSet.has(key)) {
//         supplierSet.add(key);
//         frm.add_child('table_doig', {
//           supplier: row.supplier,
//           price_rank: row.price_rank
//         });
//       }
//     }

//     frm.refresh_fields(['table_zxij', 'table_doig']);
//     frappe.msgprint(__('Details fetched from Purchase Recommendation.'));
//   }
// });


frappe.ui.form.on('Purchase and Negotiation Committee', {
  purchase_recommendation_reference: async function(frm) {
    if (!frm.doc.purchase_recommendation_reference) return;

    // Clear previous data
    frm.clear_table('table_zxij');
    frm.clear_table('table_doig');

    // Fetch Purchase Recommendation and its child table
    const res = await frappe.call({
      method: 'frappe.client.get',
      args: {
        doctype: 'Purchase Recommendation',
        name: frm.doc.purchase_recommendation_reference
      }
    });

    const pr = res.message;
    const details = pr.table_lylr || [];
    const supplierSet = new Set();

    for (const row of details) {
      // 1. Add to table_zxij (Purchase Recommendation Detail)
      frm.add_child('table_zxij', {
        item: row.item,
        supplier: row.supplier,
        quantity: row.quantity,
        rate: row.rate,
        total: row.total,
        price_rank: row.price_rank,
        recommended: row.recommended,
        reason: row.reason,
        description: row.description
      });

      // 2. Add unique supplier + price_rank to table_doig (Source Details)
      const key = row.supplier + row.price_rank;
      if (row.supplier && row.price_rank && !supplierSet.has(key)) {
        supplierSet.add(key);
        frm.add_child('table_doig', {
          supplier: row.supplier,
          price_rank: row.price_rank
        });
      }
    }

    frm.refresh_fields(['table_zxij', 'table_doig']);

    // 3. Fetch value_including_tax and value_wo_tax from Supplier Quotation
    await update_supplier_quotation_values(frm);

    frappe.msgprint(__('Details fetched from Purchase Recommendation.'));
  }
});

async function update_supplier_quotation_values(frm) {
  const tender_opening_ref = frm.doc.tender_opening_reference;
  if (!tender_opening_ref) return;

  for (let row of frm.doc.table_doig || []) {
    if (!row.supplier) continue;

    const res = await frappe.call({
      method: "frappe.client.get_list",
      args: {
        doctype: "Supplier Quotation",
        filters: {
          supplier: row.supplier,
          custom_tender_opening_reference: tender_opening_ref
        },
        fields: ["name", "rounded_total", "total"],
        limit_page_length: 1
      }
    });

    if (res.message && res.message.length > 0) {
      const sq = res.message[0];
      frappe.model.set_value(row.doctype, row.name, 'value_including_tax', sq.rounded_total);
      frappe.model.set_value(row.doctype, row.name, 'value_wo_tax', sq.total);
    }
  }
}


frappe.ui.form.on('Purchase and Negotiation Committee', {
  estimated_costa: function(frm) {
    calculate_ab(frm);
  },
  actual_costb: function(frm) {
    calculate_ab(frm);
  }
});

function calculate_ab(frm) {
  const est = flt(frm.doc.estimated_costa);
  const act = flt(frm.doc.actual_costb);
  frm.set_value('ab', est - act);
}
