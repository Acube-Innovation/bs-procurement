// Copyright (c) 2025, Acube and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Proprietory Article Certificate", {
// 	refresh(frm) {

// 	},
// });
frappe.ui.form.on('Proprietory Article Certificate', {
    onload: function(frm) {
        // Set current user
        if (!frm.doc.user) {
            frm.set_value('user', frappe.session.user);
        }

        // Fetch employee and department
        frappe.call({
            method: 'frappe.client.get_list',
            args: {
                doctype: 'Employee',
                filters: {
                    user_id: frappe.session.user
                },
                fields: ['name', 'department'],
                limit_page_length: 1
            },
            callback: function(response) {
                const data = response.message;
                if (data && data.length > 0) {
                    frm.set_value('employee', data[0].name);
                    frm.set_value('department', data[0].department);
                }
            }
        });
    }
});
