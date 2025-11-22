frappe.ui.form.on("Sales Invoice Item", {
    custom_assessible_value(frm, cdt, cdn) {
        let row = frappe.get_doc(cdt, cdn);

        // update ERPNext taxable_value field
        row.taxable_value = row.custom_assessible_value;

        frm.refresh_field("items");

        // trigger ERPNext's native tax engine
        frm.trigger("calculate_taxes_and_totals");
    }
});


frappe.ui.form.on("Sales Invoice", {
    refresh(frm) {
        // wait some time → ensure india compliance JS is loaded
        setTimeout(() => {
            override_ic_js();
        }, 500);
    }
});


function override_ic_js() {
    // india_compliance JS object is normally: window.ic
    if (!window.ic || !ic.transaction) {
        return;
    }

    // patch only once
    if (ic.transaction._patched_actual_tax === true) {
        return;
    }

    ic.transaction._patched_actual_tax = true;

    // keep original function
    const original = ic.transaction.validate_tax_row;

    ic.transaction.validate_tax_row = function (frm, cdt, cdn) {
        try {
            return original(frm, cdt, cdn);
        } catch (e) {
            const msg = (e.message || e).toString();

            // block only this error:
            if (msg.includes("Charge Type is set to Actual")) {
                frappe.msgprint("⚠ Allowed Actual Tax Row (JS override).");
                return;
            }

            // rethrow other errors
            throw e;
        }
    };

    console.log("✔ India Compliance Actual-tax JS validation overridden.");
}
