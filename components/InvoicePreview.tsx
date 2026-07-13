
import React, { useState } from 'react';
import { ServiceSet, Service } from '../types';
import { StandardInvoice, InvoiceItem } from './StandardInvoice';
import { Button } from './ui/Button';
import { ChevronRightIcon, ChevronLeftIcon } from 'lucide-react';

interface InvoicePreviewProps {
    customerName: string; // Contact Person Name
    businessName: string;
    email: string;
    phone: string;
    address: string;
    description?: string;
    serviceSets: ServiceSet[];
    advanceAmount: number;
    grandTotal: number;
    referenceNumber?: string;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ 
    customerName,
    businessName,
    email,
    phone,
    address,
    description, 
    serviceSets, 
    advanceAmount, 
    grandTotal,
    referenceNumber
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!serviceSets || serviceSets.length === 0) {
        return <div className="p-6 text-center text-slate-500">No services selected to preview.</div>;
    }

    const currentServiceSet = serviceSets[currentIndex];

    // Helper to convert ServiceSet items to InvoiceItem[]
    const getInvoiceItems = (serviceSet: ServiceSet): InvoiceItem[] => {
        const discountAmount = serviceSet.discount || 0;

        const items: InvoiceItem[] = serviceSet.subservices.map(sub => ({
            name: sub.name,
            quantity: sub.quantity,
            rate: sub.amount,
            taxAmount: sub.tax_amount,
            total: (sub.amount * sub.quantity) + (sub.tax_amount || 0)
        }));

        if (serviceSet.service_fee && serviceSet.service_fee > 0) {
            const feeTotal = serviceSet.service_fee - discountAmount;
            items.push({
                name: "Service Fee",
                quantity: 1,
                rate: serviceSet.service_fee,
                discount: discountAmount > 0 ? discountAmount : undefined,
                advance: serviceSet.advance_amount && serviceSet.advance_amount > 0 ? serviceSet.advance_amount : undefined,
                total: feeTotal
            });
        } else if (items.length > 0) {
             const lastItem = items[items.length - 1];
             if (serviceSet.advance_amount && serviceSet.advance_amount > 0) {
                 lastItem.advance = serviceSet.advance_amount;
                 lastItem.paymentMode = serviceSet.payment_mode;
             }
             if (discountAmount > 0) {
                 lastItem.discount = discountAmount;
                 lastItem.total = lastItem.total - discountAmount;
             }
        }
        return items;
    };

    const items = getInvoiceItems(currentServiceSet);
    const setTotal = items.reduce((sum, item) => sum + item.total, 0);

    // Construct customer object for preview
    const mockCustomer: any = {
        name: customerName,
        email: email || "email@example.com",
        phone: phone || "9999999999",
        business_name: businessName,
        business_address: address || "123 Business St, City"
    };

    return (
        <div>
            {/* Navigation for Multiple Invoices */}
            {serviceSets.length > 1 && (
                <div className="flex items-center justify-between mb-4 bg-slate-100 p-2 rounded-lg">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentIndex === 0}
                    >
                        <ChevronLeftIcon className="h-4 w-4 mr-1" /> Prev
                    </Button>
                    <span className="text-sm font-medium text-slate-700">
                        Invoice {currentIndex + 1} of {serviceSets.length}: {currentServiceSet.mainService}
                    </span>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setCurrentIndex(prev => Math.min(serviceSets.length - 1, prev + 1))}
                        disabled={currentIndex === serviceSets.length - 1}
                    >
                        Next <ChevronRightIcon className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            )}

            <StandardInvoice 
                customer={mockCustomer}
                invoiceNumber={referenceNumber || `DRAFT-${Date.now().toString().slice(-4)}`}
                date={new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                items={items}
                subtotal={setTotal + (currentServiceSet.discount || 0)}
                discount={currentServiceSet.discount || 0}
                grandTotal={setTotal} // Each invoice shows its own total
                advanceAmount={currentServiceSet.advance_amount || 0}
                title="INVOICE PREVIEW"
                type="invoice"
                promoCode={currentServiceSet.promo_code}
                paymentMode={currentServiceSet.payment_mode}
            />
            {/* Show notes if multiple invoices */}
            {serviceSets.length > 1 && advanceAmount > 0 && (
                <p className="text-xs text-orange-600 mt-2 text-center">
                    * Total Advance across all services: ₹{advanceAmount.toLocaleString('en-IN')}
                </p>
            )}
        </div>
    );
};
