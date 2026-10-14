# HVL Engineering Services — CMMS

A Construction Materials Management System for HVL Engineering Services.

## Features

- Multi-role authentication — Admin, Staff, Engineer, Manager with role-based access control
- MFA + Passkey — Two-factor login flow with OTP verification and passkey step
- Inventory management — Track materials, stock levels, and categories
- Material requests — Submit, review, and approve material requisitions
- IN/OUT tracking — Log incoming and outgoing material movements
- User management — Create, edit, and deactivate user accounts
- User approvals — Review and approve new user registrations
- Activity logs — Full audit trail of system events
- Security center — Monitor threats, sessions, and security compliance
- Messages — Internal messaging between engineers and managers
- Settings — Profile, password, notifications, and system configuration
- Session timeout — Automatic session expiry with live countdown modal
- Fully responsive — Mobile-first design with safe area support for notch/Dynamic Island

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS v4
- React Router v7
- Radix UI + Shadcn/ui
- Lucide React
- Motion
- Recharts
- Sonner

## Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Staff | `staff` | `staff123` |
| Engineer | `engineer` | `eng123` |
| Manager | `manager` | `mgr123` |

> MFA code and passkey are shown in a toast during the login flow (demo mode).
