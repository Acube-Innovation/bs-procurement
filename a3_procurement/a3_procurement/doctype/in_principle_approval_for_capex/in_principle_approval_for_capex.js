// Copyright (c) 2025, Acube and contributors
// For license information, please see license.txt

frappe.ui.form.on('In-Principle Approval for CAPEX', {
    refresh: function(frm) {
        if (frm.doc.docstatus === 1) {
            frm.add_custom_button(__('Create Purchase Indent'), function() {
                frappe.model.with_doctype('Indent', function() {
                    let indent = frappe.model.get_new_doc('Indent');

                    indent.indent_type = 'Capex';
                    indent.in_principle_request = frm.doc.name;
                    indent.department_requisition_number = frm.doc.department_requisition_no;
                    indent.reference_wo_no = frm.doc.customer_orderwo_reference;
                    indent.departmentsection = frm.doc.departmentsection;

                    // Navigate to the new Indent
                    frappe.set_route('Form', 'Indent', indent.name);

                    // Wait until the form is loaded
                    frappe.ui.form.on('Indent', {
                        onload: function(indentFrm) {
                            if (indentFrm.doc.name === indent.name && indentFrm.doc.items.length === 0) {
                                (frm.doc.particulars || []).forEach(row => {
                                    let child = indentFrm.add_child('items');
                                    child.item = row.item;
                                    child.qty = row.qty;
                                    child.unit = row.unit;
                                    child.description = row.description;
                                    child.required_date = row.required_date;
                                });
                                indentFrm.refresh_field('items');
                            }
                        }
                    });
                });
            }, __('Create')).addClass('btn-secondary');
        }
    }
});
