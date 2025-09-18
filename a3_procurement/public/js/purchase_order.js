
frappe.ui.form.on("Purchase Order", {
    custom_purchase_and_negotiation_committee_reference: function(frm) {
        if (!frm.doc.custom_purchase_and_negotiation_committee_reference) return;

        // Clear existing items
        frm.clear_table("items");

        frappe.call({
            method: "frappe.client.get",
            args: {
                doctype: "Purchase and Negotiation Committee",
                name: frm.doc.custom_purchase_and_negotiation_committee_reference
            },
            callback: function(res) {
                if (res.message) {
                    let committee = res.message;

                    // ---- Fetch and set Reference Type ----
                    if (committee.reference_type) {
                        frm.set_value("custom_reference_type", committee.reference_type);

                        if (committee.reference_type === "Indent" && committee.indent_reference) {
                            frm.set_value("custom_indent_reference", committee.indent_reference);
                        }
                        if (committee.reference_type === "SCR" && committee.scr_reference) {
                            frm.set_value("custom_scr_reference", committee.scr_reference);
                            frm.set_value("is_subcontracted", 1); // Enable subcontracting
                        }
                    }

                    // ---- Populate Items ----
                    (committee.table_zxij || []).forEach(row => {
                        let item_row = frm.add_child("items");

                        // First set item_code to trigger ERPNext default fetch
                        frappe.model.set_value(item_row.doctype, item_row.name, "item_code", row.item).then(() => {
                            // After ERPNext fills defaults, override description
                            frappe.model.set_value(item_row.doctype, item_row.name, "description", row.description);
                        });

                        // Other fields
                        item_row.qty = row.qty;
                        item_row.rate = row.rate;
                        item_row.uom = row.uom;
                        item_row.schedule_date = row.required_date;
                        item_row.fg_item = row.finished_good;
                        item_row.custom_drawing_no = row.drawing_no;
                        item_row.fg_item_qty = row.finished_good_quantity;

                        if (committee.project) {
                            item_row.project = committee.project;
                        }
                    });

                    frm.refresh_field("items");
                }
            }
        });
    },

    custom_purchase_approval_reference: function(frm) {
        if (!frm.doc.custom_purchase_approval_reference) return;

        // Clear existing items
        frm.clear_table("items");

        frappe.call({
            method: "frappe.client.get",
            args: {
                doctype: "Purchase Approval",
                name: frm.doc.custom_purchase_approval_reference
            },
            callback: function(res) {
                if (res.message) {
                    let approval = res.message;

                    // ---- Fetch and set Reference Type ----
                    if (approval.reference_type) {
                        frm.set_value("custom_reference_type", approval.reference_type);

                        if (approval.reference_type === "Indent" && approval.indent_reference) {
                            frm.set_value("custom_indent_reference", approval.indent_reference);
                        }
                        if (approval.reference_type === "SCR" && approval.scr_reference) {
                            frm.set_value("custom_scr_reference", approval.scr_reference);
                            frm.set_value("is_subcontracted", 1); // Enable subcontracting
                        }
                    }

                    // ---- Populate Items ----
                    (approval.table_higc || []).forEach(row => {
                        let item_row = frm.add_child("items");

                        // First set item_code to trigger ERPNext default fetch
                        frappe.model.set_value(item_row.doctype, item_row.name, "item_code", row.item).then(() => {
                            // After ERPNext fills defaults, override description
                            frappe.model.set_value(item_row.doctype, item_row.name, "description", row.description);
                        });

                        // Other fields
                        item_row.qty = row.qty;
                        item_row.rate = row.rate;
                        item_row.uom = row.uom;
                        item_row.schedule_date = row.required_date;
                        item_row.fg_item = row.finished_good;
                        item_row.custom_drawing_no = row.drawing_no;
                        item_row.fg_item_qty = row.finished_good_quantity;

                        if (approval.project) {
                            item_row.project = approval.project;
                        }
                    });

                    frm.refresh_field("items");
                }
            }
        });
    }
});
