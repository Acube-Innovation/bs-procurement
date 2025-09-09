// Copyright (c) 2025, Acube and contributors
// For license information, please see license.txt


// Populate Created By User
frappe.ui.form.on('Tender Opening', {
    onload: function(frm) {
        if (frm.is_new()) {
            // Set enquiry_created_by_user as logged-in user
            frm.set_value("tender_opening_created_by", frappe.session.user);
        }
      }
    }
  )




// Populate from Tender
frappe.ui.form.on('Tender Opening', {
    tender: function(frm) {
        if (frm.doc.tender) {
            // Clear child tables first
            frm.clear_table("particulars");
            frm.clear_table("scm_particulars");
            frm.clear_table("table_bcra");
            frm.clear_table("table_aprq");
            frm.clear_table("table_mzil");

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
                            if (tender_doc.scr_id) {
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

                        // Case 3: Always map invited_vendors → table_bcra
                        (tender_doc.invited_vendors || []).forEach(row => {
                            let child1 = frm.add_child("table_bcra");
                            child1.supplier = row.vendor_name;
                        });
                        frm.refresh_field("table_bcra");

                        // Now fetch Tender Responses → update table_bcra status and add only received vendors
                        frappe.call({
                            method: "frappe.client.get_list",
                            args: {
                                doctype: "Tender Response",
                                filters: { tender_reference: frm.doc.tender },
                                fields: ["vendor","response_date"]
                            },
                            callback: function(res) {
                                if (res.message) {
                                    let responded_vendors = res.message.map(r => r.vendor);

                                    (frm.doc.table_bcra || []).forEach(row => {
                                        if (responded_vendors.includes(row.supplier)) {
                                            row.status = "Received";
                                            row.date_of_receipt_of_quotation = res.message.find(r => r.vendor === row.supplier).response_date;

                                            // Branch by type_of_bid
                                            if (frm.doc.type_of_bid === "Two") {
                                                let child2 = frm.add_child("table_aprq");
                                                child2.vendor = row.supplier;
                                                child2.date_of_receipt_of_quotation = row.date_of_receipt_of_quotation;
                                                child2.status = row.status;
                                            }
                                            else if (frm.doc.type_of_bid === "Single") {
                                                let child3 = frm.add_child("table_mzil");
                                                child3.vendor = row.supplier;
                                                child3.date_of_receipt_of_quotation = row.date_of_receipt_of_quotation;
                                                child2.status = row.status;
                                            }
                                        }
                                    });

                                    frm.refresh_field("table_bcra");
                                    frm.refresh_field("table_aprq");
                                    frm.refresh_field("table_mzil");
                                }
                            }
                        });
                    }
                }
            });
        }
    }
});


