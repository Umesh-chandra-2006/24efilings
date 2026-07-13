import { describe, it, expect } from 'vitest';
import { getNextPaymentSequenceClientSide, generateReferenceNumber, formatPaymentReferenceId } from '../lib/paymentUtils';
import { Lead, Customer } from '../types';

describe('paymentUtils', () => {
  describe('formatPaymentReferenceId', () => {
    it('should format sequence numbers with leading zeros', () => {
      expect(formatPaymentReferenceId(1, 2026)).toBe('E-001-2026');
      expect(formatPaymentReferenceId(45, 2026)).toBe('E-045-2026');
      expect(formatPaymentReferenceId(123, 2026)).toBe('E-123-2026');
    });
  });

  describe('getNextPaymentSequenceClientSide', () => {
    it('should return 1 when there are no leads', () => {
      expect(getNextPaymentSequenceClientSide([], 2026)).toBe(1);
    });

    it('should identify the maximum sequence matching the year', () => {
      const leads = [
        { reference_number: 'E-002-2026' },
        { reference_number: 'E-005-2026' },
        { reference_number: 'E-001-2025' }, // different year
      ] as Lead[];

      expect(getNextPaymentSequenceClientSide(leads, 2026)).toBe(6);
      expect(getNextPaymentSequenceClientSide(leads, 2025)).toBe(2);
    });

    it('should scan nested payments inside leads', () => {
      const leads = [
        {
          reference_number: 'E-001-2026',
          payments: [
            { receipt_number: 'E-004-2026' }
          ]
        }
      ] as unknown as Lead[];

      expect(getNextPaymentSequenceClientSide(leads, 2026)).toBe(5);
    });
  });

  describe('generateReferenceNumber', () => {
    it('should scan both leads and customers to find the maximum sequence', () => {
      const leads = [
        { reference_number: 'E-003-2026' }
      ] as Lead[];

      const customers = [
        {
          reference_number: 'E-007-2026',
          payment_details: {
            payments: [
              { receipt_number: 'E-009-2026' }
            ]
          }
        }
      ] as unknown as Customer[];

      const result = generateReferenceNumber(leads, customers, 2026);
      expect(result).toBe('E-010-2026');
    });
  });
});
