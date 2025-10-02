# Copyright (c) 2025, Acube and contributors
# For license information, please see license.txt

# import frappe
# from frappe.model.document import Document

# class TenderOpening(Document):
#     def on_update(self):
#         # Ensure purchase_indent is linked
#         if self.purchase_indent:
#             try:
#                 # Update the document_status of the linked indent
#                 frappe.db.set_value(
#                     "Indent",
#                     self.purchase_indent,
#                     "document_status",
#                     self.status
#                 )
#                 frappe.db.commit()
#             except Exception as e:
#                 frappe.throw(f"Error while updating Indent status: {e}")

import frappe
from frappe.model.document import Document

class TenderOpening(Document):
    def on_update(self):
        try:
            if self.status and self.reference:
                if self.reference == "Indent" and self.purchase_indent:
                    frappe.db.set_value(
                        "Indent",
                        self.purchase_indent,
                        "document_status",
                        self.status
                    )

                elif self.reference == "SCR" and self.scr_id:
                    frappe.db.set_value(
                        "Sub-Contract Request",
                        self.scr_id,
                        "document_status",
                        self.status
                    )

        except Exception as e:
            frappe.throw(f"Error while updating document status: {e}")
