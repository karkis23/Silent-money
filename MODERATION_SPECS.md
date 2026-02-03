# 📋 Moderation & Security Protocol: Built Today

This document outlines the administrative and security systems implemented to move **Silent Money** into a production-ready state.

---

## 🛡️ 1. Admin Moderation Terminal
The "Brain" of the platform, accessible only to users with `is_admin = true`.

### Workflow Tabs
1.  **Live Moderation**: Real-time queue of all new submissions awaiting verification.
2.  **Moderation History**: Log of recently approved assets for accountability.
3.  **Asset Database**: Full system bypass to view/manage every item, including archived ones.

### Capabilities
-   **Approve**: Validates an asset, marks it as live, and notifies the author.
-   **Request Revision**: Sends the asset back to the author with specific feedback (e.g., "Add better proof").
-   **Global Edit**: Admins can directly modify any asset's content (SEO, descriptions, financials).
-   **Soft Delete**: Removes assets from public view while preserving the raw data in the database.

---

## 🔔 2. Professional Notification System
A real-time communication engine that keeps authors informed about their content status.

-   **Instant Alerts**: Red-dot notification bell updates immediately via Supabase Broadcast.
-   **Contextual Links**: Notifications link directly to the relevant dashboard or live page.
-   **Status Messages**: Clean, encouraging messaging for approvals and clear actionable feedback for revisions.

---

## 🔒 3. Stability & Data Protection (Blindspot Shield)

### Soft-Delete Mechanism
Assets are never truly deleted through the Admin UI.
-   **Implementation**: A `deleted_at` timestamp is added.
-   **Filtering**: Public queries automatically exclude any items where `deleted_at` is not null.
-   **Recovery**: Protects against accidental clicks or malicious deletions by staff.

### Collision-Resistant URLs
Prevents broken links and database errors when users use identical titles.
-   **Logic**: Every slug is appended with a unique 4-character random hash (e.g., `chai-point-5w2x`).
-   **Scalability**: Ensures a unique URL space even with thousands of similar entries.

---

## 🛠️ 4. Updated Security Policies (RLS)
The database was fortified with new Row Level Security rules:
1.  **Admin Bypass**: A specific policy allows administrators to `SELECT` and `UPDATE` any row in `income_ideas` and `franchises`, regardless of who the author is.
2.  **System Notifications**: Restricted `INSERT` permissions on the `notifications` table so only the system/admin can send alerts.
3.  **Visibility Shield**: Public policies updated to enforce `is_approved = true AND deleted_at IS NULL`.

---

**Status**: ✅ All systems online and integrated into the Moderation Terminal.
