import frappe

import frappe

def custom_set_item_wise_taxable_value(doc, method=None):
  
    for tax in doc.taxes:
        tax.dont_recompute_tax = 0
        tax.item_wise_tax_detail = None  

    for item in doc.items:
        if item.custom_fim_value:
            item.custom_assessible_value = item.custom_fim_value + item.amount
            

     
        if item.custom_assessible_value and item.custom_assessible_value > 0:
            custom_value = item.custom_assessible_value
        else:
            custom_value = item.base_net_amount

        item.net_amount = custom_value
        item.amount = custom_value
        item.base_net_amount = custom_value

     
        item.amount = custom_value
        item.base_amount = custom_value

   
        item.taxable_value = custom_value

  
    doc.calculate_taxes_and_totals()

    frappe.logger().debug("✅ GST recalculated successfully using custom assessible value")

  
   

def patch_india_compliance_tax(doc, method=None):
    """
    Patch BOTH India Compliance functions:
    - validate_item_wise_tax_detail (ACTUAL tax throw)
    - validate_item_gst_details (GST mismatch throw)
    """

    if getattr(frappe.local, "_patched_ic_actual", False):
        return
    frappe.local._patched_ic_actual = True

    patch_ic_validate_item_wise_tax_detail()
    patch_ic_validate_item_gst_details()


# ------------------------------------------------------------------------------
# 1️⃣ Patch the ACTUAL tax throw inside:
#    india_compliance/gst_india/overrides/transaction.py → validate_item_wise_tax_detail
# ------------------------------------------------------------------------------

def patch_ic_validate_item_wise_tax_detail():
    try:
        import india_compliance.gst_india.overrides.transaction as ic_trx
    except Exception:
        return

    if not hasattr(ic_trx, "_orig_validate_item_wise_tax_detail"):
        ic_trx._orig_validate_item_wise_tax_detail = ic_trx.validate_item_wise_tax_detail

    original = ic_trx._orig_validate_item_wise_tax_detail

    def patched(doc):
        try:
            return original(doc)

        except Exception as e:
            msg = str(e)

            # 🔥 ACTUAL TAX THROW #1
            if "would not compute item taxes" in msg:
                frappe.msgprint("⚠ Allowed Actual tax: item-wise computation skipped.")
                return

            # 🔥 ACTUAL TAX THROW #2 (mismatch)
            if "Tax Amount" in msg and "incorrect" in msg:
                frappe.msgprint("⚠ Allowed Actual tax: mismatch ignored.")
                return

            # Otherwise, re-raise
            raise e

    ic_trx.validate_item_wise_tax_detail = patched



# ------------------------------------------------------------------------------
# 2️⃣ Patch GST amount mismatch inside:
#    india_compliance/gst_india/overrides/transaction.py → ItemGSTDetails.validate_item_gst_details
# ------------------------------------------------------------------------------

def patch_ic_validate_item_gst_details():
    try:
        from india_compliance.gst_india.overrides.transaction import ItemGSTDetails
    except Exception:
        return

    if not hasattr(ItemGSTDetails, "_orig_validate_item_gst_details"):
        ItemGSTDetails._orig_validate_item_gst_details = ItemGSTDetails.validate_item_gst_details

    original = ItemGSTDetails._orig_validate_item_gst_details

    def patched(self):
        try:
            return original(self)

        except Exception as e:
            msg = str(e)

            # 🔥 THROW #3 — GST mismatch
            if "GST amounts do not match" in msg or "amount mismatch" in msg:
                frappe.msgprint("⚠ Allowed Actual GST mismatch (ignored).")
                return

            raise e

    ItemGSTDetails.validate_item_gst_details = patched
