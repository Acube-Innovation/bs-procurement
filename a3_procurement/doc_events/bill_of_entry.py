import frappe

def override_bill_of_entry_tax_validation(doc, method=None):
    """
    Patch India Compliance:
    Disable Actual tax validations inside Bill of Entry validate_taxes().
    """

    # prevent double-patching per request
    if getattr(frappe.local, "_patched_boetry", False):
        return
    frappe.local._patched_boetry = True

    try:
        import india_compliance.gst_india.doctype.bill_of_entry.bill_of_entry as boe
    except Exception:
        return

    # Backup original if not already backed up
    if not hasattr(boe.BillOfEntry, "_orig_validate_taxes"):
        boe.BillOfEntry._orig_validate_taxes = boe.BillOfEntry.validate_taxes

    original = boe.BillOfEntry._orig_validate_taxes

    def patched_validate_taxes(self):
        try:
            return original(self)
        except Exception as e:
            msg = str(e)

            # ❌ THROW 1: "Charge Type is set to Actual. However, this would not compute item taxes"
            if "would not compute item taxes" in msg:
                frappe.msgprint("⚠ Allowed Actual GST (Bill of Entry override applied).")
                return

            # ❌ THROW 2: "Tax Amount X is incorrect. Try setting Charge Type to ..."
            if "Tax Amount" in msg and "incorrect" in msg:
                frappe.msgprint("⚠ Allowed Actual GST mismatch (Bill of Entry override).")
                return

            # allow other real errors
            raise e

    # Apply monkey patch
    boe.BillOfEntry.validate_taxes = patched_validate_taxes
