import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  Material,
  Transaction,
  MaterialRequest,
  SystemUser,
  ActivityLog,
  Message,
  mockMaterials,
  mockTransactions,
  mockMaterialRequests,
  mockSystemUsers,
  mockActivityLogs,
  mockMessages
} from '../data/mockData';

export interface PendingUserRegistration {
  id: string;
  fullName: string;
  email: string;
  username: string;
  password: string;
  role: 'engineer' | 'staff' | 'manager';
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  reviewedBy?: string;
  reviewDate?: string;
  rejectionReason?: string;
  approvalComment?: string; // Optional comment when approving
}

export interface AuthLog {
  id: string;
  username: string;
  action: 'login_attempt' | 'login_success' | 'login_failed' | 'mfa_sent' | 'mfa_verified' | 'mfa_failed' | 'logout' | 'session_timeout';
  timestamp: string;
  ipAddress?: string;
  details?: string;
}

interface DataContextType {
  // Materials
  materials: Material[];
  addMaterial: (material: Omit<Material, 'id'>) => void;
  updateMaterial: (id: string, material: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;

  // Transactions
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;

  // Material Requests
  requests: MaterialRequest[];
  addRequest: (request: Omit<MaterialRequest, 'id'>) => void;
  approveRequest: (id: string, reviewedBy: string) => void;
  rejectRequest: (id: string, reviewedBy: string, reason: string) => void;

  // Users
  users: SystemUser[];
  addUser: (user: Omit<SystemUser, 'id'>) => void;
  updateUser: (id: string, user: Partial<SystemUser>) => void;
  deleteUser: (id: string) => void;

  // Pending Registrations
  pendingRegistrations: PendingUserRegistration[];
  addPendingRegistration: (registration: Omit<PendingUserRegistration, 'id' | 'status' | 'requestDate'>) => void;
  approvePendingRegistration: (id: string, reviewedBy: string, approvalComment?: string) => void;
  rejectPendingRegistration: (id: string, reviewedBy: string, reason: string) => void;

  // Authentication Logs
  authLogs: AuthLog[];
  addAuthLog: (log: Omit<AuthLog, 'id' | 'timestamp'>) => void;

  // Activity Logs
  activityLogs: ActivityLog[];
  addActivityLog: (log: Omit<ActivityLog, 'id'>) => void;

  // Messages
  messages: Message[];
  addMessage: (message: Omit<Message, 'id'>) => void;
  markMessageAsRead: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [materials, setMaterials] = useState<Material[]>(mockMaterials);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [requests, setRequests] = useState<MaterialRequest[]>(mockMaterialRequests);
  const [users, setUsers] = useState<SystemUser[]>(mockSystemUsers);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(mockActivityLogs);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [pendingRegistrations, setPendingRegistrations] = useState<PendingUserRegistration[]>([]);
  const [authLogs, setAuthLogs] = useState<AuthLog[]>([]);

  // Materials functions
  const addMaterial = (material: Omit<Material, 'id'>) => {
    const newMaterial: Material = {
      ...material,
      id: `M${String(materials.length + 1).padStart(3, '0')}`,
      lastUpdated: new Date().toISOString()
    };
    setMaterials([...materials, newMaterial]);
  };

  const updateMaterial = (id: string, updates: Partial<Material>) => {
    setMaterials(materials.map(m =>
      m.id === id
        ? {
            ...m,
            ...updates,
            lastUpdated: new Date().toISOString()
          }
        : m
    ));
  };

  const deleteMaterial = (id: string) => {
    setMaterials(materials.filter(m => m.id !== id));
  };

  // Transactions functions
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `T${String(transactions.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString()
    };
    setTransactions([newTransaction, ...transactions]);

    // Update material quantity
    const material = materials.find(m => m.id === transaction.materialId);
    if (material) {
      const newQuantity = transaction.type === 'in'
        ? material.quantity + transaction.quantity
        : material.quantity - transaction.quantity;

      const newStatus = newQuantity === 0
        ? 'Out of Stock'
        : newQuantity <= material.minQuantity
        ? 'Low Stock'
        : 'In Stock';

      updateMaterial(transaction.materialId, {
        quantity: Math.max(0, newQuantity),
        status: newStatus as Material['status']
      });
    }
  };

  // Material Requests functions
  const addRequest = (request: Omit<MaterialRequest, 'id'>) => {
    const newRequest: MaterialRequest = {
      ...request,
      id: `REQ${String(requests.length + 1).padStart(3, '0')}`,
      requestDate: new Date().toISOString(),
      status: 'pending'
    };
    setRequests([newRequest, ...requests]);

    // Add activity log
    addActivityLog({
      userId: request.requestedById,
      username: request.requestedBy,
      role: 'manager',
      action: 'Material Request Submitted',
      timestamp: new Date().toISOString(),
      details: `Requested ${request.quantity} ${request.unit} of ${request.materialName}`
    });
  };

  const approveRequest = (id: string, reviewedBy: string) => {
    setRequests(requests.map(r =>
      r.id === id
        ? {
            ...r,
            status: 'approved' as const,
            reviewedBy,
            reviewDate: new Date().toISOString()
          }
        : r
    ));

    const request = requests.find(r => r.id === id);
    if (request) {
      addActivityLog({
        userId: '1',
        username: reviewedBy,
        role: 'admin',
        action: 'Request Approved',
        timestamp: new Date().toISOString(),
        details: `Approved request ${id} for ${request.quantity} ${request.unit} of ${request.materialName}`
      });
    }
  };

  const rejectRequest = (id: string, reviewedBy: string, reason: string) => {
    setRequests(requests.map(r =>
      r.id === id
        ? {
            ...r,
            status: 'rejected' as const,
            reviewedBy,
            reviewDate: new Date().toISOString(),
            rejectionReason: reason
          }
        : r
    ));

    const request = requests.find(r => r.id === id);
    if (request) {
      addActivityLog({
        userId: '1',
        username: reviewedBy,
        role: 'admin',
        action: 'Request Rejected',
        timestamp: new Date().toISOString(),
        details: `Rejected request ${id} - Reason: ${reason}`
      });
    }
  };

  // Users functions
  const addUser = (user: Omit<SystemUser, 'id'>) => {
    const newUser: SystemUser = {
      ...user,
      id: String(users.length + 1),
      lastLogin: new Date().toISOString()
    };
    setUsers([...users, newUser]);

    addActivityLog({
      userId: '1',
      username: 'admin',
      role: 'admin',
      action: 'User Created',
      timestamp: new Date().toISOString(),
      details: `Created new user: ${user.username} (${user.role})`
    });
  };

  const updateUser = (id: string, updates: Partial<SystemUser>) => {
    setUsers(users.map(u =>
      u.id === id ? { ...u, ...updates } : u
    ));
  };

  const deleteUser = (id: string) => {
    const user = users.find(u => u.id === id);
    setUsers(users.filter(u => u.id !== id));

    if (user) {
      addActivityLog({
        userId: '1',
        username: 'admin',
        role: 'admin',
        action: 'User Deleted',
        timestamp: new Date().toISOString(),
        details: `Deleted user: ${user.username}`
      });
    }
  };

  // Pending Registrations functions
  const addPendingRegistration = (registration: Omit<PendingUserRegistration, 'id' | 'status' | 'requestDate'>) => {
    const newRegistration: PendingUserRegistration = {
      ...registration,
      id: `REG${String(pendingRegistrations.length + 1).padStart(3, '0')}`,
      status: 'pending' as const,
      requestDate: new Date().toISOString()
    };
    setPendingRegistrations([newRegistration, ...pendingRegistrations]);

    addActivityLog({
      userId: '1',
      username: 'admin',
      role: 'admin',
      action: 'Pending Registration Created',
      timestamp: new Date().toISOString(),
      details: `Created pending registration for: ${registration.fullName} (${registration.role})`
    });
  };

  const approvePendingRegistration = (id: string, reviewedBy: string, approvalComment?: string) => {
    setPendingRegistrations(pendingRegistrations.map(r =>
      r.id === id
        ? {
            ...r,
            status: 'approved' as const,
            reviewedBy,
            reviewDate: new Date().toISOString(),
            approvalComment
          }
        : r
    ));

    const registration = pendingRegistrations.find(r => r.id === id);
    if (registration) {
      addActivityLog({
        userId: '1',
        username: reviewedBy,
        role: 'admin',
        action: 'Pending Registration Approved',
        timestamp: new Date().toISOString(),
        details: `Approved pending registration ${id} for ${registration.fullName} (${registration.role})`
      });
    }
  };

  const rejectPendingRegistration = (id: string, reviewedBy: string, reason: string) => {
    setPendingRegistrations(pendingRegistrations.map(r =>
      r.id === id
        ? {
            ...r,
            status: 'rejected' as const,
            reviewedBy,
            reviewDate: new Date().toISOString(),
            rejectionReason: reason
          }
        : r
    ));

    const registration = pendingRegistrations.find(r => r.id === id);
    if (registration) {
      addActivityLog({
        userId: '1',
        username: reviewedBy,
        role: 'admin',
        action: 'Pending Registration Rejected',
        timestamp: new Date().toISOString(),
        details: `Rejected pending registration ${id} - Reason: ${reason}`
      });
    }
  };

  // Authentication Logs functions
  const addAuthLog = (log: Omit<AuthLog, 'id' | 'timestamp'>) => {
    const newLog: AuthLog = {
      ...log,
      id: `AL${String(authLogs.length + 1).padStart(3, '0')}`,
      timestamp: new Date().toISOString()
    };
    setAuthLogs([newLog, ...authLogs]);
  };

  // Activity Logs functions
  const addActivityLog = (log: Omit<ActivityLog, 'id'>) => {
    const newLog: ActivityLog = {
      ...log,
      id: `L${String(activityLogs.length + 1).padStart(3, '0')}`
    };
    setActivityLogs([newLog, ...activityLogs]);
  };

  // Messages functions
  const addMessage = (message: Omit<Message, 'id'>) => {
    const newMessage: Message = {
      ...message,
      id: `MSG${String(messages.length + 1).padStart(3, '0')}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    setMessages([newMessage, ...messages]);
  };

