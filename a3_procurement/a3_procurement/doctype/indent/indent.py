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
            # Try fetching Standard Buying price
            price = frappe.get_value(
                "Item Price",
                {"item_code": row.item, "price_list": "Standard Buying"},
                "price_list_rate"
            )

            mr.append("items", {
                "item_code": row.item,
                "qty": row.qty,
                "uom": row.unit,
                "schedule_date": row.required_date,
                "rate": price or 0,
                "project": self.project  
            })

        # Save & submit
        mr.insert(ignore_permissions=True)
        mr.submit()
