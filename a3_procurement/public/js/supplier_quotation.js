// frappe.ui.form.on("Supplier Quotation", {
//     custom_tender_opening_reference: function(frm) {
//         if (!frm.doc.custom_tender_opening_reference) return;

//         // clear items first
//         frm.clear_table("items");

//         frappe.call({
//             method: "frappe.client.get",
//             args: {
//                 doctype: "Tender Opening",
//                 name: frm.doc.custom_tender_opening_reference
//             },
//             callback: function(res) {
//                 if (res.message) {
//                     let tender_opening = res.message;

//                     // ---- Populate Items from Tender Opening ----
//                     (tender_opening.particulars || []).forEach(row => {
//                         let item_row = frm.add_child("items");
//                         item_row.item_code = row.item;
//                         item_row.description = row.description;
//                         item_row.uom = row.uom;
//                         item_row.qty = row.quantity;
//                         item_row.expected_delivery_date = row.delivery_period;
//                     });
//                     frm.refresh_field("items");

//                     // ---- Filter Supplier field ----
//                     let allowed_vendors = (tender_opening.table_mzil || [])
//                         .filter(row => row.selected)
//                         .map(row => row.vendor);

//                     frm.set_query("supplier", function() {
//                         return {
//                             filters: [
//                                 ["Supplier", "name", "in", allowed_vendors]
//                             ]
//                         };
//                     });

//                     // If already set supplier is not in allowed list, clear it
//                     if (frm.doc.supplier && !allowed_vendors.includes(frm.doc.supplier)) {
//                         frm.set_value("supplier", null);
//                     }
//                 }
//             }
//         });
//     }
// });
frappe.ui.form.on("Supplier Quotation", {
    custom_tender_opening_reference: function(frm) {
        if (!frm.doc.custom_tender_opening_reference) return;

        // Clear items first
        frm.clear_table("items");

        frappe.call({
            method: "frappe.client.get",
            args: {
                doctype: "Tender Opening",
                name: frm.doc.custom_tender_opening_reference
            },
            callback: function(res) {
                if (res.message) {
                    let tender_opening = res.message;

                    // ---- Populate Items from Tender Opening ----
                    (tender_opening.particulars || []).forEach(row => {
                        let item_row = frm.add_child("items");
                        item_row.item_code = row.item;
                        item_row.description = row.description;
                        item_row.uom = row.uom;
                        item_row.qty = row.quantity;
                        item_row.expected_delivery_date = row.delivery_period;
                    });
                    frm.refresh_field("items");

                    // ---- Filter Supplier field ----
                    let allowed_vendors = (tender_opening.table_mzil || [])
                        .filter(row => row.selected)
                        .map(row => row.vendor);

                    frm.set_query("supplier", function() {
                        return {
                            filters: [
                                ["Supplier", "name", "in", allowed_vendors]
                            ]
                        };
                    });

                    // If already set supplier is not in allowed list, clear it
                    if (frm.doc.supplier && !allowed_vendors.includes(frm.doc.supplier)) {
                        frm.set_value("supplier", null);
                    }
                }
            }
        });
    },

    // Case 2: If Reference is SCR
    custom_scope_of_work: function(frm) {
        if (frm.doc.custom_reference !== "SCR" || !frm.doc.custom_scope_of_work) return;

        // Clear items first
        frm.clear_table("items");

        frappe.call({
            method: "frappe.client.get",
            args: {
                doctype: "SCR Scope",
                name: frm.doc.custom_scope_of_work
            },
            callback: function(res) {
                if (res.message) {
                    let scr_scope = res.message;

                    // ---- Populate Items from SCR Scope child table ----
                    (scr_scope.table_smtn || []).forEach(row => {
                        let item_row = frm.add_child("items");
                        item_row.item_code = row.scope_of_work;
                        item_row.custom_finished_good = row.name1;
                        item_row.custom_drawing_number = row.drawing_no;
                        item_row.qty = row.quantity;
                        item_row.uom = row.uom;
                        item_row.expected_delivery_date = row.delivery_date;
                        item_row.rate = row.rate;
                    });
                    frm.refresh_field("items");


                    // ---- Filter Supplier field ----
                    let allowed_vendors = (tender_opening.table_mzil || [])
                        .filter(row => row.selected)
                        .map(row => row.vendor);

                    frm.set_query("supplier", function() {
                        return {
                            filters: [
                                ["Supplier", "name", "in", allowed_vendors]
                            ]
                        };
                    });

                    // If already set supplier is not in allowed list, clear it
                    if (frm.doc.supplier && !allowed_vendors.includes(frm.doc.supplier)) {
                        frm.set_value("supplier", null);
                    }
                }
            }
        });
    }
});
