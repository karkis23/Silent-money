# 🗝️ Silent Money: Full System Blueprint

Silent Money is a high-authority platform for discovering and tracking realistic passive income opportunities, specifically optimized for the Indian market. This document provides a detailed breakdown of the entire project architecture, file structure, and core logic.

---

## 🏗️ Architecture Overview

### **1. Frontend (The Command Interface)**
*   **Engine**: React 18 powered by **Vite**.
*   **Design System**: Custom CSS (Vanilla + Tailwind) following a "Premium Institutional" aesthetic.
*   **State**: React Context API for Global Auth state; Local Hooks for data fetching.
*   **Routing**: `react-router-dom` v6 with protected administrative routes.
*   **Animations**: `framer-motion` for smooth, high-fidelity UI transitions.

### **2. Backend (The Intelligence Layer)**
*   **Provider**: **Supabase** (PostgreSQL).
*   **Auth**: Managed Email/Password and Session persistence.
*   **Database**: 15+ tables with complex Relational Logic.
*   **Security**: **Row Level Security (RLS)** ensuring users only access their own operational data.
*   **Storage**: Supabase Buckets for asset visualization (Idea Images/Avatars).

---

## 📂 Project Directory Structure

### **`src/pages` (Operational Sectors)**
| Page | Description |
| :--- | :--- |
| `LandingPage.jsx` | The public entry point; transforms into the **Admin Console** for authorized personnel. |
| `DashboardPage.jsx` | The **Command Center**. Tracks saved ideas, income progress, and strategic rank. |
| `IdeasPage.jsx` | The primary discovery feed for income blueprints with "Goal Impact" indicators. |
| `FranchisePage.jsx` | Verified business opportunities with investment break-downs. |
| `IdeaDetailPage.jsx` | Extensive breakdown of a specific idea, including Risk/Effort and User Reviews. |
| `ComparisonPage.jsx` | Side-by-side financial analysis of multiple wealth-generation assets. |
| `AdminDashboardPage.jsx` | The **Moderation Terminal**. Handles asset approval, user management, and audits. |
| `EditIdeaPage.jsx` | Specialized forms for modifying assets with direct image upload support. |
| `AddIdeaPage.jsx` | A high-velocity 2-step sequence for deploying new income intellectual property. |
| `PublicProfilePage.jsx` | Public dossiers for commanders, showing their "Asset Author" status and rank. |

### **`src/components` (Tactical Modules)**
| Component | Function |
| :--- | :--- |
| `ImageUpload.jsx` | Handles file drops and uploads to Supabase Storage with instant previews. |
| `ROICalculator.jsx` | Financial engine for calculating yield trajectory and break-even points. |
| `NotificationBell.jsx` | Real-time signal center for updates on audits and asset approvals. |
| `GlobalSearch.jsx` | Universal intelligence search across the entire asset database. |
| `ReviewsSection.jsx` | Social proof module for community voting and detailed feedback. |
| `ExpertAuditModal.jsx` | Conduit for users to request institutional validation on their businesses. |
| `BackButton.jsx` | Elegant navigation component for operational flow. |

---

## 🚀 Key Strategic Features

### **1. Strategic Rank Engine**
Users earn institutional status based on their fleet size (saved assets):
*   **Market Explorer**: Registry confirmed (0 assets).
*   **Wealth Strategist**: Early deployment (1-2 assets).
*   **Portfolio Commander**: Established fleet (3-4 assets).
*   **Elite Wealth Commander**: Master-level deployment (5+ assets).

### **2. Income Impact Badging**
Every asset card dynamically calculates its contribution to the user's defined **Income Goal**.
*   **Logic**: `(Asset Min Monthly Income / User Goal) * 100`
*   **Display**: **🚀 +12% TO GOAL** (Emerald High-Aesthetic Badge).

### **3. Admin Post-Production**
Administrators have granular control over the platform's intelligence:
*   **Direct Uploads**: Attach high-fidelity imagery to any idea using the integrated Supabase Storage pipeline.
*   **Audit Lifecycle**: Move user requests from "Pending" to "In-Review" to "Completed" with automated ROI report links.
*   **Moderation**: Approve, reject, or request revisions on community-submitted content.

---

## 🗄️ Database Schema Analysis

### **Core Tables**
*   **`profiles`**: Stores user rank, bio, avatar, and financial goals.
*   **`income_ideas`**: Main repository for income blueprints.
*   **`franchises`**: Catalog of verified offline business opportunities.
*   **`user_saved_ideas`**: Cross-reference table for user tracking (Interested, Active, etc.).
*   **`expert_audit_requests`**: Pipeline for the platform's premium consultancy service.
*   **`income_idea_reviews`**: Community intel and upvoting system.

### **Security Protocols**
*   `service_role` access is restricted to administrative functions.
*   RLS policies ensure `author_id` checks for all write operations.
*   Public access is strictly read-only for approved content.

---

## 🛠️ Maintenance & Deployment

### **Local Development**
1.  `npm install`
2.  `npm run dev` (Vite Hot Reload)

### **Production**
*   **Vercel** handles the frontend delivery.
*   **Supabase** manages the real-time data layer.
*   **FormSubmit** manages the contact bridge.

---
*Documented with precision for the Silent Money Development Team.*
