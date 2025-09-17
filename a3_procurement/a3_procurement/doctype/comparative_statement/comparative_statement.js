// Copyright (c) 2025, Acube and contributors
// For license information, please see license.txt

frappe.ui.form.on("Comparative Statement", {
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

frappe.ui.form.on('Comparative Statement', {
  tender_opening_reference(frm) {
    if (!frm.doc.tender_opening_reference) return;

    frm.clear_table('vendor_responses');

    // Fetch Supplier Quotations
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

    // Fetch Tender Opening Details and update counts
    frappe.call({
      method: 'frappe.client.get',
      args: {
        doctype: 'Tender Opening',
        name: frm.doc.tender_opening_reference
      },
      callback: function(r) {
        if (r.message && r.message.table_bcra) {
          const details = r.message.table_bcra;

          const total_parties = details.length;
          const quotations_received = details.filter(row => row.status === 'Received').length;

          frm.set_value('no_of_parties_contacted', total_parties);
          frm.set_value('no_of_quotation_received', quotations_received);

          // frappe.msgprint(__('Fetched Tender Opening stats: ') +
          //   `Parties Contacted: ${total_parties}, Quotations Received: ${quotations_received}`);
        }
      }
    });
  }
});


// frappe.ui.form.on('Comparative Statement', {
//   refresh(frm) {
//     frm.add_custom_button(__('Fetch Quotation Items'), () => {
//       fetch_supplier_quotation_items_and_taxes(frm);
//     });
//   }
// });

// async function fetch_supplier_quotation_items_and_taxes(frm) {
//   frm.clear_table('table_flub');
//   frm.clear_table('table_tobk');

//   let all_items = [];
//   let all_taxes = [];

//   for (const party of frm.doc.vendor_responses || []) {
//     const quotation_name = party.tender_response;
//     if (!quotation_name) continue;

//     const res = await frappe.call({
//       method: 'frappe.client.get',
//       args: {
//         doctype: 'Supplier Quotation',
//         name: quotation_name
//       }
//     });

//     const sq = res.message;
//     const supplier = sq.supplier;
//     const taxes = sq.total_taxes_and_charges;

//     // Save tax row
//     all_taxes.push({
//       vendor: supplier,
//       taxes_and_charges: taxes
//     });

//     for (const item of sq.items || []) {
//       all_items.push({
//         item: item.item_code,
//         description: item.description,
//         quantity: item.qty,
//         rate: item.rate,
//         total: item.amount,
//         supplier: supplier,
//         uom: item.uom,
//         required_date: item.expected_delivery_date,
//         finished_good: item.custom_finished_good,
//         drawing_no: item.custom_drawing_number
//       });
//     }
//   }

//   // Group items by item and assign price_rank
//   const grouped = {};
//   all_items.forEach(row => {
//     if (!grouped[row.item]) grouped[row.item] = [];
//     grouped[row.item].push(row);
//   });

//   for (const item_code in grouped) {
//     const group = grouped[item_code];
//     group.sort((a, b) => a.rate - b.rate);
//     group.forEach((row, idx) => {
//       row.price_rank = `L${idx + 1}`;
//     });
//   }

//   const sorted_rows = Object.values(grouped).flat().sort((a, b) =>
//     a.item.localeCompare(b.item)
//   );

//   for (const row_data of sorted_rows) {
//     frm.add_child('table_flub', row_data);
//   }

//   for (const tax_row of all_taxes) {
//     frm.add_child('table_tobk', tax_row);
//   }

//   frm.refresh_fields(['table_flub', 'table_tobk']);
//   frappe.msgprint('Quotation items and vendor taxes fetched.');
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
        supplier: supplier,
        uom: item.uom,
        required_date: item.expected_delivery_date,
        finished_good: item.custom_finished_good,
        drawing_no: item.custom_drawing_number
      });
    }
  }

  // --- Grouping Logic ---
  const grouped = {};
  for (const row of all_items) {
    let group_key;

    if (frm.doc.reference_type === "SCR") {
      // group by item + finished_good
      group_key = `${row.item || ""}::${row.finished_good || ""}`;
    } else {
      // group only by item (Indent case)
      group_key = row.item || "";
    }

    if (!grouped[group_key]) grouped[group_key] = [];
    grouped[group_key].push(row);
  }

  // --- Ranking by rate ---
  for (const key in grouped) {
    const group = grouped[key];
    group.sort((a, b) => a.rate - b.rate);
    group.forEach((row, idx) => {
      row.price_rank = `L${idx + 1}`;
    });
  }

  // Flatten & sort for consistent display
  const sorted_rows = Object.values(grouped).flat().sort((a, b) =>
    (a.item || "").localeCompare(b.item || "")
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



