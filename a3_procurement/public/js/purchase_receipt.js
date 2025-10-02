
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
frappe.ui.form.on("Purchase Receipt", {
    refresh: async function(frm) {
        if (frm.doc.docstatus === 1) { // only show when submitted

            let show_button = false;

            for (let d of frm.doc.items) {
                let item_flags = await frappe.db.get_value("Item", d.item_code, 
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
    }
});


// frappe.ui.form.on("Purchase Receipt", {
//     before_submit: async function(frm) {
//         let qa_required = false;

//         for (const d of frm.doc.items || []) {
//             if (d.item_code) {
//                 let r = await frappe.db.get_value("Item", d.item_code, "custom_inspection_required_before_billing");
//                 if (r && r.message && r.message.custom_inspection_required_before_billing) {
//                     qa_required = true;
//                     break; // no need to check further if one item requires QA
//                 }
//             }
//         }

//         if (qa_required) {
//             frappe.msgprint({
//                 title: __("QA Required"),
//                 message: __("Complete QA before creating Purchase Invoice."),
//                 indicator: "orange"
//             });
//         }
//     }
// });


