import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { InvoiceData } from '../types';
import { format } from 'date-fns';

// Register fonts if needed, otherwise use built-in Helvetica
// Font.register({ family: 'Roboto', src: 'path/to/fonts/Roboto-Regular.ttf' });

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 9,
        fontFamily: 'Helvetica',
        lineHeight: 1.3,
    },
    header: {
        flexDirection: 'row',
        marginBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        paddingBottom: 5,
    },
    logoContainer: {
        width: '20%',
    },
    logo: {
        width: 60,
        height: 40,
        objectFit: 'contain',
    },
    companyDetails: {
        width: '40%',
        paddingRight: 10,
    },
    companyName: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    metaContainer: {
        width: '40%',
        textAlign: 'right',
    },
    invoiceTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    labelVal: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    label: {
        width: 70,
        fontWeight: 'bold',
    },
    value: {
        width: 100,
    },
    billToData: {
        borderTopWidth: 1,
        borderTopColor: '#000',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        paddingVertical: 4,
        marginTop: 2,
        marginBottom: 5
    },
    sectionTitle: {
        fontWeight: 'bold',
        marginBottom: 2,
        textTransform: 'uppercase',
        fontSize: 8,
    },
    table: {
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        marginBottom: 5,
    },
    tableRow: {
        margin: 'auto',
        flexDirection: 'row',
    },
    tableColHeader: {
        borderStyle: 'solid',
        borderBottomWidth: 1,
        borderRightWidth: 1,
        backgroundColor: '#f0f0f0',
        padding: 3,
    },
    tableCol: {
        borderStyle: 'solid',
        borderBottomWidth: 1,
        borderRightWidth: 1,
        padding: 3,
    },
    colSNo: { width: '8%', textAlign: 'center' },
    colService: { width: '42%' },
    colQty: { width: '10%', textAlign: 'center' },
    colRate: { width: '12%', textAlign: 'right' },
    colDisc: { width: '13%', textAlign: 'right' },
    colAmount: { width: '15%', textAlign: 'right' },

    description: {
        fontSize: 8,
        color: '#444',
    },
    totalsSection: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 2,
    },
    totalRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        paddingVertical: 2,
    },
    totalLabel: {
        width: 60,
        textAlign: 'right',
        paddingRight: 5,
        fontWeight: 'bold',
    },
    totalValue: {
        width: 80,
        textAlign: 'right',
    },
    bankAndQr: {
        flexDirection: 'row',
        marginTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#000',
        paddingTop: 5,
    },
    bankDetails: {
        width: '60%',
        paddingRight: 10,
    },
    qrContainer: {
        width: '40%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    qrImage: {
        width: 60,
        height: 60,
    },
    footer: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    terms: {
        width: '60%',
        fontSize: 7,
    },
    signature: {
        width: '35%',
        textAlign: 'center',
    },
    signatureImage: {
        width: 80,
        height: 40,
        marginHorizontal: 'auto',
        marginBottom: 5,
    },
});

