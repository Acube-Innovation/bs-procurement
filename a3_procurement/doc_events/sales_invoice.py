import frappe

def apply_ic_patches(doc, method=None):
    """
    Apply all India-Compliance patches:
    - Disable throws inside validate_item_wise_tax_detail()
    - Disable throws inside ItemGSTDetails.validate_item_gst_details()
    """

    # Avoid double patching per request
    if getattr(frappe.local, "_patched_india_compliance", False):
        return
    frappe.local._patched_india_compliance = True

    patch_validate_item_wise_tax_detail()
    patch_validate_item_gst_details()


# --------------------------------------------------------------------------
# 1️⃣ Patch: validate_item_wise_tax_detail (Actual tax throw #1 & #2)
# --------------------------------------------------------------------------

def patch_validate_item_wise_tax_detail():
    try:
        import erpnext.regional.india.sales_invoice as ic
    except Exception:
        return

    # backup original function
    if not hasattr(ic, "_orig_item_tax_detail"):
        ic._orig_item_tax_detail = ic.validate_item_wise_tax_detail

    original = ic._orig_item_tax_detail

    def patched(doc):
        try:
            return original(doc)
        except Exception as e:
            msg = str(e)

            # Throw 1: "would not compute item taxes"
            if "would not compute item taxes" in msg:
                frappe.msgprint("⚠ Actual tax allowed: skipped per-item tax computation.")
                return

            # Throw 2: mismatch in item-wise actual tax
            if "Tax Amount" in msg and "incorrect" in msg:
                frappe.msgprint("⚠ Actual tax allowed: mismatch ignored.")
                return

            # Other exceptions should continue
            raise e

    ic.validate_item_wise_tax_detail = patched



# --------------------------------------------------------------------------
# 2️⃣ Patch: ItemGSTDetails.validate_item_gst_details (Actual tax mismatch)
# --------------------------------------------------------------------------

def patch_validate_item_gst_details():
    try:
        from india_compliance.gst_india.overrides.transaction import ItemGSTDetails
    except Exception:
        return

    if not hasattr(ItemGSTDetails, "_orig_validate_item_gst_details"):
        ItemGSTDetails._orig_validate_item_gst_details = ItemGSTDetails.validate_item_gst_details

    original = ItemGSTDetails._orig_validate_item_gst_details

    def patched_validate_item_gst_details(self):
        try:
            return original(self)
        except Exception as e:
            msg = str(e)

            # Throw: "GST amounts do not match... IGST amount mismatch"
            if "GST amounts do not match" in msg or "amount mismatch" in msg:
                frappe.msgprint("⚠ Actual GST tax mismatch ignored (override applied).")
                return

            # Other errors must pass through
            raise e

    ItemGSTDetails.validate_item_gst_details = patched_validate_item_gst_details