// Populate Committee Members
frappe.ui.form.on('Tender Opening', {
  // For Technical
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
              frm.add_child("tender_opening_committee", {
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
              frm.add_child("table_laar", {
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
  },

  // For Commercial
  tender_opening_committee_3: function(frm) {
    if (frm.doc.tender_opening_committee_3) {
      frm.clear_table("table_xzop");

      frappe.call({
        method: "frappe.client.get",
        args: {
          doctype: "Tender Opening Committee",
          name: frm.doc.tender_opening_committee_3
        },
        callback: function(r) {
          if (r.message && r.message.table_tyrx) {
            r.message.table_tyrx.forEach(function(d) {
              frm.add_child("table_xzop", {
                position: d.position,
                user: d.user,
                name1: d.name1,
                designation: d.designation,
                verified_and_signed: d.verified_and_signed,
                date: d.date
              });
            });
            frm.refresh_field("table_xzop");
          }
        }
      });
    }
  },

  tender_opening_committee_4: function(frm) {
    if (frm.doc.tender_opening_committee_4) {
      frm.clear_table("table_cyyq");

      frappe.call({
        method: "frappe.client.get",
        args: {
          doctype: "Tender Opening Committee",
          name: frm.doc.tender_opening_committee_4
        },
        callback: function(r) {
          if (r.message && r.message.table_tyrx) {
            r.message.table_tyrx.forEach(function(d) {
              frm.add_child("table_cyyq", {
                position: d.position,
                user: d.user,
                name1: d.name1,
                designation: d.designation,
                verified_and_signed: d.verified_and_signed,
                date: d.date
              });
            });
            frm.refresh_field("table_cyyq");
          }
        }
      });
    }
  }
});

// Duplicate User Check (Tech + Comm)
frappe.ui.form.on('Tender Opening', {
  validate: function(frm) {
    let users = new Map();
    let duplicate_entries = [];

    // Technical committees
    (frm.doc.tender_opening_committee || []).forEach(row => {
      if (row.user) {
        if (users.has(row.user)) {
          duplicate_entries.push(row.user + " (" + row.name1 + ")");
        } else {
          users.set(row.user, row.name1);
        }
      }
    });
    (frm.doc.table_laar || []).forEach(row => {
      if (row.user) {
        if (users.has(row.user)) {
          duplicate_entries.push(row.user + " (" + row.name1 + ")");
        } else {
          users.set(row.user, row.name1);
        }
      }
    });

    // Commercial committees
    (frm.doc.table_xzop || []).forEach(row => {
      if (row.user) {
        if (users.has(row.user)) {
          duplicate_entries.push(row.user + " (" + row.name1 + ")");
        } else {
          users.set(row.user, row.name1);
        }
      }
    });
    (frm.doc.table_cyyq || []).forEach(row => {
      if (row.user) {
        if (users.has(row.user)) {
          duplicate_entries.push(row.user + " (" + row.name1 + ")");
        } else {
          users.set(row.user, row.name1);
        }
      }
    });

    if (duplicate_entries.length > 0) {
      let list_html = "<ul>";
      duplicate_entries.forEach(d => list_html += `<li>${d}</li>`);
      list_html += "</ul>";

      frappe.throw(__('The following users are duplicated between committees:') + list_html);
    }
  }
});
// code 1 
// // TOC Verification (Tech + Comm)
// frappe.ui.form.on('Tender Opening', {
//   refresh: function(frm) {
//     const current_user = frappe.session.user;

//     // Utility: check if user is in table
//     function get_user_row_and_table(table_name) {
//       const table = frm.doc[table_name] || [];
//       for (let row of table) {
//         if (row.user === current_user || row.user === frappe.user.email) {
//           return { row, table_name };
//         }
//       }
//       return null;
//     }

//     // -------- Technical Verification --------
//     const tech_match1 = get_user_row_and_table("tender_opening_committee");
//     const tech_match2 = get_user_row_and_table("table_laar");
//     const tech_match = tech_match1 || tech_match2;

//     if (tech_match && !tech_match.row.verified_and_signed) {
//       frm.add_custom_button("Verify (Technical)", function () {
//         frappe.model.set_value(tech_match.row.doctype, tech_match.row.name, "verified_and_signed", 1);
//         frappe.model.set_value(tech_match.row.doctype, tech_match.row.name, "date", frappe.datetime.get_today());
//         frm.save().then(() => {
//           frm.reload_doc();
//         });
//       });
//     }

//     function check_technical_verifications() {
//       let roles_verified = { Member: false, Convener: false, Chairman: false };
//       const combined = (frm.doc.tender_opening_committee || []).concat(frm.doc.table_laar || []);
//       combined.forEach(row => {
//         if (row.verified_and_signed) {
//           if (row.position === "Member") roles_verified.Member = true;
//           if (row.position === "Convener") roles_verified.Convener = true;
//           if (row.position === "Chairman") roles_verified.Chairman = true;
//         }
//       });

//       if (roles_verified.Member && roles_verified.Convener && roles_verified.Chairman) {
//         const selected_vendors = (frm.doc.table_aprq || []).filter(r => r.selected);
//         frm.set_value("technical_evaluation_status", selected_vendors.length > 0 ? "Verified" : "No Vendors Qualified");
//         frm.save();
//       }
//     }
//     check_technical_verifications();

//     // -------- Commercial Verification --------
//     const comm_match1 = get_user_row_and_table("table_xzop");
//     const comm_match2 = get_user_row_and_table("table_cyyq");
//     const comm_match = comm_match1 || comm_match2;

//     if (comm_match && !comm_match.row.verified_and_signed) {
//       frm.add_custom_button("Verify (Commercial)", function () {
//         frappe.model.set_value(comm_match.row.doctype, comm_match.row.name, "verified_and_signed", 1);
//         frappe.model.set_value(comm_match.row.doctype, comm_match.row.name, "date", frappe.datetime.get_today());
//         frm.save().then(() => {
//           frm.reload_doc();
//         });
//       });
//     }

//     function check_commercial_verifications() {
//       let roles_verified = { Member: false, Convener: false, Chairman: false };
//       const combined = (frm.doc.table_xzop || []).concat(frm.doc.table_cyyq || []);
//       combined.forEach(row => {
//         if (row.verified_and_signed) {
//           if (row.position === "Member") roles_verified.Member = true;
//           if (row.position === "Convener") roles_verified.Convener = true;
//           if (row.position === "Chairman") roles_verified.Chairman = true;
//         }
//       });

//       if (roles_verified.Member && roles_verified.Convener && roles_verified.Chairman) {
//         const selected_vendors = (frm.doc.table_mzil || []).filter(r => r.selected);
//         frm.set_value("commercial_evaluation_status", selected_vendors.length > 0 ? "Verified" : "No Vendors Qualified");
//         frm.save();
//       }
//     }
//     check_commercial_verifications();
//   }
// });


// code 2
frappe.ui.form.on('Tender Opening', {
  refresh: function(frm) {
    const current_user = frappe.session.user;

    // Utility: check if user is in table
    function get_user_row_and_table(table_name) {
      const table = frm.doc[table_name] || [];
      for (let row of table) {
        if (row.user === current_user || row.user === frappe.user.email) {
          return { row, table_name };
        }
      }
      return null;
    }

    // -------------------- Technical Verification --------------------
    const tech_match1 = get_user_row_and_table("tender_opening_committee");
    const tech_match2 = get_user_row_and_table("table_laar");
    const tech_match = tech_match1 || tech_match2;

    if (tech_match && !tech_match.row.verified_and_signed) {
      frm.add_custom_button("Verify (Technical)", function () {
        frappe.model.set_value(tech_match.row.doctype, tech_match.row.name, "verified_and_signed", 1);
        frappe.model.set_value(tech_match.row.doctype, tech_match.row.name, "date", frappe.datetime.get_today());
        frm.save().then(() => frm.reload_doc());
      });
    }

    function check_technical_verifications(frm) {
      let roles_verified = { Member: false, Convener: false, Chairman: false };
      const combined = (frm.doc.tender_opening_committee || []).concat(frm.doc.table_laar || []);
      combined.forEach(row => {
        if (row.verified_and_signed) {
          if (row.position === "Member") roles_verified.Member = true;
          if (row.position === "Convener") roles_verified.Convener = true;
          if (row.position === "Chairman") roles_verified.Chairman = true;
        }
      });

      if (roles_verified.Member && roles_verified.Convener && roles_verified.Chairman) {
        const selected_vendors = (frm.doc.table_aprq || []).filter(r => r.selected);
        let new_status = selected_vendors.length > 0 ? "Verified" : "No Vendors Qualified";

        if (frm.doc.technical_evaluation_status !== new_status) {
          frm.set_value("technical_evaluation_status", new_status);
          frm.dirty();
          frm.save();
        }
      }
    }

    check_technical_verifications(frm);

    // -------------------- Commercial Verification --------------------
    const comm_match1 = get_user_row_and_table("table_xzop");
    const comm_match2 = get_user_row_and_table("table_cyyq");
    const comm_match = comm_match1 || comm_match2;

    if (comm_match && !comm_match.row.verified_and_signed) {
      frm.add_custom_button("Verify (Commercial)", function () {
        frappe.model.set_value(comm_match.row.doctype, comm_match.row.name, "verified_and_signed", 1);
        frappe.model.set_value(comm_match.row.doctype, comm_match.row.name, "date", frappe.datetime.get_today());
        frm.save().then(() => frm.reload_doc());
      });
    }

    function check_commercial_verifications(frm) {
      let roles_verified = { Member: false, Convener: false, Chairman: false };
      const combined = (frm.doc.table_xzop || []).concat(frm.doc.table_cyyq || []);
      combined.forEach(row => {
        if (row.verified_and_signed) {
          if (row.position === "Member") roles_verified.Member = true;
          if (row.position === "Convener") roles_verified.Convener = true;
          if (row.position === "Chairman") roles_verified.Chairman = true;
        }
      });

      if (roles_verified.Member && roles_verified.Convener && roles_verified.Chairman) {
        const selected_vendors = (frm.doc.table_mzil || []).filter(r => r.selected);
        let new_status = selected_vendors.length > 0 ? "Verified" : "No Vendors Qualified";

        if (frm.doc.commercial_evaluation_status !== new_status) {
          frm.set_value("commercial_evaluation_status", new_status);
          frm.dirty();
          frm.save();
        }
      }
    }

    check_commercial_verifications(frm);
  },

  // -------------------- Status Updater --------------------
  type_of_bid: function(frm) {
    update_status(frm);
  },
  technical_evaluation_status: function(frm) {
    update_status(frm);
  },
  commercial_evaluation_status: function(frm) {
    update_status(frm);
  }
});

// Shared function for status mapping
function update_status(frm) {
  if (frm.doc.type_of_bid === "Two") {
    frm.set_value("status", "Technical Review");
  } else if (frm.doc.type_of_bid === "Single") {
    frm.set_value("status", "Commercial Review");
  }

  if (frm.doc.technical_evaluation_status === "Verified") {
    frm.set_value("status", "Technical Qualified");
  } else if (frm.doc.technical_evaluation_status === "No Vendors Qualified") {
    frm.set_value("status", "Technical Not Qualified");
  }

  if (frm.doc.commercial_evaluation_status === "Verified") {
    frm.set_value("status", "Commercial Qualified");
  } else if (frm.doc.commercial_evaluation_status === "No Vendors Qualified") {
    frm.set_value("status", "Commercial Not Qualified");
  }
}

// // code 3
// frappe.ui.form.on('Tender Opening', {
//   refresh: function(frm) {
//     const current_user = frappe.session.user;

//     // Utility: check if user exists in child table
//     function get_user_row_and_table(table_name) {
//       const table = frm.doc[table_name] || [];
//       for (let row of table) {
//         if (row.user === current_user || row.user === frappe.user.email) {
//           return { row, table_name };
//         }
//       }
//       return null;
//     }

//     // -------- Technical Verification --------
//     const tech_match1 = get_user_row_and_table("tender_opening_committee");
//     const tech_match2 = get_user_row_and_table("table_laar");
//     const tech_match = tech_match1 || tech_match2;

//     if (tech_match && !tech_match.row.verified_and_signed) {
//       frm.add_custom_button("Verify (Technical)", function () {
//         frappe.model.set_value(tech_match.row.doctype, tech_match.row.name, "verified_and_signed", 1);
//         frappe.model.set_value(tech_match.row.doctype, tech_match.row.name, "date", frappe.datetime.get_today());
//         frm.save();  // Python handles evaluation + status update
//       });
//     }

//     // -------- Commercial Verification --------
//     const comm_match1 = get_user_row_and_table("table_xzop");
//     const comm_match2 = get_user_row_and_table("table_cyyq");
//     const comm_match = comm_match1 || comm_match2;

//     if (comm_match && !comm_match.row.verified_and_signed) {
//       frm.add_custom_button("Verify (Commercial)", function () {
//         frappe.model.set_value(comm_match.row.doctype, comm_match.row.name, "verified_and_signed", 1);
//         frappe.model.set_value(comm_match.row.doctype, comm_match.row.name, "date", frappe.datetime.get_today());
//         frm.save();  // Python handles evaluation + status update
//       });
//     }
//   }
// });



// Populate Selected Vendors into table_mzil on status change
frappe.ui.form.on('Tender Opening', {
    technical_evaluation_status: function(frm) {
        if (frm.doc.technical_evaluation_status === "Verified") {
            // Clear table_mzil first to avoid duplicates
            frm.clear_table("table_mzil");

            // Loop through table_aprq and add only selected vendors
            (frm.doc.table_aprq || []).forEach(row => {
                if (row.selected) {
                    let child = frm.add_child("table_mzil");
                    child.vendor = row.vendor;
                }
            });

            frm.refresh_field("table_mzil");
        }
    }
});