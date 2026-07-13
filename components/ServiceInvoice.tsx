import React from 'react';
import { Customer, Lead, ServiceSet } from '../types';
import { StandardInvoice, InvoiceItem } from './StandardInvoice';

interface ServiceInvoiceProps {
    customer: Customer;
    lead?: Lead;
    serviceSet: ServiceSet;
    invoiceNumber?: string; // Optional override; defaults to customer.reference_number
    date?: string;
}

export const ServiceInvoice: React.FC<ServiceInvoiceProps> = ({ customer, lead, serviceSet, invoiceNumber, date }) => {
    const items: InvoiceItem[] = serviceSet.subservices.map(sub => ({
        name: sub.name,
        quantity: sub.quantity,
        rate: sub.amount,
        taxAmount: sub.tax_amount,
        total: (sub.amount * sub.quantity) + (sub.tax_amount || 0),
        date: date || new Date().toLocaleDateString('en-GB')
    }));

    if (serviceSet.service_fee && serviceSet.service_fee > 0) {
        items.push({
            name: "Service Fee",
            quantity: 1,
            rate: serviceSet.service_fee,
            total: serviceSet.service_fee
        });
    }

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const discount = serviceSet.discount || 0;
    const grandTotal = subtotal - discount;

    // Use the standardized E-XXX-YYYY reference number as the primary invoice identifier.
    // Priority: explicit override > lead.reference_number > customer.reference_number > deterministic fallback
    const resolvedInvoiceNumber = invoiceNumber
        || lead?.reference_number
        || (customer as any).reference_number
        || `E-REF-${new Date().getFullYear()}`;

    return (
        <StandardInvoice 
            customer={customer}
            invoiceNumber={resolvedInvoiceNumber}
            date={date || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            items={items}
            subtotal={subtotal}
            discount={discount}
            grandTotal={grandTotal}
            type="invoice"
            title="TAX INVOICE"
        />
    );
};
