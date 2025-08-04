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


// frappe.ui.form.on('Comparative Statement', {
//   refresh(frm) {
//     frm.add_custom_button(__('Fetch Items'), () => {
//       fetch_tender_details_grouped(frm);
//     });
//   }
// });

// async function fetch_tender_details_grouped(frm) {
//   frm.clear_table('table_flub');  // Clear existing rows

//   let all_rows = [];

//   for (const party of frm.doc.vendor_responses || []) {
//     if (!party.tender_response) continue;

//     const res = await frappe.call({
//       method: 'frappe.client.get',
//       args: {
//         doctype: 'Tender Response',
//         name: party.tender_response
//       }
//     });

//     const tender_response = res.message;
//     const vendor = tender_response.vendor;

//     for (const item of tender_response.items || []) {
//       all_rows.push({
//         item: item.item,
//         description: item.description,
//         quantity: item.quantity,
//         rate: item.rate,
//         total: item.amount,
//         supplier: vendor
//       });
//     }
//   }

//   // ✅ Grouping by item (sort by item name)
//   all_rows.sort((a, b) => {
//     if (a.item < b.item) return -1;
//     if (a.item > b.item) return 1;
//     return 0;
//   });

//   // ✅ Add to child table
//   for (const row_data of all_rows) {
//     const row = frm.add_child('table_flub', row_data);
//   }
// }

frappe.ui.form.on('Comparative Statement', {
  tender_opening_reference(frm) {
    if (!frm.doc.tender_opening_reference) return;

    frm.clear_table('vendor_responses');

    frappe.call({
      method: 'frappe.client.get_list',
      args: {
        doctype: 'Supplier Quotation',
        filters: {
          custom_tender_opening_reference: frm.doc.tender_opening_reference
        },
        fields: ['name']
      },
      callback: function (res) {
        const quotations = res.message || [];

        quotations.forEach(quotation => {
          const row = frm.add_child('vendor_responses');
          row.tender_response = quotation.name;
        });

        frm.refresh_field('vendor_responses');
        frappe.msgprint(`${quotations.length} Supplier Quotation(s) added.`);
      }
    });
  }
});



// frappe.ui.form.on('Comparative Statement', {
//   refresh(frm) {
//     frm.add_custom_button(__('Fetch Quotation Items'), () => {
//       fetch_supplier_quotation_items(frm);
//     });
//   }
// });

// async function fetch_supplier_quotation_items(frm) {
//   frm.clear_table('table_flub'); // Clear existing entries

//   let all_rows = [];

//   for (const party of frm.doc.vendor_responses || []) {
//     const quotation_name = party.tender_response;
//     if (!quotation_name) continue;

//     // Fetch Supplier Quotation with items
//     const res = await frappe.call({
//       method: 'frappe.client.get',
//       args: {
//         doctype: 'Supplier Quotation',
//         name: quotation_name
//       }
//     });

//     const sq = res.message;
//     const supplier = sq.supplier;

//     for (const item of sq.items || []) {
//       all_rows.push({
//         item: item.item_code,
//         description: item.description,
//         quantity: item.qty,
//         rate: item.rate,
//         total: item.amount,
//         supplier: supplier
//       });
//     }
//   }

//   // Group by item and assign price_rank
//   const grouped = {};

//   all_rows.forEach(row => {
//     if (!grouped[row.item]) grouped[row.item] = [];
//     grouped[row.item].push(row);
//   });

//   for (const item_code in grouped) {
//     const group = grouped[item_code];

//     // Sort by rate
//     group.sort((a, b) => a.rate - b.rate);

//     // Assign price_rank
//     group.forEach((row, idx) => {
//       row.price_rank = `L${idx + 1}`;
//     });
//   }

//   // Flatten and sort grouped rows by item
//   const sorted_rows = Object.values(grouped).flat().sort((a, b) => {
//     return a.item.localeCompare(b.item);
//   });

//   // Add to table_flub
//   for (const row_data of sorted_rows) {
//     frm.add_child('table_flub', row_data);
//   }

//   frm.refresh_field('table_flub');
//   frappe.msgprint('Supplier Quotation items fetched with price ranks (L1, L2, etc).');
// }

frappe.ui.form.on('Comparative Statement', {
  refresh(frm) {
    frm.add_custom_button(__('Fetch Quotation Items'), () => {
      fetch_supplier_quotation_items_and_taxes(frm);
    });
  }
});

async function fetch_supplier_quotation_items_and_taxes(frm) {
  frm.clear_table('table_flub');
  frm.clear_table('table_tobk');

  let all_items = [];
  let all_taxes = [];

  for (const party of frm.doc.vendor_responses || []) {
    const quotation_name = party.tender_response;
    if (!quotation_name) continue;

    const res = await frappe.call({
      method: 'frappe.client.get',
      args: {
        doctype: 'Supplier Quotation',
        name: quotation_name
      }
    });

    const sq = res.message;
    const supplier = sq.supplier;
    const taxes = sq.total_taxes_and_charges;

    // Save tax row
    all_taxes.push({
      vendor: supplier,
      taxes_and_charges: taxes
    });

    for (const item of sq.items || []) {
      all_items.push({
        item: item.item_code,
        description: item.description,
        quantity: item.qty,
        rate: item.rate,
        total: item.amount,
        supplier: supplier
      });
    }
  }

  // Group items by item and assign price_rank
  const grouped = {};
  all_items.forEach(row => {
    if (!grouped[row.item]) grouped[row.item] = [];
    grouped[row.item].push(row);
  });

  for (const item_code in grouped) {
    const group = grouped[item_code];
    group.sort((a, b) => a.rate - b.rate);
    group.forEach((row, idx) => {
      row.price_rank = `L${idx + 1}`;
    });
  }

  const sorted_rows = Object.values(grouped).flat().sort((a, b) =>
    a.item.localeCompare(b.item)
  );

  for (const row_data of sorted_rows) {
    frm.add_child('table_flub', row_data);
  }

  for (const tax_row of all_taxes) {
    frm.add_child('table_tobk', tax_row);
  }

  frm.refresh_fields(['table_flub', 'table_tobk']);
  frappe.msgprint('Quotation items and vendor taxes fetched.');
}
