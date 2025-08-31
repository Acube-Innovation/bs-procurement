// Copyright (c) 2025, Acube and contributors
// For license information, please see license.txt

frappe.ui.form.on("Tender Response", {
    refresh: function(frm) {
        frm.set_query("vendor", function() {
            return {
                query: "a3_procurement.api.get_invited_vendors",
                filters: {
                    tender_reference: frm.doc.tender_reference
                }
            };
        });
    }
});

