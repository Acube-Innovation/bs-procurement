# Copyright (c) 2025, Acube and contributors
# For license information, please see license.txt



import frappe
from frappe.utils import flt

def execute(filters=None):
    filters = filters or {}
    categorize_by = filters.get("categorize_by", "Item")

    columns = get_columns(categorize_by)
    data = get_data(filters, categorize_by)

    # Merge repeated first column values
    last_key = None
    for row in data:
        key = row[0]
        if key == last_key:
            row[0] = ""
        else:
            last_key = key

    return columns, data

def get_columns(categorize_by):
    first_col = {
        "fieldname": "supplier" if categorize_by == "Supplier" else "item",
        "label": "Supplier" if categorize_by == "Supplier" else "Item",
        "fieldtype": "Link",
        "options": "Supplier" if categorize_by == "Supplier" else "Item",
        "width": 180
    }

    rest = [
        {
            "label": "Item" if categorize_by == "Supplier" else "Supplier",
            "fieldname": "item_or_supplier",
            "fieldtype": "Link",
            "options": "Item" if categorize_by == "Supplier" else "Supplier",
            "width": 180
        },
        {"label": "Description", "fieldname": "description", "fieldtype": "Data", "width": 250},
        {"label": "UOM", "fieldname": "unit", "fieldtype": "Link", "options": "UOM", "width": 80},
        {"label": "Qty", "fieldname": "quantity", "fieldtype": "Float", "width": 80},
        {"label": "Rate", "fieldname": "rate", "fieldtype": "Currency", "width": 100},
        {"label": "Amount", "fieldname": "amount", "fieldtype": "Currency", "width": 120},
        {"label": "Delivery Date", "fieldname": "delivery_period", "fieldtype": "Date", "width": 120},
    ]

    return [first_col] + rest

def get_data(filters, categorize_by):
    conditions = ""
    tender = filters.get("tender")
    if tender:
        conditions += f" AND tr.tender_reference = '{tender}'"

    supplier_filter = filters.get("supplier")
    if supplier_filter:
        supplier_list = "', '".join(supplier_filter)
        conditions += f" AND tr.vendor IN ('{supplier_list}')"

    order_by = "tr.vendor, td.item" if categorize_by == "Supplier" else "td.item, tr.vendor"

    data = frappe.db.sql(f"""
        SELECT 
            tr.vendor,
            td.item,
            td.description,
            td.unit,
            td.quantity,
            td.rate,
            td.amount,
            td.delivery_period
        FROM `tabTender Response` tr
        JOIN `tabTender Details` td ON td.parent = tr.name
        WHERE tr.docstatus < 2 {conditions}
        ORDER BY {order_by}
    """, as_dict=True)

    out = []
    for row in data:
        out.append([
            row.vendor if categorize_by == "Supplier" else row.item,
            row.item if categorize_by == "Supplier" else row.vendor,
            row.description,
            row.unit,
            flt(row.quantity),
            flt(row.rate),
            flt(row.amount),
            row.delivery_period
        ])
    return out
