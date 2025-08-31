# a3_procurement/api.py
import frappe

@frappe.whitelist()
def get_invited_vendors(doctype, txt, searchfield, start, page_len, filters):
    """
    Custom query to restrict supplier list in Tender Response
    """
    tender = filters.get("tender_reference")
    if not tender:
        return []

    invited = frappe.get_all(
        "Invited in RFQ",
        filters={"parent": tender, "parenttype": "Tender"},
        pluck="vendor_name"
    )

    if not invited:
        return []

    return frappe.db.sql("""
        SELECT name, supplier_name
        FROM `tabSupplier`
        WHERE name in %(invited)s
        AND name LIKE %(txt)s
        ORDER BY name
        LIMIT %(start)s, %(page_len)s
    """, {
        "invited": invited,
        "txt": f"%{txt}%",
        "start": start,
        "page_len": page_len
    })
