// Copyright (c) 2025, Acube and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Tender", {
// 	refresh(frm) {

// 	},
// });
// frappe.ui.form.on('Tender', {
//     purchase_indent_reference: function(frm) {
//         if (frm.doc.purchase_indent_reference) {
//             // Clear existing child table
//             frm.clear_table("items");

//             frappe.call({
//                 method: "frappe.client.get",
//                 args: {
//                     doctype: "Indent",
//                     name: frm.doc.purchase_indent_reference
//                 },
//                 callback: function(r) {
//                     if (r.message) {
//                         let indent_doc = r.message;

//                         (indent_doc.items || []).forEach(row => {
//                             let child = frm.add_child("items");
//                             child.item = row.item;
//                             child.description = row.description;
//                             child.quantity = row.qty;
//                             child.unit = row.unit;
//                             child.delivery_period = row.required_date;
//                         });

//                         frm.refresh_field("items");
//                     }
//                 }
//             });
//         }
//     },

//     scr_reference: function(frm) {
//         if (frm.doc.scr_reference) {
//             // Clear existing scm particulars table
//             frm.clear_table("table_zdft");

//             // Step 1: Get SCR Review document
//             frappe.call({
//                 method: "frappe.client.get",
//                 args: {
//                     doctype: "SCR Review",
//                     name: frm.doc.scr_reference
//                 },
//                 callback: function(r) {
//                     if (r.message) {
//                         let scr_review_doc = r.message;

//                         if (scr_review_doc.scr_no) {
//                             // Step 2: Get the linked Sub-Contract Request
//                             frappe.call({
//                                 method: "frappe.client.get",
//                                 args: {
//                                     doctype: "Sub-Contract Request",
//                                     name: scr_review_doc.scr_no
//                                 },
//                                 callback: function(r2) {
//                                     if (r2.message) {
//                                         let scr_doc = r2.message;

//                                         (scr_doc.scm_particulars || []).forEach(row => {
//                                             let child = frm.add_child("table_zdft");
//                                             child.drawing_no = row.drawing_no;
//                                             child.rev = row.rev;
//                                             child.idn_no = row.idn_no;
//                                             child.raw_material_sizespecification = row.raw_material_sizespecification;
//                                             child.sizespecification = row.sizespecification;
//                                             child.name1 = row.name1;
//                                             child.item_description = row.item_description;
//                                             child.delivery_date = row.delivery_date;
//                                             child.quantity = row.quantity;
//                                             child.fim_rate = row.fim_rate;
//                                             child.total_fim_cost = row.total_fim_cost;
//                                             child.delivery_remarks = row.delivery_remarks;
//                                         });

//                                         frm.refresh_field("table_zdft");
//                                     }
//                                 }
//                             });
//                         }
//                     }
//                 }
//             });
//         }
//     }
// });

frappe.ui.form.on('Tender', {
    purchase_indent_reference: function(frm) {
        if (frm.doc.purchase_indent_reference && frm.doc.reference === "Indent") {
            // Clear existing child tables
            frm.clear_table("items");
            frm.clear_table("invited_vendors");

            frappe.call({
                method: "frappe.client.get",
                args: {
                    doctype: "Indent",
                    name: frm.doc.purchase_indent_reference
                },
                callback: function(r) {
                    if (r.message) {
                        let indent_doc = r.message;

                        // Fetch Items from Indent
                        (indent_doc.items || []).forEach(row => {
                            let child = frm.add_child("items");
                            child.item = row.item;
                            child.description = row.description;
                            child.quantity = row.qty;
                            child.unit = row.unit;
                            child.delivery_period = row.required_date;
                        });

                        // Fetch Vendors from Indent Source Suppliers
                        (indent_doc.table_ophz || []).forEach(row => {
                            let vendor_child = frm.add_child("invited_vendors");
                            vendor_child.vendor_name = row.supplier;
                        });

                        frm.refresh_field("items");
                        frm.refresh_field("invited_vendors");
                    }
                }
            });
        }
    },

    scr_reference: function(frm) {
        if (frm.doc.scr_reference && frm.doc.reference === "SCR") {
            // Clear existing scm particulars & vendors
            frm.clear_table("table_zdft");
            frm.clear_table("invited_vendors");

            // Step 1: Get SCR Review document
            frappe.call({
                method: "frappe.client.get",
                args: {
                    doctype: "SCR Review",
                    name: frm.doc.scr_reference
                },
                callback: function(r) {
                    if (r.message) {
                        let scr_review_doc = r.message;

                        // Step 2: Get the linked Sub-Contract Request
                        if (scr_review_doc.scr_no) {
                            frappe.call({
                                method: "frappe.client.get",
                                args: {
                                    doctype: "Sub-Contract Request",
                                    name: scr_review_doc.scr_no
                                },
                                callback: function(r2) {
                                    if (r2.message) {
                                        let scr_doc = r2.message;

                                        // 🔹 Fetch type_of_scr -> tender_type
                                        if (scr_doc.type_of_scr) {
                                            frm.set_value("tender_type", scr_doc.type_of_scr);
                                        }

                                        // Fetch SCM Particulars
                                        (scr_doc.scm_particulars || []).forEach(row => {
                                            let child = frm.add_child("table_zdft");
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
                                            child.scope_of_work = row.scope_of_work;
                                            child.finished_good_quantity = row.finished_good_quantity;
                                            child.uom = row.uom;
                                        });

                                        frm.refresh_field("table_zdft");
                                    }
                                }
                            });
                        }

                        // Fetch Vendors from SCR Vendors
                        (scr_review_doc.recommended_vendorsgm || []).forEach(row => {
                            let vendor_child = frm.add_child("invited_vendors");
                            vendor_child.vendor_name = row.vendor;
                        });

                        frm.refresh_field("invited_vendors");
                    }
                }
            });
        }
    }
});

