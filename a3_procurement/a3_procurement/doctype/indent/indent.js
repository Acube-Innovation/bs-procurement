// Copyright (c) 2025, Acube and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Indent", {
// 	refresh(frm) {

// 	},
// });


// frappe.ui.form.on('Indent', {
//   onload: function(frm) {
//     // Check which document it is coming from
//     const route = frappe.get_prev_route();

//     // If coming from In-Principle Approval, force indent_type to Capital Purchase
//     if (route && route[1] === "In-Principle Approval for CAPEX") {
//       frm.set_value("indent_type", "Capital Purchase");
//     }

//     // Else if coming from PAC, set indent_type to PAC
//     else if (route && route[1] === "Proprietory Article Certificate") {
//       frm.set_value("indent_type", "PAC");
//     }
//   }
// });


frappe.ui.form.on('Indent', {
    in_principle_request: function(frm) {
        // if (frm.doc.in_principle_request && frm.doc.indent_type === "Capital Purchase") {
        if (frm.doc.in_principle_request) {
            // Clear existing child table
            frm.clear_table("items");

            // Fetch the In-Principle Approval for CAPEX document
            frappe.call({
                method: "frappe.client.get",
                args: {
                    doctype: "In-Principle Approval for CAPEX",
                    name: frm.doc.in_principle_request
                },
                callback: function(r) {
                    if (r.message) {
                        let in_principle_doc = r.message;

                        // Loop through the particulars table and add to items table
                        (in_principle_doc.particulars || []).forEach(row => {
                            let child = frm.add_child("items");
                            child.item = row.item;
                            child.description = row.description;
                            child.qty = row.qty;
                            child.unit = row.unit;
                            child.required_date = row.required_date;
                        });

                        frm.refresh_field("items");
                    }
                }
            });
        }
    }
});

// frappe.ui.form.on('Indent', {
//     async refresh(frm) {
//         // Get the logged-in user's department from the Employee doctype
//         const user = frappe.session.user;

//         await frappe.call({
//             method: "frappe.client.get_list",
//             args: {
//                 doctype: "Employee",
//                 filters: { user_id: user },
//                 fields: ["department"],
//                 limit_page_length: 1
//             },
//             callback: function(r) {
//                 if (r.message && r.message.length > 0) {
//                     const department = r.message[0].department;

//                     if (department === "Subcontracting - BATL") {
//                         console.log(r.message)
//                         frm.set_df_property('basic_details_section', 'label', 'Indent Details (SCM)');
//                         frm.refresh_field('basic_details_section');
//                     } else if (department === "Purchase") {
//                         frm.set_df_property('basic_details_section', 'label', 'Indent Details (CMM)');
//                         frm.refresh_field('basic_details_section');
//                     }
//                 }
//             }
//         });
//     }
// });
frappe.ui.form.on('Indent', {
    async refresh(frm) {
        const user = frappe.session.user;

        await frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Employee",
                filters: { user_id: user },
                fields: ["department"],
                limit_page_length: 1
            },
            callback: function(r) {
                if (r.message && r.message.length > 0) {
                    const department = r.message[0].department;
                    let newLabel = "";

                    if (department === "Subcontracting - BATL") {
                        newLabel = "Indent Details (SCM)";
                    } else if (department === "Purchase") {
                        newLabel = "Indent Details (CMM)";
                    }

                    if (newLabel) {
                        // Update the df.label value
                        frm.fields_dict.basic_details_section.df.label = newLabel;

                        // Manually update the section label in the DOM
                        $(frm.fields_dict.basic_details_section.wrapper)
                            .find('.section-head')
                            .html(`<span>${newLabel}</span>`);
                    }
                }
            }
        });
    }
});
