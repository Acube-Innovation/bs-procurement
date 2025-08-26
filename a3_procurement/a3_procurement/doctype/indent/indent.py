# Copyright (c) 2025, Acube and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class Indent(Document):

    def before_save(self):
        # By this point, self.name is guaranteed to exist
        self.indent_id_no = self.name

    def after_insert(self):
        """Create Material Request automatically when Indent is created"""
        self.create_material_request()

    def create_material_request(self):
        # Create a new Material Request
        mr = frappe.new_doc("Material Request")
        mr.material_request_type = "Purchase"
        mr.custom_indent_reference = self.name   # custom field linking back to Indent

        # Add items from Indent child table
        for row in self.items:
            mr.append("items", {
                "item_code": row.item,
                "qty": row.qty,
                "uom": row.unit,
                "schedule_date": row.required_date
            })

        # Insert into database
        mr.insert(ignore_permissions=True)
        # mr.submit()

def get_dashboard_data():
    return {
        "fieldname": "indent_reference",   # default field in linked doctypes
        "non_standard_fieldnames": {
            "Tender": "purchase_indent_reference",
            "Material Request": "custom_indent_reference",
            "Cost Estimate": "indent_reference"
        },
        "transactions": [
            {
                "label": "Linked Documents",
                "items": ["Tender", "Material Request", "Cost Estimate"]
            }
        ]
    }