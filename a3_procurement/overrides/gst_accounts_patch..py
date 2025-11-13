from india_compliance.gst_india.overrides import transaction
import frappe

def custom_validate_for_charge_type(self):

    frappe.logger().info("Custom patch: Skipped validate_for_charge_type()")


transaction.GSTAccounts.validate_for_charge_type = custom_validate_for_charge_type