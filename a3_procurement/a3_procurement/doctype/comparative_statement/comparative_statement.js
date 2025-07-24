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
  refresh(frm) {
    frm.add_custom_button(__('Fetch Items'), () => {
      fetch_tender_details_with_ranking(frm);
    });
  }
});

async function fetch_tender_details_with_ranking(frm) {
  frm.clear_table('table_flub');  // Clear existing rows

  let all_rows = [];

  for (const party of frm.doc.vendor_responses || []) {
    if (!party.tender_response) continue;

    const res = await frappe.call({
      method: 'frappe.client.get',
      args: {
        doctype: 'Tender Response',
        name: party.tender_response
      }
    });

    const tender_response = res.message;
    const vendor = tender_response.vendor;

    for (const item of tender_response.items || []) {
      all_rows.push({
        item: item.item,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        total: item.amount,
        supplier: vendor
      });
    }
  }

  // ✅ Group by item
  const grouped_items = {};

  for (const row of all_rows) {
    if (!grouped_items[row.item]) {
      grouped_items[row.item] = [];
    }
    grouped_items[row.item].push(row);
  }

  // ✅ Assign price_rank per item
  for (const [item_code, rows] of Object.entries(grouped_items)) {
    // Sort by rate (ascending)
    rows.sort((a, b) => a.rate - b.rate);

    // Assign rank
    rows.forEach((row, index) => {
      row.price_rank = `L${index + 1}`;
    });
  }

  // ✅ Flatten all grouped rows back into a single list and add to child table
  const final_rows = Object.values(grouped_items).flat();

  // Optional: sort by item to keep grouped visually
  final_rows.sort((a, b) => {
    if (a.item < b.item) return -1;
    if (a.item > b.item) return 1;
    return 0;
  });

  for (const row_data of final_rows) {
    const row = frm.add_child('table_flub', row_data);
  }

  frm.refresh_field('table_flub');
  frappe.msgprint(__('Items Fetched From Tender Responses'));
}

frappe.ui.form.on('Comparative Statement', {
  tender(frm) {
    if (!frm.doc.tender) return;

    // Clear existing entries
    frm.clear_table('vendor_responses');

    frappe.call({
      method: 'frappe.client.get_list',
      args: {
        doctype: 'Tender Response',
        filters: {
          tender_reference: frm.doc.tender
        },
        fields: ['name']
      },
      callback: function (res) {
        const responses = res.message || [];

        responses.forEach(response => {
          const row = frm.add_child('vendor_responses');
          row.tender_response = response.name;
        });

        frm.refresh_field('vendor_responses');
        frappe.msgprint(`${responses.length} Tender Response(s) added.`);
      }
    });
  }
});
