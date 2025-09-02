// Copyright (c) 2025, Acube and contributors
// For license information, please see license.txt


frappe.ui.form.on('Tender Opening', {
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


frappe.ui.form.on('Tender Opening', {
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




frappe.ui.form.on('Tender Opening', {
    tender: function(frm) {
        if (frm.doc.tender) {
            // Clear child tables first
            frm.clear_table("particulars");
            frm.clear_table("scm_particulars");
            frm.clear_table("table_bcra");
            frm.clear_table("table_aprq");

            frappe.call({
                method: "frappe.client.get",
                args: {
                    doctype: "Tender",
                    name: frm.doc.tender
                },
                callback: function(r) {
                    if (r.message) {
                        let tender_doc = r.message;

                        // Case 1: If reference is Indent → map `items` into `particulars`
                        if (tender_doc.reference === "Indent") {
                            (tender_doc.items || []).forEach(row => {
                                let child = frm.add_child("particulars");
                                child.item = row.item;
                                child.description = row.description;
                                child.quantity = row.quantity;
                                child.uom = row.unit;
                                child.delivery_period = row.delivery_period;
                            });
                            frm.refresh_field("particulars");

                            // fetch type_of_bid from Indent
                            if (tender_doc.purchase_indent_reference) {
                                frappe.call({
                                    method: "frappe.client.get_value",
                                    args: {
                                        doctype: "Indent",
                                        filters: { name: tender_doc.purchase_indent_reference },
                                        fieldname: ["type_of_bid"]
                                    },
                                    callback: function(res) {
                                        if (res.message) {
                                            frm.set_value("type_of_bid", res.message.type_of_bid);
                                        }
                                    }
                                });
                            }
                        }

                        // Case 2: If reference is SCR → map `table_zdft` into `scm_particulars`
                        else if (tender_doc.reference === "SCR") {
                            (tender_doc.table_zdft || []).forEach(row => {
                                let child = frm.add_child("scm_particulars");
                                child.drawing_no = row.drawing_no;
                                child.rev = row.rev;
                                child.idn_no = row.idn_no;
                                child.raw_material_sizespecification = row.raw_material_sizespecification;
                                child.sizespecification = row.sizespecification;
                                child.name1 = row.name1;
                                child.item_description = row.item_description;
                                child.delivery_date = row.delivery_date;
                                child.quantity = row.quantity;
                                child.fim_rate = row.fim_rate;
                                child.total_fim_cost = row.total_fim_cost;
                                child.delivery_remarks = row.delivery_remarks;
                            });
                            frm.refresh_field("scm_particulars");

                            // fetch type_of_bid from Sub Contract Request
                            if (tender_doc.scr_reference) {
                                frappe.call({
                                    method: "frappe.client.get_value",
                                    args: {
                                        doctype: "Sub-Contract Request",
                                        filters: { name: tender_doc.scr_id },
                                        fieldname: ["type_of_bid"]
                                    },
                                    callback: function(res) {
                                        if (res.message) {
                                            frm.set_value("type_of_bid", res.message.type_of_bid);
                                        }
                                    }
                                });
                            }
                        }

                        // Case 3: Always map invited_vendors → table_bcra + table_aprq
                        (tender_doc.invited_vendors || []).forEach(row => {
                            let child1 = frm.add_child("table_bcra");
                            child1.supplier = row.vendor_name;

                            let child2 = frm.add_child("table_aprq");
                            child2.vendor = row.vendor_name;
                        });
                        frm.refresh_field("table_bcra");
                        frm.refresh_field("table_aprq");

                        frappe.call({
                            method: "frappe.client.get_list",
                            args: {
                                doctype: "Tender Response",
                                filters: { tender_reference: frm.doc.tender },
                                fields: ["vendor"]
                            },
                            callback: function(res) {
                                if (res.message) {
                                    let responded_vendors = res.message.map(r => r.vendor);

                                    (frm.doc.table_bcra || []).forEach(row => {
                                        if (responded_vendors.includes(row.supplier)) {
                                            row.status = "Received";
                                        }
                                    });

                                    frm.refresh_field("table_bcra");
                                }
                            }
                        });
                    }
                }
            });
        }
    }
});


frappe.ui.form.on('Tender Opening', {
    onload: function(frm) {
        if (frm.is_new()) {
            // Set enquiry_created_by_user as logged-in user
            frm.set_value("tender_opening_created_by", frappe.session.user);
        }
      }
    }
  )

  frappe.ui.form.on('Tender Opening', {
    
  })