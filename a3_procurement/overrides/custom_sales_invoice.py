from erpnext.accounts.doctype.sales_invoice.sales_invoice import SalesInvoice
import frappe

class CustomSalesInvoice(SalesInvoice):

    def set_item_wise_taxable_value(doc,method):
      
        """
        Override ONLY the taxable_value logic.
        Keep custom_assessible_value if present; else use default ERPNext logic.
        """
        frappe.throw("hhhhh")
        for item in doc.items:
            if item.custom_assessible_value:
                item.taxable_value = item.custom_assessible_value
            else:
                # call ERPNext default behavior
                item.taxable_value = item.base_net_amount
