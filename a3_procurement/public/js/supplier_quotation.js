frappe.ui.form.on("Supplier Quotation", {
    custom_tender_opening_reference: function(frm) {
        if (!frm.doc.custom_tender_opening_reference) return;

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

                    (tender_opening.particulars || []).forEach(row => {
                        let item_row = frm.add_child("items");
                        item_row.item_code = row.item;
                        item_row.description = row.description;
                        item_row.uom = row.uom;
                        item_row.qty = row.quantity;
                        item_row.expected_delivery_date = row.delivery_period;
                    });

                    frm.refresh_field("items");
                    frappe.msgprint("Items fetched from Indent.");
                }
            }
        });
    }
});
