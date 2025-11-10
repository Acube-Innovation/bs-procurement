// Copyright (c) 2025, Acube and contributors
// For license information, please see license.txt

frappe.ui.form.on('Comparative Statement', {
  async tender_opening_reference(frm) {
    if (!frm.doc.tender_opening_reference) return;

    frm.clear_table('vendor_responses');

    // Fetch Supplier Quotations linked to Tender Opening
    const quotations_res = await frappe.call({
      method: 'frappe.client.get_list',
      args: {
        doctype: 'Supplier Quotation',
        filters: {
          custom_tender_opening_reference: frm.doc.tender_opening_reference
        },
        fields: ['name']
      }
    });

    const quotations = quotations_res.message || [];

    quotations.forEach(quotation => {
      const row = frm.add_child('vendor_responses');
      row.tender_response = quotation.name;
    });

    frm.refresh_field('vendor_responses');
    frappe.msgprint(`${quotations.length} Supplier Quotation(s) added.`);

    // Fetch Tender Opening Details (for counts)
    const tender_res = await frappe.call({
      method: 'frappe.client.get',
      args: {
        doctype: 'Tender Opening',
        name: frm.doc.tender_opening_reference
      }
    });

    if (tender_res.message && tender_res.message.table_bcra) {
      const details = tender_res.message.table_bcra;
      const total_parties = details.length;
      const quotations_received = details.filter(row => row.status === 'Received').length;

      frm.set_value('no_of_parties_contacted', total_parties);
      frm.set_value('no_of_quotation_received', quotations_received);
    }

    // Automatically fetch quotation items, taxes & totals
    await fetch_supplier_quotation_items_and_taxes(frm);
  }
});

// -------------------- Fetch Supplier Quotation Data --------------------

async function fetch_supplier_quotation_items_and_taxes(frm) {
  frm.clear_table('table_flub');
  frm.clear_table('taxes_and_charges');
  frm.clear_table('totals');

  let all_items = [];
  let all_taxes = [];
  let totals_list = [];

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

    // ---- Fetch Quotation Items ----
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
        drawing_no: item.custom_drawing_number,
        finished_good_quantity: item.custom_finished_good_quantity
      });
    }

    // ---- Fetch Taxes & Charges ----
    for (const tax of sq.taxes || []) {
      all_taxes.push({
        supplier: supplier,
        chargesaccount_head: tax.account_head,
        rate: tax.rate,
        amount: tax.tax_amount
      });
    }

    // ---- Compute Totals (Based on New CST Totals Doctype) ----
    let unit_price = sq.total || 0;
    let unit_tax = 0;
    let other_charges = 0;
    let other_charges_tax = 0;
    let grand_total = sq.rounded_total || 0;

    // Calculate unit_tax from items (sum of all tax fields)
    for (const item of sq.items || []) {
      unit_tax +=
        (item.igst_amount || 0) +
        (item.cgst_amount || 0) +
        (item.sgst_amount || 0) +
        (item.cess_amount || 0) +
        (item.cess_non_advol_amount || 0);
    }

    // Calculate other charges and other charges tax from taxes table
    for (const tax of sq.taxes || []) {
      if (tax.custom_charges_type === "Charges") {
        other_charges += tax.tax_amount || 0;
      } else if (tax.custom_charges_type === "Tax") {
        other_charges_tax += tax.tax_amount || 0;
      }
    }

    totals_list.push({
      supplier: supplier,
      unit_price: unit_price,
      unit_tax: unit_tax,
      other_charges: other_charges,
      other_charges_tax: other_charges_tax,
      grand_total: grand_total
    });
  }

  // --- Grouping Logic for Items ---
  const grouped = {};
  for (const row of all_items) {
    let group_key;

    if (frm.doc.reference_type === "SCR") {
      group_key = `${row.item || ""}::${row.finished_good || ""}`;
    } else {
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

  // --- Add Items to Comparative Statement ---
  for (const row_data of sorted_rows) {
    frm.add_child('table_flub', row_data);
  }

  // --- Group Taxes by Supplier & Account Head ---
  const tax_group = {};
  for (const tax of all_taxes) {
    const key = `${tax.supplier}::${tax.chargesaccount_head}`;
    if (!tax_group[key]) {
      tax_group[key] = {
        supplier: tax.supplier,
        chargesaccount_head: tax.chargesaccount_head,
        rate: tax.rate,
        amount: 0
      };
    }
    tax_group[key].amount += tax.amount;
  }

  // --- Add Taxes to Comparative Statement ---
  for (const tax_row of Object.values(tax_group)) {
    frm.add_child('taxes_and_charges', tax_row);
  }

  // --- Add Totals to Comparative Statement (CST Totals) ---
  for (const total_row of totals_list) {
    frm.add_child('totals', total_row);
  }

  frm.refresh_fields(['table_flub', 'taxes_and_charges', 'totals']);
  frappe.msgprint('Quotation items, taxes, and totals fetched automatically.');
}

// frappe.ui.form.on('table_flub', {
//   item: function (frm, cdt, cdn) {
//     let row = locals[cdt][cdn];
//     let child_table = frm.doc.table_flub || [];

//     // Get all rows that have the same item
//     let matching_rows = child_table.filter(r => r.item === row.item);

//     // If this is the first occurrence of the item
//     if (matching_rows.length === 1 && row.item) {
//       frappe.db.get_value('Item', row.item, 'item_name', (r) => {
//         if (r && r.item_name) {
//           frappe.model.set_value(cdt, cdn, 'item_name', r.item_name);
//         }
//       });
//     } else {
//       // For duplicates, clear the item_name
//       frappe.model.set_value(cdt, cdn, 'item_name', '');
//     }
//   }
// });
