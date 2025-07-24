// Copyright (c) 2025, Acube and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Purchase  and Negotiation Committee", {
// 	refresh(frm) {

// 	},
// });

frappe.ui.form.on('Purchase  and Negotiation Committee', {
  pnc_committee: function(frm) {
    if (frm.doc.pnc_committee) {
      frm.clear_table("table_lilx");

      frappe.call({
        method: "frappe.client.get",
        args: {
          doctype: "PNC Committee",
          name: frm.doc.pnc_committee
        },
        callback: function(r) {
          if (r.message && r.message.committee) {
            r.message.committee.forEach(function(d) {
              let row = frm.add_child("table_lilx", {
                members: d.members,
                invitees: d.invitees
              });
            });
            frm.refresh_field("table_lilx");
          }
        }
      });
    }
  }
});