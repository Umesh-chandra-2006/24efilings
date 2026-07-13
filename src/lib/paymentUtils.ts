import { Lead, Customer } from '../types';

/**
 * Parses a reference or receipt number in the E-XXX-YYYY format
 * and returns the sequence if the year matches.
 */
const parseSequence = (refNum: string | undefined | null, year: number): number | null => {
    if (!refNum || !refNum.startsWith('E-')) return null;
    const parts = refNum.split('-');
    if (parts.length === 3) {
        const seq = parseInt(parts[1], 10);
        const refYear = parseInt(parts[2], 10);
        if (refYear === year && !isNaN(seq)) {
            return seq;
        }
    }
    return null;
};

/**
 * Calculates the next sequence number for a given year by scanning all existing leads
 * and identifying the maximum sequence number used so far in the E-XXX-YYYY format.
 */
export const getNextPaymentSequenceClientSide = (leads: Lead[], year: number): number => {
    let maxSequence = 0;
    
    leads.forEach(lead => {
        // Scan lead's own reference number
        const leadSeq = parseSequence(lead.reference_number, year);
        if (leadSeq !== null && leadSeq > maxSequence) {
            maxSequence = leadSeq;
        }

        // Scan lead's nested payments
        if (Array.isArray(lead.payments)) {
            lead.payments.forEach(payment => {
                const paySeq = parseSequence(payment.receipt_number, year);
                if (paySeq !== null && paySeq > maxSequence) {
                    maxSequence = paySeq;
                }
            });
        }
    });

    return maxSequence + 1;
};

/**
 * Scans both leads and customers (including their payments) to find the true global max sequence
 * and returns the next reference number string.
 */
export const generateReferenceNumber = (leads: Lead[], customers: Customer[], year: number): string => {
    let maxSequence = 0;

    // Scan leads
    leads.forEach(lead => {
        const leadSeq = parseSequence(lead.reference_number, year);
        if (leadSeq !== null && leadSeq > maxSequence) {
            maxSequence = leadSeq;
        }

        if (Array.isArray(lead.payments)) {
            lead.payments.forEach(payment => {
                const paySeq = parseSequence(payment.receipt_number, year);
                if (paySeq !== null && paySeq > maxSequence) {
                    maxSequence = paySeq;
                }
            });
        }
    });

    // Scan customers
    customers.forEach(customer => {
        const custSeq = parseSequence((customer as any).reference_number, year);
        if (custSeq !== null && custSeq > maxSequence) {
            maxSequence = custSeq;
        }

        if (customer.payment_details && Array.isArray(customer.payment_details.payments)) {
            customer.payment_details.payments.forEach(payment => {
                const paySeq = parseSequence(payment.receipt_number, year);
                if (paySeq !== null && paySeq > maxSequence) {
                    maxSequence = paySeq;
                }
            });
        }
    });

    const nextSequence = maxSequence + 1;
    return formatPaymentReferenceId(nextSequence, year);
};

/**
 * Formats a sequence number and year into the standard Reference ID format (e.g. E-001-2026)
 */
export const formatPaymentReferenceId = (sequence: number, year: number): string => {
    return `E-${String(sequence).padStart(3, '0')}-${year}`;
};

/**
 * Named alias for formatPaymentReferenceId for consistency.
 */
export const formatReferenceNumber = formatPaymentReferenceId;
