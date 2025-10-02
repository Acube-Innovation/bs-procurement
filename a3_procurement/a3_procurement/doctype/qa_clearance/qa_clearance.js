// Copyright (c) 2025, Acube and contributors
// For license information, please see license.txt

// frappe.ui.form.on("QA Clearance", {
// 	refresh(frm) {

// 	},
// });
frappe.ui.form.on("QA Clearance", {
    qa_request: function(frm) {
        if (frm.doc.qa_request) {
            frappe.call({
                method: "frappe.client.get",
                args: {
                    doctype: "QA Request",
                    name: frm.doc.qa_request
                },
                callback: function(r) {
                    if (r.message) {
                        let qa = r.message;

                        // Clear existing tables in QA Clearance
                        frm.clear_table("items");
                        frm.clear_table("table_putu");

                        // Copy items table
                        if (qa.items && qa.items.length) {
                            qa.items.forEach(i => {
                                let row = frm.add_child("items");
                                row.item_code = i.item_code;
                                row.item_name = i.item_name;
                                row.uom = i.uom;
                                row.total_qty = i.total_qty;
                                row.accepted_quantity = i.accepted_quantity;
                                row.rejected_quantity = i.rejected_quantity;
                                row.rework_quantity = i.rework_quantity;
                                row.hold_quantity = i.hold_quantity;
                            });
                        }

                        // Copy table_putu
                        if (qa.table_putu && qa.table_putu.length) {
                            qa.table_putu.forEach(t => {
                                let row = frm.add_child("table_putu");
                                row.item = t.item;
                                row.serial_number = t.serial_number;
                                row.status = t.status;
                            });
                        }

                        frm.refresh_field("items");
                        frm.refresh_field("table_putu");
                    }
                }
            });
        }
    }
});


frappe.ui.form.on("QA Item Detail", {
    status: function(frm) {
        calculate_qa_clearance_quantities(frm);
    },
    table_putu_add: function(frm) {
        calculate_qa_clearance_quantities(frm);
    },
    table_putu_remove: function(frm) {
        calculate_qa_clearance_quantities(frm);
    }
});

function calculate_qa_clearance_quantities(frm) {
    let items_map = {};
    frm.doc.items.forEach(item => {
        items_map[item.item_code] = {
            accepted_quantity: 0,
            rejected_quantity: 0,
            rework_quantity: 0,
            hold_quantity: 0,
            total_qty: item.total_qty || 0
        };
    });

    frm.doc.table_putu.forEach(row => {
        if (row.item && row.status) {
            let map = items_map[row.item];
            if (map) {
                switch (row.status) {
                    case "Accepted": map.accepted_quantity += 1; break;
                    case "Rejected": map.rejected_quantity += 1; break;
                    case "Rework": map.rework_quantity += 1; break;
                    case "Hold": map.hold_quantity += 1; break;
                }
            }
        }
    });

    frm.doc.items.forEach(item => {
        let map = items_map[item.item_code];
        if (map) {
            let sum_qty = map.accepted_quantity + map.rejected_quantity + map.rework_quantity + map.hold_quantity;
            if (sum_qty <= map.total_qty) {
                item.accepted_quantity = map.accepted_quantity;
                item.rejected_quantity = map.rejected_quantity;
                item.rework_quantity = map.rework_quantity;
                item.hold_quantity = map.hold_quantity;
            } else {
                frappe.msgprint(`Sum of statuses for item ${item.item_code} exceeds total_qty (${map.total_qty})`);
            }
        }
    });

    frm.refresh_field("items");
}
