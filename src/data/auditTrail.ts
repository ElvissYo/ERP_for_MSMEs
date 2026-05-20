import { AuditTrail } from './index';

export const auditTrail: AuditTrail[] = [
  {
    audit_id: 'AUD-00001',
    user_id: 'USR-00001', // Rina (Cashier)
    action: 'LOGIN',
    module: 'Authentication',
    target_id: null,
    timestamp: '2024-05-15T08:50:00Z',
    ip_address: '192.168.1.101'
  },
  {
    audit_id: 'AUD-00002',
    user_id: 'USR-00001', // Rina
    action: 'CREATE_TRANSACTION',
    module: 'Sales',
    target_id: 'TXN-00001',
    timestamp: '2024-05-15T09:30:00Z',
    ip_address: '192.168.1.101'
  },
  {
    audit_id: 'AUD-00003',
    user_id: 'USR-00004', // Ahmad (Cashier)
    action: 'CREATE_EXPENSE',
    module: 'Expenses',
    target_id: 'EXP-00002',
    timestamp: '2024-05-15T14:30:00Z',
    ip_address: '192.168.1.104'
  },
  {
    audit_id: 'AUD-00004',
    user_id: 'USR-00010', // Linda (Owner)
    action: 'LOGIN',
    module: 'Authentication',
    target_id: null,
    timestamp: '2024-05-15T14:32:00Z',
    ip_address: '192.168.1.200'
  },
  {
    audit_id: 'AUD-00005',
    user_id: 'USR-00010', // Linda
    action: 'APPROVE_EXPENSE',
    module: 'Expenses',
    target_id: 'EXP-00002',
    timestamp: '2024-05-15T14:35:00Z',
    ip_address: '192.168.1.200'
  },
  {
    audit_id: 'AUD-00006',
    user_id: 'USR-00003', // Siti
    action: 'CREATE_EXPENSE',
    module: 'Expenses',
    target_id: 'EXP-00004',
    timestamp: '2024-05-16T12:00:00Z',
    ip_address: '192.168.1.103'
  },
  {
    audit_id: 'AUD-00007',
    user_id: 'USR-00009', // Bambang (Owner)
    action: 'REJECT_EXPENSE',
    module: 'Expenses',
    target_id: 'EXP-00004',
    timestamp: '2024-05-16T12:30:00Z',
    ip_address: '192.168.1.201'
  },
  {
    audit_id: 'AUD-00008',
    user_id: 'USR-00012', // Dr. Sinta (Auditor)
    action: 'VIEW_REPORT',
    module: 'Financial Reports',
    target_id: 'General Ledger',
    timestamp: '2024-05-17T10:00:00Z',
    ip_address: '10.0.0.50'
  }
];

export const getAuditLogsByUser = (userId: string): AuditTrail[] => {
  return auditTrail.filter(a => a.user_id === userId);
};