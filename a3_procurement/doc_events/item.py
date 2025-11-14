import frappe

def update_disabled_on_approval(doc, method):
    """Automatically uncheck disabled only once when workflow_state becomes Approved"""
    if doc.workflow_state == "Approved" and doc.disabled:
        # Uncheck disabled only if this is the first approval
        prev_state = frappe.db.get_value("Item", doc.name, "workflow_state")

        if prev_state != "Approved":
            frappe.logger().info(f"✅ Unchecking 'disabled' for Item {doc.name} on first approval")
            doc.disabled = 0
