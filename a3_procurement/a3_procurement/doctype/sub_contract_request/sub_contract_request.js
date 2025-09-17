// Copyright (c) 2025, Acube and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Sub-Contract Request", {
// 	refresh(frm) {

// 	},
// });
frappe.ui.form.on("Sub-Contract Request", {
    cost_estimate: function(frm) {
        if (frm.doc.cost_estimate) {
            // Clear existing Estimate table in Indent
            frm.clear_table("table_xpza");

            frappe.call({
                method: "frappe.client.get",
                args: {
                    doctype: "Cost Estimate",
                    name: frm.doc.cost_estimate
                },
                callback: function(r) {
                    if (r.message) {
                        let cost_estimate_doc = r.message;

                        // Fetch child table if type = Purchase
                        if (cost_estimate_doc.type === "Sub-Contract" && cost_estimate_doc.sub_contract_estimate) {
                            (cost_estimate_doc.sub_contract_estimate || []).forEach(row => {
                                let child = frm.add_child("table_xpza");
                                child.itempart_name = row.itempart_name;
                                child.drawing_no = row.drawing_no;
                                child.quantity = row.quantity;
                                child.material = row.material;
                                child.batl_estimated_cost_to_vendorqty = row.batl_estimated_cost_to_vendorqty;
                                child.total_estimated_cost = row.total_estimated_cost;
                            });
                            frm.refresh_field("table_xpza");
                        }

                        // Fetch totals
                        frm.set_value("total", cost_estimate_doc.total);
                        frm.set_value("gst", cost_estimate_doc.gst);
                        frm.set_value("net_total", cost_estimate_doc.new_total);
                    }
                }
            });
        } else {
            // Clear values if cost_estimate is removed
            frm.clear_table("table_xpza");
            frm.set_value("total", null);
            frm.set_value("gst", null);
            frm.set_value("net_total", null);
            frm.refresh_fields(["table_xpza", "total", "gst", "new_total"]);
        }
    }
});

frappe.ui.form.on('Sub-Contract Request', {
    setup: function(frm) {
        // Filter for scope_of_work field
        frm.set_query("scope_of_work", "scm_particulars", function() {
            return {
                filters: {
                    is_stock_item: 0  // only non-stock items
                }
            };
        });

        // Filter for name1 field
        frm.set_query("name1", "scm_particulars", function() {
            return {
                filters: {
                    is_stock_item: 1,   
                    is_sub_contracted_item: 1, // only sub-contracted items
                    default_bom: ["!=", ""]    // has a BOM
                }
            };
        });
    }
});
