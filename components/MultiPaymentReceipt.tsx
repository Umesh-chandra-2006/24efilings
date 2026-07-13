
import React from 'react';
import { Customer, Lead, Payment } from '../types';
import { StandardInvoice, InvoiceItem } from './StandardInvoice';

interface MultiPaymentReceiptProps {
    customer: Customer;
    lead: Lead;
    payments: Payment[];
}

export const MultiPaymentReceipt: React.FC<MultiPaymentReceiptProps> = ({ customer, payments }) => {
    const items: InvoiceItem[] = payments.map(p => ({
        name: p.service_name || "Payment Received",
        description: `Receipt #${p.receipt_number} - ${p.method} - ${new Date(p.date).toLocaleDateString()}`,
        quantity: 1,
        rate: p.amount,
        total: p.amount
    }));

    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

    return (
        <StandardInvoice 
            customer={customer}
            invoiceNumber={`STM-${Date.now().toString().slice(-6)}`}
            date={new Date().toLocaleDateString()}
            items={items}
            subtotal={totalAmount}
            grandTotal={totalAmount}
            title="PAYMENT STATEMENT"
            type="receipt"
        />
    );
};
