// frappe.ui.form.on("Subcontracting Receipt", {
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
//                         reference_type: "Sub-Contract",
//                         subcontracting_receipt: frm.doc.name
//                     });
//                 });
//             }
//         }
//     }
// });

frappe.ui.form.on("Subcontracting Receipt", {
    refresh: async function(frm) {
        if (frm.doc.docstatus !== 1) return; // only after submission

        // 🔎 Check if any QA Request exists (Draft or Submitted)
        const existing_qa = await frappe.db.get_list('QA Request', {
            filters: {
                subcontracting_receipt: frm.doc.name,
                docstatus: ["in", [0, 1]]   // Draft or Submitted
            },
            limit: 1
        });

        // ❌ QA Request already exists → do NOT show button
        if (existing_qa.length > 0) {
            return;
        }

        // ✔ Otherwise check item flags for inspection requirement
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

        // ✔ Show QA button if needed
        if (show_button) {
            frm.add_custom_button(__('QA'), function() {
                frappe.new_doc('QA Request', {
                    reference_type: "Sub-Contract",
                    subcontracting_receipt: frm.doc.name
                });
            });
        }
    }
});
