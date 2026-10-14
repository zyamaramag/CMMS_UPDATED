export interface Material {
  id: string;
  name: string;
  category: string;
  size?: string; // Size/specification (e.g., "12mm", "Type I", "4x8 ft")
  quantity: number;
  unit: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  lastUpdated: string;
  minQuantity: number;
}

export interface Transaction {
  id: string;
  type: 'in' | 'out';
  materialId: string;
  materialName: string;
  quantity: number;
  date: string;
  assignedTo: string;
  notes: string;
  performedBy: string;
}

export interface MaterialRequest {
  id: string;
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  purpose: string;
  dateNeeded: string;
  requestedBy: string;
  requestedById: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewDate?: string;
  rejectionReason?: string;
}

export interface SystemUser {
  id: string;
  username: string;
  password: string;
  email: string;
  fullName: string;
  role: 'admin' | 'staff' | 'engineer' | 'manager';
  status: 'active' | 'inactive';
  lastLogin: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  username: string;
  role: string;
  action: string;
  timestamp: string;
  details: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'engineer' | 'manager';
  recipientId: string;
  recipientName: string;
  recipientRole: 'engineer' | 'manager';
  subject: string;
  content: string;
  timestamp: string;
  read: boolean;
  relatedRequestId?: string;
}

export const mockMaterials: Material[] = [
  {
    id: 'M001',
    name: 'Steel Rebars',
    category: 'Steel',
    size: '10mm',
    quantity: 350,
    unit: 'pcs',
    status: 'In Stock',
    lastUpdated: '2026-04-18T10:30:00',
    minQuantity: 100
  },
  {
    id: 'M002',
    name: 'Steel Rebars',
    category: 'Steel',
    size: '12mm',
    quantity: 450,
    unit: 'pcs',
    status: 'In Stock',
    lastUpdated: '2026-04-18T10:30:00',
    minQuantity: 100
  },
  {
    id: 'M003',
    name: 'Steel Rebars',
    category: 'Steel',
    size: '16mm',
    quantity: 200,
    unit: 'pcs',
    status: 'In Stock',
    lastUpdated: '2026-04-18T11:00:00',
    minQuantity: 80
  },
  {
    id: 'M004',
    name: 'Portland Cement',
    category: 'Cement',
    size: 'Type I',
    quantity: 85,
    unit: 'bags',
    status: 'Low Stock',
    lastUpdated: '2026-04-17T14:20:00',
    minQuantity: 80
  },
  {
    id: 'M005',
    name: 'Portland Cement',
    category: 'Cement',
    size: 'Type II',
    quantity: 120,
    unit: 'bags',
    status: 'In Stock',
    lastUpdated: '2026-04-17T14:20:00',
    minQuantity: 100
  },
  {
    id: 'M006',
    name: 'Concrete Hollow Blocks',
    category: 'Masonry',
    size: '4" CHB',
    quantity: 0,
    unit: 'pcs',
    status: 'Out of Stock',
    lastUpdated: '2026-04-16T09:00:00',
    minQuantity: 200
  },
  {
    id: 'M007',
    name: 'Concrete Hollow Blocks',
    category: 'Masonry',
    size: '6" CHB',
    quantity: 500,
    unit: 'pcs',
    status: 'In Stock',
    lastUpdated: '2026-04-16T09:00:00',
    minQuantity: 200
  },
  {
    id: 'M008',
    name: 'Sand (Washed)',
    category: 'Aggregates',
    quantity: 320,
    unit: 'cu.m',
    status: 'In Stock',
    lastUpdated: '2026-04-19T08:15:00',
    minQuantity: 50
  },
  {
    id: 'M009',
    name: 'Gravel',
    category: 'Aggregates',
    size: '3/4"',
    quantity: 150,
    unit: 'cu.m',
    status: 'In Stock',
    lastUpdated: '2026-04-18T16:45:00',
    minQuantity: 50
  },
  {
    id: 'M010',
    name: 'Plywood Marine',
    category: 'Wood',
    size: '4x8 ft',
    quantity: 25,
    unit: 'sheets',
    status: 'Low Stock',
    lastUpdated: '2026-04-17T11:30:00',
    minQuantity: 20
  },
  {
    id: 'M011',
    name: 'Plywood Ordinary',
    category: 'Wood',
    size: '4x8 ft',
    quantity: 40,
    unit: 'sheets',
    status: 'In Stock',
    lastUpdated: '2026-04-17T11:30:00',
    minQuantity: 30
  },
  {
    id: 'M012',
    name: 'Electrical Wire',
    category: 'Electrical',
    size: '2.0mm',
    quantity: 15,
    unit: 'rolls',
    status: 'Low Stock',
    lastUpdated: '2026-04-19T10:00:00',
    minQuantity: 10
  },
  {
    id: 'M013',
    name: 'Electrical Wire',
    category: 'Electrical',
    size: '3.5mm',
    quantity: 30,
    unit: 'rolls',
    status: 'In Stock',
    lastUpdated: '2026-04-19T10:00:00',
    minQuantity: 15
  },
  {
    id: 'M014',
    name: 'PVC Pipe',
    category: 'Plumbing',
    size: '1/2"',
    quantity: 80,
    unit: 'pcs',
    status: 'In Stock',
    lastUpdated: '2026-04-18T13:00:00',
    minQuantity: 50
  },
  {
    id: 'M015',
    name: 'PVC Pipe',
    category: 'Plumbing',
    size: '3/4"',
    quantity: 60,
    unit: 'pcs',
    status: 'In Stock',
    lastUpdated: '2026-04-18T13:00:00',
    minQuantity: 40
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: 'T001',
    type: 'in',
    materialId: 'M001',
    materialName: 'Steel Rebars 12mm',
    quantity: 200,
    date: '2026-04-18T10:30:00',
    assignedTo: 'Warehouse A',
    notes: 'Delivery from supplier ABC Steel',
    performedBy: 'staff'
  },
  {
    id: 'T002',
    type: 'out',
    materialId: 'M002',
    materialName: 'Portland Cement Type I',
    quantity: 50,
    date: '2026-04-17T14:20:00',
    assignedTo: 'Project Site B',
    notes: 'Foundation work - Building 2',
    performedBy: 'staff'
  },
  {
    id: 'T003',
    type: 'out',
    materialId: 'M003',
    materialName: 'Concrete Hollow Blocks',
    quantity: 500,
    date: '2026-04-16T09:00:00',
    assignedTo: 'Project Site A',
    notes: 'Wall construction',
    performedBy: 'admin'
  },
  {
    id: 'T004',
    type: 'in',
    materialId: 'M004',
    materialName: 'Sand (Washed)',
    quantity: 100,
    date: '2026-04-19T08:15:00',
    assignedTo: 'Warehouse A',
    notes: 'Replenishment stock',
    performedBy: 'staff'
  }
];