  const markMessageAsRead = (id: string) => {
    setMessages(messages.map(m =>
      m.id === id
        ? {
            ...m,
            read: true
          }
        : m
    ));
  };

  return (
    <DataContext.Provider
      value={{
        materials,
        addMaterial,
        updateMaterial,
        deleteMaterial,
        transactions,
        addTransaction,
        requests,
        addRequest,
        approveRequest,
        rejectRequest,
        users,
        addUser,
        updateUser,
        deleteUser,
        pendingRegistrations,
        addPendingRegistration,
        approvePendingRegistration,
        rejectPendingRegistration,
        authLogs,
        addAuthLog,
        activityLogs,
        addActivityLog,
        messages,
        addMessage,
        markMessageAsRead
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

const defaultDataContext: DataContextType = {
  materials: [],
  addMaterial: () => {},
  updateMaterial: () => {},
  deleteMaterial: () => {},
  transactions: [],
  addTransaction: () => {},
  requests: [],
  addRequest: () => {},
  approveRequest: () => {},
  rejectRequest: () => {},
  users: [],
  addUser: () => {},
  updateUser: () => {},
  deleteUser: () => {},
  pendingRegistrations: [],
  addPendingRegistration: () => {},
  approvePendingRegistration: () => {},
  rejectPendingRegistration: () => {},
  authLogs: [],
  addAuthLog: () => {},
  activityLogs: [],
  addActivityLog: () => {},
  messages: [],
  addMessage: () => {},
  markMessageAsRead: () => {},
};

export function useData() {
  return useContext(DataContext) ?? defaultDataContext;
}