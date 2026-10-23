# System Workflow Changes - April 19, 2026

## Summary of Changes

The Construction Materials Management System has been updated with the following changes to the approval workflow and user permissions:

---

## 1. Material Request Workflow Changes

### Previous Workflow
- **Engineer** submits material requests
- **Project Manager** approves/rejects requests

### New Workflow
- **Project Manager** submits material requests
- **Admin/Owner** approves/rejects requests

---

## 2. Permission Updates

### Material Requests Page (`/requests`)
- **Who can access**: Admin, Project Manager
- **Who can submit requests**: Project Manager only
- **Who can view all requests**: Admin
- **Who can view their own requests**: Project Manager

### Approval Page (`/approvals`)
- **Who can access**: Admin only
- **Who can approve/reject**: Admin only
- **Features**: View pending, approved, and rejected requests with approval/rejection workflow

### Messages Page (`/messages`) - NEW FEATURE
- **Who can access**: Engineer, Project Manager
- **Purpose**: Direct communication channel between Engineers and Project Managers
- **Features**:
  - Compose and send messages
  - View received and sent messages
  - Link messages to specific material requests
  - Unread message indicators
  - Real-time message tracking

---

## 3. User Roles & Permissions Summary

### Admin (Owner)
- View all material requests
- **Approve/reject material requests** (NEW)
- User management
- Full inventory and IN/OUT management access
- Activity logs access
- Settings management

### Project Manager
- **Submit material requests** (NEW)
- View own material requests
- View inventory
- View-only access to IN/OUT tracking
- **Send/receive messages with Engineers** (NEW)
- Activity logs access
- Settings access

### Engineer
- View inventory
- **Send/receive messages with Project Managers** (NEW)
- Settings access
- NO material request submission (REMOVED)

### Warehouse Staff
- Full IN/OUT control
- Inventory editing
- Material IN/OUT tracking
- Activity logs access
- Settings access

---

## 4. New Features

### Messaging System
A complete messaging system has been added that allows Engineers and Project Managers to communicate directly:

**Features:**
- Compose messages with subject and content
- Optional linking to material requests
- View received and sent messages
- Unread message indicators
- Message read/unread status tracking
- Timestamp display
- Conversation history

**Access:**
- Navigate to "Messages" in the sidebar
- Available for Engineers and Project Managers only

---

## 5. Navigation Updates

The navigation menu has been updated to reflect the new permissions:

- **Material Requests**: Now visible only to Admin and Project Manager
- **Approvals**: Now visible only to Admin
- **Messages**: NEW - visible to Engineer and Project Manager

---

## 6. Activity Log Updates

Activity logs have been updated to reflect the new workflow:
- Request submissions are logged under Project Manager role
- Approvals/rejections are logged under Admin role

---

## 7. Mock Data Updates

All sample data has been updated to reflect the new workflow:
- Sample requests show Project Manager as requester
- Sample approvals show Admin User as reviewer

---

## Testing the New System

### Login Credentials (unchanged):
- **Admin**: username: `admin`, password: `admin123`
- **Staff**: username: `staff`, password: `staff123`
- **Engineer**: username: `engineer`, password: `engineer123`
- **Manager**: username: `manager`, password: `manager123`

### Test Scenarios:

1. **As Project Manager**:
   - Login and navigate to "Material Requests"
   - Submit a new material request
   - Check "Messages" to communicate with engineers
   - View your submitted requests and their status

2. **As Admin**:
   - Login and navigate to "Approvals"
   - Review pending requests from Project Managers
   - Approve or reject requests with reasons
   - View all material requests in the system

3. **As Engineer**:
   - Login and navigate to "Messages"
   - Compose messages to Project Managers
   - View received messages
   - Check inventory and view material requests (read-only)

---

## Benefits of the New Workflow

1. **Clear Hierarchy**: Admin/Owner has final approval authority
2. **Better Communication**: Direct messaging between Engineers and Project Managers
3. **Request Tracking**: Project Managers can track their own requests
4. **Accountability**: Clear audit trail of who submitted and who approved requests
5. **Simplified Process**: Engineers focus on field work while managers handle material requests

---

## Technical Changes

### Files Modified:
- `/src/app/pages/MaterialRequestPage.tsx` - Updated permissions
- `/src/app/pages/ApprovalPage.tsx` - Changed from Manager to Admin access
- `/src/app/components/Layout.tsx` - Updated navigation permissions
- `/src/app/contexts/DataContext.tsx` - Added messaging functionality
- `/src/app/data/mockData.ts` - Added Message interface and mock messages
- `/src/app/routes.tsx` - Added Messages route

### Files Created:
- `/src/app/pages/MessagesPage.tsx` - New messaging system

---

For questions or support, contact the system administrator.
