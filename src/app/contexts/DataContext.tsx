import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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
  resetPrototypeData: () => void;
  // Materials
  materials: Material[];
  addMaterial: (material: Omit<Material, 'id'>) => void;
  updateMaterial: (id: string, material: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;

  // Transactions
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Transaction;

  // Material Requests
  requests: MaterialRequest[];
  addRequest: (request: Omit<MaterialRequest, 'id' | 'requestDate' | 'status'>) => void;
  updatePendingRequest: (
    id: string,
    requestedById: string,
    updates: Pick<MaterialRequest, 'quantity' | 'purpose' | 'dateNeeded'>
  ) => boolean;
  cancelPendingRequest: (id: string, requestedById: string, cancelledBy: string) => boolean;
  approveRequest: (id: string, reviewedBy: string) => void;
  rejectRequest: (id: string, reviewedBy: string, reason: string) => void;

  // Users
  users: SystemUser[];
  addUser: (user: Omit<SystemUser, 'id' | 'lastLogin'>) => void;
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

const PROTOTYPE_STORAGE_KEY = 'hvl-cmms-prototype-data-v1';

interface StoredPrototypeData {
  materials: Material[];
  transactions: Transaction[];
  requests: MaterialRequest[];
  activityLogs: ActivityLog[];
  messages: Message[];
}

function readStoredData(): StoredPrototypeData | null {
  try {
    const raw = window.localStorage.getItem(PROTOTYPE_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<StoredPrototypeData>;
    const requiredCollections = ['materials', 'transactions', 'requests', 'activityLogs', 'messages'];
    if (!requiredCollections.every(key => Array.isArray(data[key as keyof StoredPrototypeData]))) {
      window.localStorage.removeItem(PROTOTYPE_STORAGE_KEY);
      return null;
    }
    return {
      materials: data.materials!,
      transactions: data.transactions!,
      requests: data.requests!,
      activityLogs: data.activityLogs!,
      messages: data.messages!,
    };
  } catch {
    try {
      window.localStorage.removeItem(PROTOTYPE_STORAGE_KEY);
    } catch {
      // Storage can be unavailable in privacy-restricted browser contexts.
    }
    return null;
  }
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [initialData] = useState(readStoredData);
  const [materials, setMaterials] = useState<Material[]>(initialData?.materials ?? mockMaterials);
  const [transactions, setTransactions] = useState<Transaction[]>(initialData?.transactions ?? mockTransactions);
  const [requests, setRequests] = useState<MaterialRequest[]>(initialData?.requests ?? mockMaterialRequests);
  const [users, setUsers] = useState<SystemUser[]>(mockSystemUsers);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(initialData?.activityLogs ?? mockActivityLogs);
  const [messages, setMessages] = useState<Message[]>(initialData?.messages ?? mockMessages);
  const [pendingRegistrations, setPendingRegistrations] = useState<PendingUserRegistration[]>([]);
  const [authLogs, setAuthLogs] = useState<AuthLog[]>([]);

  useEffect(() => {
    try {
      window.localStorage.setItem(PROTOTYPE_STORAGE_KEY, JSON.stringify({
        materials,
        transactions,
        requests,
        activityLogs,
        messages,
      } satisfies StoredPrototypeData));
    } catch {
      // The prototype remains usable in memory when storage is unavailable.
    }
  }, [materials, transactions, requests, activityLogs, messages]);

  const resetPrototypeData = () => {
    setMaterials(mockMaterials);
    setTransactions(mockTransactions);
    setRequests(mockMaterialRequests);
    setUsers(mockSystemUsers);
    setActivityLogs(mockActivityLogs);
    setMessages(mockMessages);
    setPendingRegistrations([]);
    setAuthLogs([]);
  };

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
    const material = materials.find(m => m.id === transaction.materialId);
    if (!material) throw new Error('The selected material no longer exists.');
    if (!Number.isFinite(transaction.quantity) || transaction.quantity <= 0) {
      throw new Error('Quantity must be greater than zero.');
    }
    if (transaction.type === 'out' && transaction.quantity > material.quantity) {
      throw new Error(`Only ${material.quantity} ${material.unit} are currently available.`);
    }
    const linkedRequest = transaction.relatedRequestId
      ? requests.find(request => request.id === transaction.relatedRequestId)
      : undefined;
    if (transaction.relatedRequestId && (
      !linkedRequest ||
      linkedRequest.status !== 'approved' ||
      linkedRequest.materialId !== transaction.materialId ||
      linkedRequest.quantity !== transaction.quantity
    )) {
      throw new Error('The linked request is no longer approved or its material quantity has changed.');
    }

    const newTransaction: Transaction = {
      ...transaction,
      id: `T${String(transactions.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString()
    };
    setTransactions([newTransaction, ...transactions]);

    // Update material quantity
    const newQuantity = transaction.type === 'in'
      ? material.quantity + transaction.quantity
      : material.quantity - transaction.quantity;

    const newStatus = newQuantity === 0
      ? 'Out of Stock'
      : newQuantity <= material.minQuantity
      ? 'Low Stock'
      : 'In Stock';

    updateMaterial(transaction.materialId, {
      quantity: newQuantity,
      status: newStatus as Material['status']
    });
    if (linkedRequest && transaction.type === 'out') {
      setRequests(current => current.map(request =>
        request.id === linkedRequest.id
          ? {
              ...request,
              status: 'issued' as const,
              issuedBy: transaction.performedBy,
              issueDate: newTransaction.date,
              transactionId: newTransaction.id,
            }
          : request
      ));
    }
    return newTransaction;
  };

  // Material Requests functions
  const addRequest = (request: Omit<MaterialRequest, 'id' | 'requestDate' | 'status'>) => {
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

  const updatePendingRequest = (
    id: string,
    requestedById: string,
    updates: Pick<MaterialRequest, 'quantity' | 'purpose' | 'dateNeeded'>
  ) => {
    const request = requests.find(item => item.id === id);
    if (!request || request.status !== 'pending' || request.requestedById !== requestedById) return false;
    if (!Number.isFinite(updates.quantity) || updates.quantity <= 0 || !updates.purpose.trim() || !updates.dateNeeded) {
      return false;
    }
    setRequests(current => current.map(item => item.id === id ? { ...item, ...updates } : item));
    addActivityLog({
      userId: requestedById,
      username: request.requestedBy,
      role: 'manager',
      action: 'Material Request Updated',
      timestamp: new Date().toISOString(),
      details: `Updated request ${id} for ${updates.quantity} ${request.unit} of ${request.materialName}`,
    });
    return true;
  };

  const cancelPendingRequest = (id: string, requestedById: string, cancelledBy: string) => {
    const request = requests.find(item => item.id === id);
    if (!request || request.status !== 'pending' || request.requestedById !== requestedById) return false;
    setRequests(current => current.map(item =>
      item.id === id ? { ...item, status: 'cancelled' as const } : item
    ));
    addActivityLog({
      userId: requestedById,
      username: cancelledBy,
      role: 'manager',
      action: 'Material Request Cancelled',
      timestamp: new Date().toISOString(),
      details: `Cancelled request ${id} for ${request.quantity} ${request.unit} of ${request.materialName}`,
    });
    return true;
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
  const addUser = (user: Omit<SystemUser, 'id' | 'lastLogin'>) => {
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
        resetPrototypeData,
        materials,
        addMaterial,
        updateMaterial,
        deleteMaterial,
        transactions,
        addTransaction,
        requests,
        addRequest,
        updatePendingRequest,
        cancelPendingRequest,
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
  resetPrototypeData: () => {},
  materials: [],
  addMaterial: () => {},
  updateMaterial: () => {},
  deleteMaterial: () => {},
  transactions: [],
  addTransaction: (transaction) => ({ ...transaction, id: '' }),
  requests: [],
  addRequest: () => {},
  updatePendingRequest: () => false,
  cancelPendingRequest: () => false,
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
