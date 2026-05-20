import { Transaction } from './index';

const today = new Date();
const getDaysAgo = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
};

export const transactions: Transaction[] = [
  {
    transaction_id: 'TXN-00001',
    cashier_id: 'USR-00001', // Rina Maharani
    service_id: 'SRV-00001', // Print B&W A4 (1 sided) - Rp 300
    quantity: 50,
    subtotal: 15000,
    tax_amount: 1650, // 11% Tax
    total_amount: 16650,
    payment_method: 'CASH',
    payment_status: 'PAID',
    transaction_date: `${getDaysAgo(2)}T09:30:00Z`
  },
  {
    transaction_id: 'TXN-00002',
    cashier_id: 'USR-00002', // Budi Santoso
    service_id: 'SRV-00013', // Spiral Binding - Rp 15.000
    quantity: 2,
    subtotal: 30000,
    tax_amount: 3300,
    total_amount: 33300,
    payment_method: 'QRIS',
    payment_status: 'PAID',
    transaction_date: `${getDaysAgo(2)}T10:15:00Z`
  },
  {
    transaction_id: 'TXN-00003',
    cashier_id: 'USR-00001', // Rina Maharani
    service_id: 'SRV-00005', // Print Color A4 (1 sided) - Rp 1.500
    quantity: 10,
    subtotal: 15000,
    tax_amount: 1650,
    total_amount: 16650,
    payment_method: 'DEBIT',
    payment_status: 'PAID',
    transaction_date: `${getDaysAgo(2)}T11:05:00Z`
  },
  {
    transaction_id: 'TXN-00004',
    cashier_id: 'USR-00004', // Ahmad Fauzi
    service_id: 'SRV-00025', // Passport Photo (4 x 6 cm) - Rp 25.000
    quantity: 4,
    subtotal: 100000,
    tax_amount: 11000,
    total_amount: 111000,
    payment_method: 'QRIS',
    payment_status: 'PAID',
    transaction_date: `${getDaysAgo(2)}T13:20:00Z`
  },
  {
    transaction_id: 'TXN-00005',
    cashier_id: 'USR-00004', // Ahmad Fauzi
    service_id: 'SRV-00009', // Photocopy B&W A4 (1 sided) - Rp 250
    quantity: 200,
    subtotal: 50000,
    tax_amount: 5500,
    total_amount: 55500,
    payment_method: 'CASH',
    payment_status: 'PAID',
    transaction_date: `${getDaysAgo(2)}T15:45:00Z`
  },
  {
    transaction_id: 'TXN-00006',
    cashier_id: 'USR-00003', // Siti Nurhaliza
    service_id: 'SRV-00018', // Laminating A4 - Rp 5.000
    quantity: 5,
    subtotal: 25000,
    tax_amount: 2750,
    total_amount: 27750,
    payment_method: 'CASH',
    payment_status: 'PAID',
    transaction_date: `${getDaysAgo(1)}T08:45:00Z`
  },
  {
    transaction_id: 'TXN-00007',
    cashier_id: 'USR-00002', // Budi Santoso
    service_id: 'SRV-00033', // Banner Design - Rp 75.000
    quantity: 1,
    subtotal: 75000,
    tax_amount: 8250,
    total_amount: 83250,
    payment_method: 'DEBIT',
    payment_status: 'PENDING', // Awaiting payment confirmation
    transaction_date: `${getDaysAgo(1)}T09:10:00Z`
  },
  {
    transaction_id: 'TXN-00008',
    cashier_id: 'USR-00007', // Maya Putri
    service_id: 'SRV-00042', // Business Card Print (100 pcs) - Rp 50.000
    quantity: 2,
    subtotal: 100000,
    tax_amount: 11000,
    total_amount: 111000,
    payment_method: 'QRIS',
    payment_status: 'PAID',
    transaction_date: `${getDaysAgo(1)}T14:30:00Z`
  },
  {
    transaction_id: 'TXN-00009',
    cashier_id: 'USR-00003', // Siti Nurhaliza
    service_id: 'SRV-00027', // Scan to PDF - Rp 1.000
    quantity: 15,
    subtotal: 15000,
    tax_amount: 1650,
    total_amount: 16650,
    payment_method: 'CASH',
    payment_status: 'PAID',
    transaction_date: `${getDaysAgo(1)}T16:20:00Z`
  },
  {
    transaction_id: 'TXN-00010',
    cashier_id: 'USR-00001', // Rina Maharani
    service_id: 'SRV-00014', // Hard Cover Binding - Rp 35.000
    quantity: 3,
    subtotal: 105000,
    tax_amount: 11550,
    total_amount: 116550,
    payment_method: 'QRIS',
    payment_status: 'PAID',
    transaction_date: `${getDaysAgo(0)}T09:15:00Z`
  },
  {
    transaction_id: 'TXN-00011',
    cashier_id: 'USR-00008', // Andi Pratama
    service_id: 'SRV-00041', // Thesis/Report Formatting - Rp 100.000
    quantity: 1,
    subtotal: 100000,
    tax_amount: 11000,
    total_amount: 111000,
    payment_method: 'DEBIT',
    payment_status: 'PAID',
    transaction_date: `${getDaysAgo(0)}T11:00:00Z`
  },
  {
    transaction_id: 'TXN-00012',
    cashier_id: 'USR-00008', // Andi Pratama
    service_id: 'SRV-00007', // Print Color A3 (1 sided) - Rp 3.000
    quantity: 25,
    subtotal: 75000,
    tax_amount: 8250,
    total_amount: 83250,
    payment_method: 'CASH',
    payment_status: 'FAILED', // Example of a failed transaction
    transaction_date: `${getDaysAgo(0)}T13:45:00Z`
  },
  {
    transaction_id: 'TXN-00013',
    cashier_id: 'USR-00001', // Rina Maharani
    service_id: 'SRV-00002', // Print B&W A4 (2 sided) - Rp 500
    quantity: 120,
    subtotal: 60000,
    tax_amount: 6600,
    total_amount: 66600,
    payment_method: 'QRIS',
    payment_status: 'PAID',
    transaction_date: `${getDaysAgo(0)}T15:30:00Z`
  },
  {
    // NEW: Large Amount Anomaly Trigger
    transaction_id: 'TXN-00014',
    cashier_id: 'USR-00004', 
    service_id: 'SRV-00033', // Banner Design
    quantity: 10,
    subtotal: 750000,
    tax_amount: 82500,
    total_amount: 832500,
    payment_method: 'QRIS',
    payment_status: 'PAID',
    transaction_date: `${getDaysAgo(0)}T16:15:00Z`
  },
  {
    // NEW: Voided Transaction Anomaly Trigger
    transaction_id: 'TXN-00015',
    cashier_id: 'USR-00002', 
    service_id: 'SRV-00018',
    quantity: 100,
    subtotal: 500000,
    tax_amount: 55000,
    total_amount: 555000,
    payment_method: 'CASH',
    payment_status: 'VOIDED',
    transaction_date: `${getDaysAgo(0)}T17:20:00Z`,
    voided_by: 'USR-00009',
    voided_at: `${getDaysAgo(0)}T17:25:00Z`,
    void_reason: 'Pelanggan membatalkan pesanan (uang kurang)'
  }
];
