// Copyright (c) 2025, Acube and contributors
// For license information, please see license.txt

frappe.ui.form.on("QA Request", {
    reference_type: function(frm) {
        populate_qa_items(frm);
    },
    purchase_receipt: function(frm) {
        populate_qa_items(frm);
    },
    subcontracting_receipt: function(frm) {
        populate_qa_items(frm);
    },

    validate: function(frm) {
        for (let item of frm.doc.items) {
            let sum_qty = item.accepted_quantity + item.rejected_quantity + item.rework_quantity + item.hold_quantity;
            if (sum_qty > item.total_qty) {
                frappe.throw(`Total of Accepted/Rejected/Rework/Hold for item ${item.item_code} exceeds total_qty (${item.total_qty})`);
            }
        }
    },

    refresh: function(frm) {
        if (frm.doc.docstatus === 1 && frm.doc.transfer_to_qa_warehouse) {
            frm.add_custom_button(__('Transfer to QA Warehouse'), function() {
                frappe.call({
                    method: "a3_procurement.a3_procurement.doctype.qa_request.qa_request.create_stock_entry_from_qa_request",
                    args: { qa_request_name: frm.doc.name },
                    callback: function(r) {
                        if (!r.exc) {
                            frappe.msgprint("Stock Entry <b>" + r.message + "</b> created and submitted.");
                            frappe.reload_doc();
                        }
                    }
                });
            }, __("Create"));
        }
    }
});

// ---------------------- Helper Functions ----------------------
async function populate_qa_items(frm) {
    let ref_type = frm.doc.reference_type;
    let ref_name = ref_type === "Purchase" ? frm.doc.purchase_receipt : frm.doc.subcontracting_receipt;
    if (!ref_name) return;

    let doctype = ref_type === "Purchase" ? "Purchase Receipt" : "Subcontracting Receipt";

    let r = await frappe.db.get_doc(doctype, ref_name);
    if (!r) return;

    frm.set_value("supplier", r.supplier);

    frm.clear_table("items");
    frm.clear_table("table_putu");

    let enable_serial_checkbox = false;

    for (let d of r.items) {
        let item_flags_r = await frappe.db.get_value("Item", d.item_code, ["custom_inspection_required_before_billing", "has_serial_no"]);
        let item_flags = item_flags_r.message;

        if (item_flags.has_serial_no) enable_serial_checkbox = true;

        if (item_flags.custom_inspection_required_before_billing) {
            let row = frm.add_child("items");
            row.item_code = d.item_code;
            row.item_name = d.item_name;
            row.uom = d.uom || d.stock_uom;
            row.total_qty = d.qty;
            row.project = d.project;
            row.accepted_quantity = 0;
            row.rejected_quantity = 0;
            row.rework_quantity = 0;
            row.hold_quantity = 0;


            if (item_flags.has_serial_no && d.serial_no) {
                let serials = d.serial_no.split("\n").map(s => s.trim()).filter(Boolean);
                serials.forEach(s => {
                    let srow = frm.add_child("table_putu");
                    srow.item = d.item_code;
                    srow.serial_number = s;
                });
            }
        }
    }

    frm.set_value("has_serial_no", enable_serial_checkbox);
    frm.refresh_field("items");
    frm.refresh_field("table_putu");
}