export const InvoiceDocument: React.FC<{ data: InvoiceData }> = ({ data }) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Image src="/logo-full.png" style={styles.logo} />
                    </View>
                    <View style={styles.companyDetails}>
                        <Text style={styles.companyName}>{data.company.name}</Text>
                        <Text>{data.company.address}</Text>
                        <Text>GSTIN: {data.company.gstin}</Text>
                        <Text>PAN: {data.company.pan}</Text>
                        <Text>Email: {data.company.email}</Text>
                        <Text>Web: {data.company.website}</Text>
                    </View>
                    <View style={styles.metaContainer}>
                        <Text style={styles.invoiceTitle}>TAX INVOICE</Text>
                        <View style={styles.labelVal}><Text style={styles.label}>Invoice No:</Text><Text style={styles.value}>{data.invoice_no}</Text></View>
                        <View style={styles.labelVal}><Text style={styles.label}>Date:</Text><Text style={styles.value}>{format(new Date(data.invoice_datetime), 'dd/MM/yyyy h:mm a')}</Text></View>
                    </View>
                </View>

                {/* Bill To */}
                <View style={styles.billToData}>
                    <Text style={styles.sectionTitle}>BILL TO</Text>
                    <Text style={{ fontWeight: 'bold' }}>{data.bill_to.name}</Text>
                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 2 }}>
                        <Text>Place of Supply: {data.bill_to.place_of_supply}</Text>
                        <Text>Mobile: {data.bill_to.mobile}</Text>
                    </View>
                </View>

                {/* Table items */}
                <View style={styles.table}>
                    {/* Header */}
                    <View style={styles.tableRow}>
                        <View style={[styles.tableColHeader, styles.colSNo]}><Text>S.NO.</Text></View>
                        <View style={[styles.tableColHeader, styles.colService]}><Text>SERVICES</Text></View>
                        <View style={[styles.tableColHeader, styles.colQty]}><Text>QTY.</Text></View>
                        <View style={[styles.tableColHeader, styles.colRate]}><Text>RATE</Text></View>
                        <View style={[styles.tableColHeader, styles.colDisc]}><Text>DISC.</Text></View>
                        <View style={[styles.tableColHeader, styles.colAmount]}><Text>AMOUNT</Text></View>
                    </View>
                    {/* Rows */}
                    {data.items.map((item, index) => (
                        <View style={styles.tableRow} key={index}>
                            <View style={[styles.tableCol, styles.colSNo]}><Text>{item.sno}</Text></View>
                            <View style={[styles.tableCol, styles.colService]}>
                                <Text style={{ fontWeight: 'bold' }}>{item.service_name}</Text>
                                <Text style={styles.description}>{item.description}</Text>
                            </View>
                            <View style={[styles.tableCol, styles.colQty]}><Text>{item.qty}</Text></View>
                            <View style={[styles.tableCol, styles.colRate]}><Text>{item.rate.toFixed(2)}</Text></View>
                            <View style={[styles.tableCol, styles.colDisc]}><Text>{item.discount_amount > 0 ? item.discount_amount.toFixed(2) : '0'}</Text></View>
                            <View style={[styles.tableCol, styles.colAmount]}><Text>{item.amount.toFixed(2)}</Text></View>
                        </View>
                    ))}
                    {/* Total Row in Table */}
                    <View style={[styles.tableRow, { backgroundColor: '#f9f9f9' }]}>
                        <View style={[styles.tableCol, { width: '50%', borderRightWidth: 0 }]}><Text style={{ textAlign: 'right', fontWeight: 'bold' }}>Total</Text></View>
                        <View style={[styles.tableCol, styles.colQty]}><Text style={{ fontWeight: 'bold' }}>{data.totals.total_qty}</Text></View>
                        <View style={[styles.tableCol, { width: '25%', borderRightWidth: 0 }]}><Text> </Text></View>
                        <View style={[styles.tableCol, styles.colAmount]}><Text style={{ fontWeight: 'bold' }}>₹ {data.totals.total_amount.toLocaleString('en-IN')}</Text></View>
                    </View>
                </View>

                {/* Tax Breakdown & Totals Summary */}
                <View>
                    <View style={[styles.table, { marginTop: 0, marginBottom: 5 }]}>
                        <View style={styles.tableRow}>
                            <View style={[styles.tableCol, { flex: 1 }]}><Text style={{ fontWeight: 'bold' }}>Previous Balance</Text></View>
                            <View style={[styles.tableCol, { width: 100, textAlign: 'right' }]}><Text>₹ {data.totals.previous_balance}</Text></View>
                        </View>
                        <View style={styles.tableRow}>
                            <View style={[styles.tableCol, { flex: 1 }]}><Text style={{ fontWeight: 'bold' }}>Current Balance</Text></View>
                            <View style={[styles.tableCol, { width: 100, textAlign: 'right' }]}><Text>₹ {data.totals.current_balance}</Text></View>
                        </View>
                    </View>

                    {/* Tax Table */}
                    <View style={styles.table}>
                        <View style={styles.tableRow}>
                            <View style={[styles.tableColHeader, { width: '20%' }]}><Text>HSN/SAC</Text></View>
                            <View style={[styles.tableColHeader, { width: '20%' }]}><Text>Taxable Value</Text></View>
                            <View style={[styles.tableColHeader, { width: '20%' }]}><Text>CGST</Text></View>
                            <View style={[styles.tableColHeader, { width: '20%' }]}><Text>SGST</Text></View>
                            <View style={[styles.tableColHeader, { width: '20%' }]}><Text>Total Tax Amount</Text></View>
                        </View>
                        <View style={styles.tableRow}>
                            <View style={[styles.tableCol, { width: '20%' }]}><Text>-</Text></View>
                            <View style={[styles.tableCol, { width: '20%', textAlign: 'right' }]}><Text>{data.totals.subtotal.toLocaleString('en-IN')}</Text></View>
                            {/* Simplified tax Logic based on sample, assuming CGST/SGST same for all for now or 0 */}
                            <View style={[styles.tableCol, { width: '20%', textAlign: 'right' }]}><Text>0%   0</Text></View>
                            <View style={[styles.tableCol, { width: '20%', textAlign: 'right' }]}><Text>0%   0</Text></View>
                            <View style={[styles.tableCol, { width: '20%', textAlign: 'right' }]}><Text>0</Text></View>
                        </View>
                    </View>
                </View>

                <View style={{ marginTop: 5, marginBottom: 5 }}>
                    <Text style={{ fontSize: 10 }}>Total Amount (in words):</Text>
                    <Text style={{ fontWeight: 'bold', fontSize: 10 }}>{data.totals.amount_in_words}</Text>
                </View>

                {/* Bank & QR */}
                <View style={styles.bankAndQr}>
                    <View style={styles.bankDetails}>
                        <Text style={styles.sectionTitle}>Bank Details</Text>
                        <Text>Account Name: {data.bank_details.account_name}</Text>
                        <Text>Bank Name: {data.bank_details.bank_name}</Text>
                        <Text>Account No: {data.bank_details.account_no}</Text>
                        <Text>IFSC Code: {data.bank_details.ifsc}</Text>
                    </View>
                    <View style={styles.qrContainer}>
                        <Text style={[styles.sectionTitle, { marginBottom: 5 }]}>PAYMENT QR CODE</Text>
                        {data.payment.qr_image_url && (
                            <Image src={data.payment.qr_image_url} style={styles.qrImage} />
                        )}
                        <Text style={{ fontSize: 8, marginTop: 2 }}>UPI: {data.payment.upi_id}</Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <View style={styles.terms}>
                        <Text style={styles.sectionTitle}>Terms & Conditions</Text>
                        {data.terms.map((term, i) => (
                            <Text key={i}>{i + 1}. {term}</Text>
                        ))}
                    </View>
                    <View style={styles.signature}>
                        {data.authorized_signatory.signature_image_url && (
                            <Image src={data.authorized_signatory.signature_image_url} style={styles.signatureImage} />
                        )}
                        <Text>Authorized Signatory For</Text>
                        <Text style={{ fontWeight: 'bold' }}>{data.authorized_signatory.name}</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};
