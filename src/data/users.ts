import type { User } from '../types';

export const users: User[] = [
  {
    user_id: 'USR-00001',
    full_name: 'Rina Maharani',
    username: 'Cashier',
    password: '1234',
    role: 'CASHIER',
    phone_number: '+62800-0000-0001',
    created_at: '2024-01-01T08:00:00Z',
    account_status: 'ACTIVE'
  },
  {
    user_id: 'USR-00009',
    full_name: 'Bambang Wijaya',
    username: 'Owner',
    password: '1234',
    pin: '1234',
    role: 'OWNER',
    phone_number: '+62800-0000-0002',
    created_at: '2024-01-01T08:00:00Z',
    account_status: 'ACTIVE'
  },
  {
    user_id: 'USR-00012',
    full_name: 'Dr. Sinta Dewi',
    username: 'Auditor',
    password: '1234',
    role: 'AUDITOR',
    phone_number: '+62800-0000-0003',
    created_at: '2024-01-01T08:00:00Z',
    account_status: 'ACTIVE'
  },
];

export const getUserById = (userId: string): User | undefined => users.find(u => u.user_id === userId);
export const getUsersByRole = (role: string): User[] => users.filter(u => u.role === role);
export const getActiveUsers = (): User[] => users.filter(u => u.account_status === 'ACTIVE');