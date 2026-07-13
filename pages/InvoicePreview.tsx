
import React, { useEffect, useState } from 'react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { InvoiceDocument } from '../components/InvoicePDF';
import { InvoiceData } from '../types';
import { Button } from '../components/ui/Button';
import { ArrowLeftIcon, DownloadIcon } from '../components/icons';

// Sample data for testing/seeding
const SAMPLE_INVOICE_DATA: InvoiceData = {
    "invoice_no": "2631",
    "invoice_datetime": "2025-11-29T15:04:00+05:30",
    "company": {
        "name": "Scion Financials Services Private Limited",
        "address": "H.No19, Rd Number 2B, Chandrapuri Colony, LB Nagar, Hyderabad, Telangana, India, 500074",
        "gstin": "36ABHCS2449Q1ZK",
        "pan": "ABHCS2449Q",
        "phone": "8187044222",
        "email": "Support@24efiling.com",
        "website": "www.24efiling.com"
    },
    "bill_to": {
        "name": "PALAKURA SATISH",
        "place_of_supply": "Telangana",
        "mobile": "9553420558"
    },
    "items": [
        {
            "sno": 1,
            "service_name": "GST RETURN",
            "description": "GST SERVICE AMOUNT FROM JAN TO NOV 4400/(PAID TO SEKHAR SIR)",
            "qty": 11,
            "rate": 500,
            "discount_amount": 1100,
            "discount_percent": 20,
            "amount": 4400
        },
        {
            "sno": 2,
            "service_name": "GST RETURN",
            "description": "GST LATE FILING CHALLAN FROM MAY TO OCT 2025...6 MONTHS@500(PAID TO SEKHAR SIR)",
            "qty": 6,
            "rate": 500,
            "discount_amount": 0,
            "discount_percent": 0,
            "amount": 3000
        },
        {
            "sno": 3,
            "service_name": "GST RETURN",
            "description": "GST SERVICE AMOUNT FROM DEC 2025 TO NOV 2026(PAID TO SEKHAR SIR)",
            "qty": 12,
            "rate": 500,
            "discount_amount": 2000,
            "discount_percent": 33.33,
            "amount": 4000
        }
    ],
    "totals": {
        "total_qty": 29,
        "subtotal": 11400,
        "tax_breakdown": [
            { "type": "CGST", "rate": 0, "amount": 0 },
            { "type": "SGST", "rate": 0, "amount": 0 }
        ],
        "total_amount": 11400,
        "previous_balance": 0,
        "current_balance": 0,
        "amount_in_words": "Eleven Thousand Four Hundred Rupees"
    },
    "bank_details": {
        "account_name": "SCION FINANCIAL SERVICES PRIVATE LIMITED",
        "ifsc": "MAHB0002556",
        "account_no": "60486598973",
        "bank_name": "Bank of Maharashtra, HAYATNAGAR"
    },
    "payment": {
        "upi_id": "qa12j9mi3n...@mahb",
        "qr_image_url": "https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" // Placeholder QR
    },
    "terms": [
        "100% Tax and Professional fee pay advance",
        "Customer is responsible Renewals and Provide Financials Information",
        "Any case Work order will cancel advance Amount will be returns in 7 working Days to same Account Number",
        "Invoice Transactions only Valid",
        "All disputes are subject to Ranga Reddy Telangana jurisdiction only"
    ],
    "authorized_signatory": {
        "name": "Scion Financials Services Private Limited",
        "signature_image_url": "https://upload.wikimedia.org/wikipedia/commons/b/b5/Signatur_sample.svg" // Placeholder Sig
    }
};

interface InvoicePreviewProps {
    onBack: () => void;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ onBack }) => {
    // In a real app, you might fetch data based on ID from URL params
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return null;

    return (
        <div className="h-screen flex flex-col bg-slate-100">
            <div className="bg-white shadow p-4 flex justify-between items-center z-10">
                <Button variant="ghost" onClick={onBack} className="gap-2">
                    <ArrowLeftIcon className="h-4 w-4" /> Back
                </Button>
                <h1 className="text-xl font-bold">Invoice Preview</h1>
                <PDFDownloadLink
                    document={<InvoiceDocument data={SAMPLE_INVOICE_DATA} />}
                    fileName={`Invoice-${SAMPLE_INVOICE_DATA.invoice_no}.pdf`}
                >
                    {({ loading }) => (
                        <Button disabled={loading} className="gap-2">
                            <DownloadIcon className="h-4 w-4" /> {loading ? 'Preparing...' : 'Download PDF'}
                        </Button>
                    )}
                </PDFDownloadLink>
            </div>
            <div className="flex-1 p-4 overflow-hidden">
                <PDFViewer width="100%" height="100%" className="rounded-xl shadow-lg border border-slate-200">
                    <InvoiceDocument data={SAMPLE_INVOICE_DATA} />
                </PDFViewer>
            </div>
        </div>
    );
};

export default InvoicePreview;