export const mockMaterialRequests: MaterialRequest[] = [
  {
    id: 'REQ001',
    materialId: 'M002',
    materialName: 'Portland Cement Type I',
    quantity: 100,
    unit: 'bags',
    purpose: 'Foundation work for Building 3',
    dateNeeded: '2026-04-22',
    requestedBy: 'Project Manager',
    requestedById: '4',
    requestDate: '2026-04-19T09:30:00',
    status: 'pending'
  },
  {
    id: 'REQ002',
    materialId: 'M001',
    materialName: 'Steel Rebars 12mm',
    quantity: 300,
    unit: 'pcs',
    purpose: 'Column reinforcement - Site A',
    dateNeeded: '2026-04-21',
    requestedBy: 'Project Manager',
    requestedById: '4',
    requestDate: '2026-04-18T14:20:00',
    status: 'approved',
    reviewedBy: 'Admin User',
    reviewDate: '2026-04-18T15:00:00'
  },
  {
    id: 'REQ003',
    materialId: 'M006',
    materialName: 'Plywood 4x8 Marine',
    quantity: 50,
    unit: 'sheets',
    purpose: 'Formwork for slab casting',
    dateNeeded: '2026-04-20',
    requestedBy: 'Project Manager',
    requestedById: '4',
    requestDate: '2026-04-17T11:00:00',
    status: 'rejected',
    reviewedBy: 'Admin User',
    reviewDate: '2026-04-17T16:30:00',
    rejectionReason: 'Insufficient budget allocation for this phase'
  },
  {
    id: 'REQ004',
    materialId: 'M004',
    materialName: 'Sand (Washed)',
    quantity: 50,
    unit: 'cu.m',
    purpose: 'Plastering work - Building 2',
    dateNeeded: '2026-04-23',
    requestedBy: 'Project Manager',
    requestedById: '4',
    requestDate: '2026-04-19T10:15:00',
    status: 'pending'
  },
  {
    id: 'REQ005',
    materialId: 'M003',
    materialName: 'Concrete Hollow Blocks',
    quantity: 1000,
    unit: 'pcs',
    purpose: 'Wall construction - Phase 2',
    dateNeeded: '2026-04-25',
    requestedBy: 'Project Manager',
    requestedById: '4',
    requestDate: '2026-04-18T08:45:00',
    status: 'approved',
    reviewedBy: 'Admin User',
    reviewDate: '2026-04-18T10:00:00'
  }
];

