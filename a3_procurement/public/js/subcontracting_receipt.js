frappe.ui.form.on("Subcontracting Receipt", {
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
                        reference_type: "Sub-Contract",
                        subcontracting_receipt: frm.doc.name
                    });
                });
            }
        }
    }
});
