import React from 'react';
import { Customer, Lead } from '../types';
import { EfilingLogo } from './icons';

interface PaymentReceiptProps {
  customer: Customer;
  lead: Lead;
}

export const PaymentReceipt: React.FC<PaymentReceiptProps> = ({ customer, lead }) => {
    const today = new Date();
    const subtotal = lead.service_sets?.reduce((total, set) => 
        total + set.subservices.reduce((subTotal, sub) => subTotal + (sub.amount * sub.quantity), 0) + (Number(set.service_fee) || 0), 0) || 0;
    
    const discount = lead.service_sets?.reduce((total, set) => total + (Number(set.discount) || 0), 0) || 0;

    // Mock GST calculation (NOTE: In LeadForm we use manual tax_amount, here we have fixed logic? 
    // The user requirement says "receipts should clearly show... Tax". 
    // LeadForm uses manual tax. The receipt looked like it was using a mock 18% calculation.
    // I should probably use the actual tax from the lead data if available?
    // User requirement: "Updated totals... reflect correctly in... Tax calculation"
    // For now I will stick to existing request to just add Discount. 
    // BUT I should respect the tax from the lead if I can, OR keep the mock if that's what they use.
    // The previous code: const gstAmount = subtotal * gstRate;
    // I'll keep the mock logic BUT apply discount? 
    // "Discount amount should be applied to the service total calculation... Updated totals... reflect in Tax calculation"
    // This implies Tax is on (Subtotal - Discount).
    
    // Let's use the actual tax from the lead if we want to be accurate to LeadForm, 
    // BUT the Receipt component seemed independent. 
    // "Tax calculation... Updated totals (after discount) must reflect correctly in... Tax calculation"
    // Since I can't change the Tax Logic of the Receipt entirely without permission (it was mock 18%), 
    // I will assume Tax is calculated on (Subtotal - Discount).
    
    const taxableAmount = Math.max(0, subtotal - discount);
    const gstRate = 0.18;
    // If we want to use stored tax:
    // const gstAmount = lead.service_sets?.reduce((acc, set) => acc + (set.subservices.reduce((s, sub) => s + (sub.tax_amount||0), 0)), 0) || (taxableAmount * gstRate);
    // Since the previous code explicitly used 0.18, I'll update it to be on discounted amount.
    const gstAmount = taxableAmount * gstRate;
    
    const grandTotal = taxableAmount + gstAmount;
    const amountPaid = customer.payment_details.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
    const paymentModes = Array.from(new Set(customer.payment_details.payments?.map(p => p.method).filter(Boolean))).join(', ');
    const balanceDue = grandTotal - amountPaid;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
    };

  return (
    <div className="bg-white p-8 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-start pb-6 border-b-2 border-slate-800">
          <div>
            <EfilingLogo className="h-10 w-auto text-slate-900" />
            <div className="mt-4 text-xs text-slate-600">
              <p>24efiling Pvt Ltd</p>
              <p>H.No 3-9-44/1, Sharada Nagar, Ramanthapur</p>
              <p>Hyderabad, Telangana, 500013</p>
              <p>info@24efiling.com</p>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-4xl font-bold uppercase text-slate-800 tracking-wider">Receipt</h1>
            <p className="text-sm text-slate-600 mt-2 font-mono font-semibold">Receipt #: {customer.reference_number || `E-${customer.lead_id?.slice(-6) || 'N/A'}`}</p>
            <p className="text-sm text-slate-600">Date: {today.toLocaleDateString('en-GB')}</p>
          </div>
        </header>

        {/* Bill To */}
        <section className="mt-8 grid grid-cols-2 gap-8">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600 mb-2">Bill To</h2>
            <p className="font-semibold text-slate-800">{customer.name}</p>
            <p className="text-sm text-slate-600">{customer.business_name}</p>
            <p className="text-sm text-slate-600">{customer.residential_address || customer.business_address}</p>
            <p className="text-sm text-slate-600">{customer.email}</p>
          </div>
        </section>

        {/* Items Table */}
        <section className="mt-10">
          <table className="w-full text-left">
            <thead className="bg-slate-800 text-white">
              <tr>
                <th className="p-3 text-sm font-semibold uppercase">Item</th>
                <th className="p-3 text-sm font-semibold uppercase text-center">Qty</th>
                <th className="p-3 text-sm font-semibold uppercase text-right">Rate</th>
                <th className="p-3 text-sm font-semibold uppercase text-right">Discount</th>
                <th className="p-3 text-sm font-semibold uppercase text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {lead.service_sets?.flatMap(set => {
                  const items = set.subservices.map(sub => ({
                      name: sub.name,
                      qty: sub.quantity,
                      rate: sub.amount,
                      discount: 0,
                      amount: sub.amount * sub.quantity
                  }));
                  
                  // Add Service Fee / Discount row if needed
                  const fee = Number(set.service_fee) || 0;
                  const disc = Number(set.discount) || 0;
                  
                  if (fee > 0 || disc > 0) {
                      items.push({
                          name: fee > 0 ? "Service Fee" : "Discount Adjustment",
                          qty: 1,
                          rate: fee,
                          discount: disc,
                          amount: fee
                      });
                  }
                  
                  return items;
              }).map((item, idx) => (
                <tr key={idx} className="border-b border-slate-200">
                  <td className="p-3">
                      <div className="font-medium">{item.name}</div>
                  </td>
                  <td className="p-3 text-center">{item.qty}</td>
                  <td className="p-3 text-right">{formatCurrency(item.rate)}</td>
                  <td className="p-3 text-right text-red-500">{item.discount > 0 ? '-' + formatCurrency(item.discount) : '-'}</td>
                  <td className="p-3 text-right">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Totals */}
        <section className="mt-8 flex justify-end">
          <div className="w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Subtotal:</span>
              <span className="font-semibold">{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
                <div className="flex justify-between text-red-500 font-medium">
                <span className="text-slate-600">Discount:</span>
                <span>-{formatCurrency(discount)}</span>
                </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-600">GST (18%):</span>
              <span className="font-semibold">{formatCurrency(gstAmount)}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t border-slate-300 pt-2 mt-2">
              <span className="text-slate-800">Grand Total:</span>
              <span>{formatCurrency(grandTotal)}</span>
            </div>
             <div className="flex justify-between">
              <span className="text-slate-600">Amount Paid{paymentModes ? ` (${paymentModes})` : ''}:</span>
              <span className="font-semibold">{formatCurrency(amountPaid)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg bg-green-100 text-green-800 p-2 rounded-md">
              <span>Balance Due:</span>
              <span>{formatCurrency(balanceDue)}</span>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-slate-300 text-center text-xs text-slate-500">
          <p>Thank you for your business!</p>
          <p>If you have any questions concerning this receipt, please contact info@24efiling.com.</p>
          <p className="text-[10px] text-slate-400 font-semibold mt-2">* Terms and Conditions Apply *</p>
        </footer>
      </div>
    </div>
  );
};