export const mockSystemUsers: SystemUser[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    email: 'admin@hvl.com',
    fullName: 'Admin User',
    role: 'admin',
    status: 'active',
    lastLogin: '2026-04-19T07:30:00'
  },
  {
    id: '2',
    username: 'staff',
    password: 'staff123',
    email: 'staff@hvl.com',
    fullName: 'Warehouse Staff',
    role: 'staff',
    status: 'active',
    lastLogin: '2026-04-19T08:00:00'
  },
  {
    id: '3',
    username: 'engineer',
    password: 'engineer123',
    email: 'engineer@hvl.com',
    fullName: 'Field Engineer',
    role: 'engineer',
    status: 'active',
    lastLogin: '2026-04-19T09:30:00'
  },
  {
    id: '4',
    username: 'manager',
    password: 'manager123',
    email: 'manager@hvl.com',
    fullName: 'Project Manager',
    role: 'manager',
    status: 'active',
    lastLogin: '2026-04-19T07:45:00'
  },
  {
    id: '6',
    username: 'jdoe',
    password: 'password123',
    email: 'jdoe@hvl.com',
    fullName: 'John Doe',
    role: 'engineer',
    status: 'active',
    lastLogin: '2026-04-17T09:15:00'
  },
  {
    id: '7',
    username: 'msmith',
    password: 'password123',
    email: 'msmith@hvl.com',
    fullName: 'Maria Smith',
    role: 'staff',
    status: 'inactive',
    lastLogin: '2026-04-10T14:20:00'
  }
];

export const mockActivityLogs: ActivityLog[] = [
  {
    id: 'L001',
    userId: '2',
    username: 'staff',
    role: 'staff',
    action: 'Material IN',
    timestamp: '2026-04-19T08:15:00',
    details: 'Added 100 cu.m Sand (Washed)'
  },
  {
    id: 'L002',
    userId: '1',
    username: 'admin',
    role: 'admin',
    action: 'User Created',
    timestamp: '2026-04-18T15:30:00',
    details: 'Created new user: jdoe (staff)'
  },
  {
    id: 'L003',
    userId: '2',
    username: 'staff',
    role: 'staff',
    action: 'Material OUT',
    timestamp: '2026-04-17T14:20:00',
    details: 'Released 50 bags Portland Cement Type I to Project Site B'
  },
  {
    id: 'L004',
    userId: '3',
    username: 'viewer',
    role: 'viewer',
    action: 'Report Viewed',
    timestamp: '2026-04-17T10:00:00',
    details: 'Viewed inventory report'
  },
  {
    id: 'L005',
    userId: '1',
    username: 'admin',
    role: 'admin',
    action: 'Settings Updated',
    timestamp: '2026-04-16T11:45:00',
    details: 'Changed session timeout to 30 minutes'
  },
  {
    id: 'L006',
    userId: '2',
    username: 'staff',
    role: 'staff',
    action: 'Material IN',
    timestamp: '2026-04-18T10:30:00',
    details: 'Added 200 pcs Steel Rebars 12mm'
  }
];