//     scr_reference: function(frm) {
//         if (frm.doc.scr_reference && frm.doc.reference === "SCR") {
//             // Clear existing scm particulars & vendors
//             frm.clear_table("table_zdft");
//             frm.clear_table("invited_vendors");

//             // Step 1: Get SCR Review document
//             frappe.call({
//                 method: "frappe.client.get",
//                 args: {
//                     doctype: "SCR Review",
//                     name: frm.doc.scr_reference
//                 },
//                 callback: function(r) {
//                     if (r.message) {
//                         let scr_review_doc = r.message;

//                         // Step 2: Get the linked Sub-Contract Request
//                         if (scr_review_doc.scr_no) {
//                             frappe.call({
//                                 method: "frappe.client.get",
//                                 args: {
//                                     doctype: "Sub-Contract Request",
//                                     name: scr_review_doc.scr_no
//                                 },
//                                 callback: function(r2) {
//                                     if (r2.message) {
//                                         let scr_doc = r2.message;

//                                         // Fetch SCM Particulars
//                                         (scr_doc.scm_particulars || []).forEach(row => {
//                                             let child = frm.add_child("table_zdft");
//                                             child.drawing_no = row.drawing_no;
//                                             child.rev = row.rev;
//                                             child.idn_no = row.idn_no;
//                                             child.raw_material_sizespecification = row.raw_material_sizespecification;
//                                             child.sizespecification = row.sizespecification;
//                                             child.name1 = row.name1;
//                                             child.item_description = row.item_description;
//                                             child.delivery_date = row.delivery_date;
//                                             child.quantity = row.quantity;
//                                             child.fim_rate = row.fim_rate;
//                                             child.total_fim_cost = row.total_fim_cost;
//                                             child.delivery_remarks = row.delivery_remarks;
//                                             child.scope_of_work = row.scope_of_work;
//                                             child.finished_good_quantity = row.finished_good_quantity;
//                                             child.uom = row.uom;
//                                         });

//                                         frm.refresh_field("table_zdft");
//                                     }
//                                 }
//                             });
//                         }

//                         // Fetch Vendors from SCR Vendors
//                         (scr_review_doc.recommended_vendorsgm || []).forEach(row => {
//                             let vendor_child = frm.add_child("invited_vendors");
//                             vendor_child.vendor_name = row.vendor;
//                         });

//                         frm.refresh_field("invited_vendors");
//                     }
//                 }
//             });
//         }
//     }
// });



frappe.ui.form.on('Tender', {
    onload: function(frm) {
        if (frm.is_new()) {
            // Set enquiry_created_by_user as logged-in user
            frm.set_value("enquiry_created_by_user", frappe.session.user);

            // Fetch the employee linked to the logged-in user
            frappe.call({
                method: "frappe.client.get_value",
                args: {
                    doctype: "Employee",
                    filters: { user_id: frappe.session.user },
                    fieldname: "name"
                },
                callback: function(r) {
                    if (r.message) {
                        frm.set_value("employee_id", r.message.name);
                    }
                }
            });

            // Auto set Reference field based on source
            if (frm.doc.purchase_indent_reference) {
                frm.set_value("reference", "Indent");
            } else if (frm.doc.scr_reference) {
                frm.set_value("reference", "SCR");
            }
        }
    }
});


// frappe.ui.form.on("Tender", {
//     refresh: function(frm) {
//         frm.trigger("toggle_extension_tab");
//     },
//     due_date: function(frm) {
//         frm.trigger("toggle_extension_tab");
//     },
//     toggle_extension_tab: function(frm) {
//         if (frm.doc.due_date) {
//             let today_str = frappe.datetime.get_today();
//             let today = frappe.datetime.str_to_obj(today_str);
//             let due_date = frappe.datetime.str_to_obj(frm.doc.due_date);

//             console.log("Today:", today_str, "| Due Date:", frm.doc.due_date);

//             if (today > due_date) {
//                 console.log("Showing Tender Extension Tab (due date exceeded)");
//                 frm.toggle_display("tender_extension_tab", true);
//             } else {
//                 console.log("Hiding Tender Extension Tab (due date not yet exceeded)");
//                 frm.toggle_display("tender_extension_tab", false);
//             }
//         } else {
//             console.log("No due date set, hiding Tender Extension Tab");
//             frm.toggle_display("tender_extension_tab", false);
//         }
//     }
// });



frappe.ui.form.on('Tender', {
    extended_date: function(frm) {
        if (frm.doc.extended_date) {
            frm.set_value("status", "Date Extended");
        }
    }
});