// Copyright (c) 2025, Acube and contributors
// For license information, please see license.txt

// frappe.ui.form.on("SCR Scope", {
// 	refresh(frm) {

// 	},
// });

frappe.ui.form.on('SCR Scope', {
    setup: function(frm) {
        // Filter for scope_of_work field
        frm.set_query("scope_of_work", "table_smtn", function() {
            return {
                filters: {
                    is_stock_item: 0  // only non-stock items
                }
            };
        });

        // Filter for name1 field
        frm.set_query("name1", "table_smtn", function() {
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