export const mockMessages: Message[] = [
  {
    id: 'MSG001',
    senderId: '3',
    senderName: 'Field Engineer',
    senderRole: 'engineer',
    recipientId: '4',
    recipientName: 'Project Manager',
    recipientRole: 'manager',
    subject: 'Urgent: Steel Rebars Needed for Site A',
    content: 'Hi,\n\nWe need additional steel rebars (12mm) at Site A by tomorrow. The current stock is running low and we have column work scheduled for early morning.\n\nCan you submit a request for at least 300 pieces?\n\nThanks,\nField Engineer',
    timestamp: '2026-04-19T09:15:00',
    read: true,
    relatedRequestId: 'REQ002'
  },
  {
    id: 'MSG002',
    senderId: '4',
    senderName: 'Project Manager',
    senderRole: 'manager',
    recipientId: '3',
    recipientName: 'Field Engineer',
    recipientRole: 'engineer',
    subject: 'Re: Steel Rebars Request Approved',
    content: 'Hi,\n\nGood news! I submitted the request (REQ002) and it has been approved by the admin. The warehouse should have 300 pieces of 12mm steel rebars ready for pickup.\n\nPlease coordinate with the warehouse staff for delivery to Site A.\n\nBest regards,\nProject Manager',
    timestamp: '2026-04-18T15:30:00',
    read: false,
    relatedRequestId: 'REQ002'
  },
  {
    id: 'MSG003',
    senderId: '3',
    senderName: 'Field Engineer',
    senderRole: 'engineer',
    recipientId: '4',
    recipientName: 'Project Manager',
    recipientRole: 'manager',
    subject: 'Material Quality Concern - Plywood',
    content: 'Hello,\n\nI wanted to inform you that the plywood sheets we received last week have some quality issues. Some sheets are warped and may not be suitable for formwork.\n\nBefore we submit a new request, should we document this with photos and file a complaint with the supplier?\n\nLet me know how you\'d like to proceed.\n\nRegards,\nField Engineer',
    timestamp: '2026-04-17T14:20:00',
    read: true
  },
  {
    id: 'MSG004',
    senderId: '4',
    senderName: 'Project Manager',
    senderRole: 'manager',
    recipientId: '3',
    recipientName: 'Field Engineer',
    recipientRole: 'engineer',
    subject: 'Re: Material Quality Concern - Plywood',
    content: 'Hi,\n\nYes, please document the defective plywood with photos showing the defects. We need to file a complaint and get replacement sheets.\n\nIn the meantime, I\'ll hold off on submitting a new plywood request until we resolve this with the supplier.\n\nThanks for bringing this to my attention.\n\nBest,\nProject Manager',
    timestamp: '2026-04-17T16:00:00',
    read: true
  },
  {
    id: 'MSG005',
    senderId: '6',
    senderName: 'John Doe',
    senderRole: 'engineer',
    recipientId: '4',
    recipientName: 'Project Manager',
    recipientRole: 'manager',
    subject: 'Weekly Material Requirements - Building 3',
    content: 'Good morning,\n\nHere are the estimated material requirements for Building 3 for next week:\n\n- Portland Cement: 150 bags\n- Sand: 40 cu.m\n- Gravel: 30 cu.m\n- Hollow Blocks: 2000 pcs\n\nPlease review and submit the necessary requests. Foundation work is scheduled to start on Monday.\n\nThanks,\nJohn Doe',
    timestamp: '2026-04-19T08:00:00',
    read: false
  }
];