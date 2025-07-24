// Copyright (c) 2025, Acube and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Tender  Opening", {
// 	refresh(frm) {

// 	},
// });
frappe.ui.form.on('Tender  Opening', {
  refresh: function(frm) {
    const current_user = frappe.session.user;

    // Function to check if user is in a child table and return matching row and table name
    function get_user_row_and_table(table_name) {
      const table = frm.doc[table_name] || [];
      for (let row of table) {
        if (row.user === current_user || row.user === frappe.user.email) {
          return { row, table_name };
        }
      }
      return null;
    }

    // Check both child tables
    const match1 = get_user_row_and_table("tender_opening_committee");
    const match2 = get_user_row_and_table("table_laar");

    if (match1 || match2) {
      const match = match1 || match2;

      // Only show button if not already verified
      if (!match.row.verified_and_signed) {
        frm.add_custom_button("Verify", function () {
          frappe.model.set_value(match.row.doctype, match.row.name, "verified_and_signed", 1);
          frappe.model.set_value(match.row.doctype, match.row.name, "date", frappe.datetime.get_today());

          frm.save().then(() => {
            frappe.show_alert({message: "Verified and saved successfully", indicator: "green"});
            frm.reload_doc();  // optional: to refresh the form after save
          });
        });
      }
    }
  }
});


frappe.ui.form.on('Tender  Opening', {
  tender_opening_committee_1: function(frm) {
    if (frm.doc.tender_opening_committee_1) {
      frm.clear_table("tender_opening_committee");

      frappe.call({
        method: "frappe.client.get",
        args: {
          doctype: "Tender Opening Committee",
          name: frm.doc.tender_opening_committee_1
        },
        callback: function(r) {
          if (r.message && r.message.table_tyrx) {
            r.message.table_tyrx.forEach(function(d) {
              let row = frm.add_child("tender_opening_committee", {
                position: d.position,
                user: d.user,
                name1: d.name1,
                designation: d.designation,
                verified_and_signed: d.verified_and_signed,
                date: d.date
              });
            });
            frm.refresh_field("tender_opening_committee");
          }
        }
      });
    }
  },

  tender_opening_committee_2: function(frm) {
    if (frm.doc.tender_opening_committee_2) {
      frm.clear_table("table_laar");

      frappe.call({
        method: "frappe.client.get",
        args: {
          doctype: "Tender Opening Committee",
          name: frm.doc.tender_opening_committee_2
        },
        callback: function(r) {
          if (r.message && r.message.table_tyrx) {
            r.message.table_tyrx.forEach(function(d) {
              let row = frm.add_child("table_laar", {
                position: d.position,
                user: d.user,
                name1: d.name1,
                designation: d.designation,
                verified_and_signed: d.verified_and_signed,
                date: d.date
              });
            });
            frm.refresh_field("table_laar");
          }
        }
      });
    }
  }
});
