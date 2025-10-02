import frappe

def validate_purchase_invoice(doc, method):
    """
    Prevent saving if linked Purchase Receipt items that require inspection
    do not have a QA Clearance with status 'Completed'.
    """

    incomplete_msgs = []

    for item in doc.items:
        pr = item.get("purchase_receipt")  # safe access
        if not pr:
            continue  # this invoice item is not linked to a PR

        # Check whether this Item requires inspection before billing
        requires_inspection = frappe.db.get_value(
            "Item", item.item_code, "custom_inspection_required_before_billing"
        )
        if not requires_inspection:
            continue

        # Find all QA Clearances for that Purchase Receipt
        qa_list = frappe.get_all(
            "QA Clearance",
            filters={"purchase_receipt": pr},
            fields=["name", "status"]
        )

        if not qa_list:
            incomplete_msgs.append(f"PR {pr} requires QA but no QA Clearance found (Item: {item.item_code})")
            continue

        # If any found clearance is not Completed, report it
        not_completed = [f"{q['name']} (status: {q['status'] or 'Not set'})" for q in qa_list if q.get("status") != "Completed"]
        if not_completed:
            incomplete_msgs.append(f"PR {pr}, Item {item.item_code}: " + ", ".join(not_completed))

    if incomplete_msgs:
        frappe.throw("QA not completed for the following:\n\n" + "\n".join(incomplete_msgs))
