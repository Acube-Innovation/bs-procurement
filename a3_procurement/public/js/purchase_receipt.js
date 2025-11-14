
// frappe.ui.form.on("Purchase Receipt", {
//     refresh: function(frm) {
//         if (frm.doc.docstatus === 1) {   // only show when submitted
//             frm.add_custom_button(__('QA'), function() {
//                 frappe.new_doc('QA Request', {
//                     purchase_receipt: frm.doc.name,
//                     purchase_order: frm.doc.purchase_order
//                 });
//             }, __('Create'));  // puts it under "Create" group
//         }
//     }
// });

// frappe.ui.form.on("Purchase Receipt", {
//     refresh: function(frm) {
//         if (frm.doc.docstatus === 1) {   // only show when submitted
//             frm.add_custom_button(__('QA'), function() {
//                 frappe.new_doc('QA Request', {
//                     purchase_receipt: frm.doc.name,
//                     purchase_order: frm.doc.purchase_order
//                 });
//             });
//         }
//     }
// });
// frappe.ui.form.on("Purchase Receipt", {
//     refresh: async function(frm) {
//         if (frm.doc.docstatus === 1) { // only show when submitted

//             let show_button = false;

//             for (let d of frm.doc.items) {
//                 let item_flags = await frappe.db.get_value("Item", d.item_code, 
//                     "custom_inspection_required_before_billing"
//                 ).then(r => r.message);

//                 if (item_flags && item_flags.custom_inspection_required_before_billing) {
//                     show_button = true;
//                     break;
//                 }
//             }

//             if (show_button) {
//                 frm.add_custom_button(__('QA'), function() {
//                     frappe.new_doc('QA Request', {
//                         reference_type: "Purchase",
//                         purchase_receipt: frm.doc.name
//                     });
//                 });
//             }
//         }
//     }
// });


frappe.ui.form.on("Purchase Receipt", {
    refresh: async function(frm) {
        if (frm.doc.docstatus !== 1) return; // only for submitted PR

        // 🔎 Check if ANY QA Request exists (Draft or Submitted)
        const existing_qa = await frappe.db.get_list('QA Request', {
            filters: {
                purchase_receipt: frm.doc.name,
                docstatus: ["in", [0, 1]]   // Draft or Submitted
            },
            limit: 1
        });

        if (existing_qa.length > 0) {
            // ❌ Already linked QA Request → hide button
            return;
        }

        // ✔ No QA Request exists → check item flags
        let show_button = false;

        for (let d of frm.doc.items) {
            let item_flags = await frappe.db.get_value(
                "Item",
                d.item_code,
                "custom_inspection_required_before_billing"
            ).then(r => r.message);

            if (item_flags && item_flags.custom_inspection_required_before_billing) {
                show_button = true;
                break;
            }
        }

        if (show_button) {
            frm.add_custom_button(__('QA'), function() {
                frappe.new_doc('QA Request', {
                    reference_type: "Purchase",
                    purchase_receipt: frm.doc.name
                });
            });
        }
    }
});
