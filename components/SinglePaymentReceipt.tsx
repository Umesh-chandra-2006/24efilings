
import React from 'react';
import { Customer, Lead, Payment } from '../types';
import { StandardInvoice, InvoiceItem } from './StandardInvoice';

interface SinglePaymentReceiptProps {
  customer: Customer;
  lead: Lead;
  payment: Payment;
}

export const SinglePaymentReceipt: React.FC<SinglePaymentReceiptProps> = ({ customer, lead, payment }) => {
  // Attempt to find the service set and discount
  const serviceSet = lead?.service_sets?.find(s => s.id === payment.service_set_id);
  const discount = serviceSet?.discount || 0;

  // Logic: 
  // User wants to see the discount.
  // We assume the Payment Amount is the Net (Paid) Amount.
  // We calculate Gross as Net + Discount.
  // This ensures the Table shows: Rate (Gross), Discount, Total (Net).
  // And Summary shows: Subtotal (Gross), Discount, Total (Net).

  const item: InvoiceItem = {
      name: payment.service_name || "Payment Received",
      description: `Payment via ${payment.method} ${payment.notes ? `(${payment.notes})` : ''}`,
      quantity: 1,
      rate: payment.amount + discount, // Gross Rate
      discount: discount, // Discount
      total: payment.amount // Net Amount (Paid)
  };

  return (
    <StandardInvoice 
        customer={customer}
        invoiceNumber={payment.receipt_number || customer.reference_number || lead?.reference_number || `E-000-${new Date(payment.date).getFullYear()}`}
        date={new Date(payment.date).toLocaleDateString()}
        items={[item]}
        subtotal={payment.amount + discount} // Gross Subtotal
        discount={discount} // Discount Prop for Summary
        grandTotal={payment.amount} // Net Grand Total
        title="PAYMENT RECEIPT"
        type="receipt"
        promoCode={serviceSet?.promo_code}
    />
  );
};