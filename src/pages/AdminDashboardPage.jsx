import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/SEO';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import AdminActionModal from '../components/AdminActionModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import CategoryModal from '../components/CategoryModal';

/**
 * AdminDashboardPage: The primary intelligence and command terminal for the Silent Money platform.
 * 
 * DESIGN PHILOSOPHY:
 * This component follows a "High-Density HUD" aesthetic, designed for maximum operational velocity.
 * It utilizes a multi-tier state management system to handle hundreds of assets across different
 * lifecycle stages (Pending, Approved, Archived) without performance degradation.
 * 
 * CORE ARCHITECTURAL PILLARS:
 * 1. REAL-TIME MODERATION: Uses Supabase Realtime (Channels) to update the UI instantly when users submit new assets.
 * 2. TRANSACTIONAL AUDITING: Every action (Approve, Ban, Feature) is logged in the `admin_logs` table for institutional accountability.
 * 3. HIERARCHICAL SECURITY: Implements a multi-level admin role system (Moderator, Admin, Super Admin, Owner) with strict safety gates.
 * 4. DATABASE INTEGRITY: Handles soft-deletion via `deleted_at` and permanent reclamation through storage purging protocols.
 */
export default function AdminDashboardPage() {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const [pendingIdeas, setPendingIdeas] = useState([]);
    const [pendingFranchises, setPendingFranchises] = useState([]);
    const [approvedIdeas, setApprovedIdeas] = useState([]);
    const [approvedFranchises, setApprovedFranchises] = useState([]);

    // Search & Pagination State
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const ROWS_PER_PAGE = 20;

    // Advanced Admin States
    const [adminLogs, setAdminLogs] = useState([]);
    const [selectedItems, setSelectedItems] = useState({ ideas: [], franchises: [] });
    const [allIdeas, setAllIdeas] = useState([]);
    const [allFranchises, setAllFranchises] = useState([]);
    const [archivedIdeas, setArchivedIdeas] = useState([]);
    const [archivedFranchises, setArchivedFranchises] = useState([]);
    const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'history', 'all', 'archived'
    const [loading, setLoading] = useState(true);
    const [pageLoading, setPageLoading] = useState(false);
    const [stats, setStats] = useState({ ideas: 0, franchises: 0, audits: 0, users: 0, categories: 0 });
    const [auditRequests, setAuditRequests] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [maintenanceQueue, setMaintenanceQueue] = useState([]);
    const location = useLocation();

    // Category Modal State
    const [categoryModal, setCategoryModal] = useState({
        isOpen: false,
        category: null
    });

    // Confirm Modal State
    const [confirmConfig, setConfirmConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'danger'
    });

    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        id: null,
        type: null,
        itemTitle: ''
    });

    // Admin Action Modal State (Feedback/Audit)
    const [actionConfig, setActionConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        inputType: 'text',
        confirmText: '',
        onConfirm: () => { }
    });

    // Sync tab from URL
    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const tab = query.get('tab');
        if (tab && ['pending', 'history', 'all', 'audits', 'users', 'categories', 'logs', 'performance', 'maintenance'].includes(tab)) {
            setActiveTab(tab);
            setPage(0); // Reset page on direct tab navigation
        }
    }, [location.search]);

    // Reset page when active tab changes manually
    useEffect(() => {
        setPage(0);
    }, [activeTab]);

    useEffect(() => {
        // Strict Admin Gate
        if (!loading && (!profile || !profile.is_admin)) {
            navigate('/dashboard');
            return;
        }
    }, [profile, loading, navigate]);

    /**
     * Data Orchestrator: Initial fetch of all system-critical data tiers.
     * Uses Promise.all to prevent waterfall loading and ensure the HUD is populated
     * with high-bandwidth efficiency.
     */
    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);

            // Construct search clause if needed
            const searchStr = searchQuery ? `%${searchQuery}%` : null;

            const fetchIdeas = async () => {
                let q = supabase.from('income_ideas').select('*, profiles(full_name)').is('deleted_at', null);
                if (searchStr) q = q.ilike('title', searchStr);
                const { data } = await q.eq('is_approved', false).order('created_at', { ascending: false });
                setPendingIdeas(data || []);
                return data || [];
            };

            const fetchFranchises = async () => {
                let q = supabase.from('franchises').select('*, profiles(full_name)').is('deleted_at', null);
                if (searchStr) q = q.ilike('name', searchStr);
                const { data } = await q.eq('is_approved', false).order('created_at', { ascending: false });
                setPendingFranchises(data || []);
                return data || [];
            };

            const fetchApproved = async () => {
                const { data: aIdeas } = await supabase.from('income_ideas').select('*, profiles(full_name)').eq('is_approved', true).is('deleted_at', null).order('updated_at', { ascending: false }).limit(20);
                const { data: aFranchises } = await supabase.from('franchises').select('*, profiles(full_name)').eq('is_approved', true).is('deleted_at', null).order('updated_at', { ascending: false }).limit(20);
                setApprovedIdeas(aIdeas || []);
                setApprovedFranchises(aFranchises || []);
            };

            const fetchArchived = async () => {
                const { data: archIdeas } = await supabase.from('income_ideas').select('*, profiles(full_name)').not('deleted_at', 'is', null).order('deleted_at', { ascending: false });
                const { data: archFranchises } = await supabase.from('franchises').select('*, profiles(full_name)').not('deleted_at', 'is', null).order('deleted_at', { ascending: false });
                setArchivedIdeas(archIdeas || []);
                setArchivedFranchises(archFranchises || []);
            };

            const fetchAudits = async () => {
                try {
                    const { data, error } = await supabase.from('expert_audit_requests').select('*, profiles(full_name)').order('created_at', { ascending: false });
                    if (error) {
                        const { data: simple } = await supabase.from('expert_audit_requests').select('*').order('created_at', { ascending: false });
                        setAuditRequests(simple || []);
                        return simple || [];
                    }
                    setAuditRequests(data || []);
                    return data || [];
                } catch (e) {
                    const { data: simple } = await supabase.from('expert_audit_requests').select('*').order('created_at', { ascending: false });
                    setAuditRequests(simple || []);
                    return simple || [];
                }
            };

            const fetchMetaData = async () => {
                const [{ data: logs }, { data: categories }, { data: users }, { data: maintenance }] = await Promise.all([
                    supabase.from('admin_logs').select('*, profiles:admin_id(full_name)').order('created_at', { ascending: false }).limit(50),
                    supabase.from('categories').select('*').order('display_order', { ascending: true }),
                    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
                    supabase.from('storage_deletion_queue').select('*').order('created_at', { ascending: false })
                ]);
                setAdminLogs(logs || []);
                setAllCategories(categories || []);
                setAllUsers(users || []);
                setMaintenanceQueue(maintenance || []);
                return { logs, categories, users, maintenance };
            };

            const [ideas, franchises, approved, archived, audits, meta] = await Promise.all([
                fetchIdeas(),
                fetchFranchises(),
                fetchApproved(),
                fetchArchived(),
                fetchAudits(),
                fetchMetaData()
            ]);

            // Update system stats for HUD using fresh data
            setStats({
                ideas: (ideas || []).length,
                franchises: (franchises || []).length,
                audits: (audits || []).filter(a => a.status === 'pending').length,
                users: (meta?.users || []).length,
                categories: (meta?.categories || []).length
            });

            setLoading(false);
        };

        const fetchSingleAudit = async () => {
            try {
                const { data, error } = await supabase.from('expert_audit_requests').select('*, profiles(full_name)').order('created_at', { ascending: false });
                if (error) {
                    const { data: simple } = await supabase.from('expert_audit_requests').select('*').order('created_at', { ascending: false });
                    setAuditRequests(simple || []);
                } else {
                    setAuditRequests(data || []);
                }
            } catch (e) {
                const { data: simple } = await supabase.from('expert_audit_requests').select('*').order('created_at', { ascending: false });
                setAuditRequests(simple || []);
            }
        };

        const fetchSingleIdea = async () => {
            const searchStr = searchQuery ? `%${searchQuery}%` : null;
            let q = supabase.from('income_ideas').select('*, profiles(full_name)').is('deleted_at', null);
            if (searchStr) q = q.ilike('title', searchStr);
            const { data } = await q.eq('is_approved', false).order('created_at', { ascending: false });
            setPendingIdeas(data || []);
        };

        const fetchSingleFranchise = async () => {
            const searchStr = searchQuery ? `%${searchQuery}%` : null;
            let q = supabase.from('franchises').select('*, profiles(full_name)').is('deleted_at', null);
            if (searchStr) q = q.ilike('name', searchStr);
            const { data } = await q.eq('is_approved', false).order('created_at', { ascending: false });
            setPendingFranchises(data || []);
        };

        if (profile?.is_admin) {
            fetchAll();

            // Real-time Subscriptions for Admins
            const auditSub = supabase
                .channel('admin-audits')
                .on('postgres_changes', { event: 'INSERT', table: 'expert_audit_requests', schema: 'public' }, (payload) => {
                    toast.success(`🚀 NEW VERIFICATION: ${payload.new.brand_name}`, {
                        icon: '📋',
                        style: { background: '#2563eb', color: '#fff' }
                    });
                    fetchSingleAudit();
                })
                .subscribe();

            const ideaSub = supabase
                .channel('admin-ideas')
                .on('postgres_changes', { event: 'INSERT', table: 'income_ideas', schema: 'public' }, (payload) => {
                    toast.success(`💡 NEW IDEA: ${payload.new.title}`, {
                        icon: '✨',
                    });
                    fetchSingleIdea();
                })
                .subscribe();

            const franchiseSub = supabase
                .channel('admin-franchises')
                .on('postgres_changes', { event: 'INSERT', table: 'franchises', schema: 'public' }, (payload) => {
                    toast.success(`🏢 NEW BRAND: ${payload.new.name}`, {
                        icon: '🏢',
                    });
                    fetchSingleFranchise();
                })
                .subscribe();

            // Real-time User Profile Updates
            const userSub = supabase
                .channel('admin-users')
                .on('postgres_changes', {
                    event: 'UPDATE',
                    table: 'profiles',
                    schema: 'public'
                }, (payload) => {
                    const updatedUser = payload.new;

                    // Update local state with the changed user
                    setAllUsers(prev => prev.map(u =>
                        u.id === updatedUser.id ? { ...u, ...updatedUser } : u
                    ));

                    // Show notification for admin-related changes (only if not current user)
                    if (updatedUser.id !== user.id) {
                        if (payload.old.is_admin !== updatedUser.is_admin) {
                            toast.info(
                                updatedUser.is_admin
                                    ? `👑 ${updatedUser.full_name || 'A user'} was promoted to admin`
                                    : `⚡ ${updatedUser.full_name || 'A user'} was demoted from admin`,
                                { duration: 4000 }
                            );
                        } else if (payload.old.is_banned !== updatedUser.is_banned) {
                            toast.info(
                                updatedUser.is_banned
                                    ? `🚫 ${updatedUser.full_name || 'A user'} was banned`
                                    : `✅ ${updatedUser.full_name || 'A user'} was unbanned`,
                                { duration: 4000 }
                            );
                        }
                    }
                })
                .subscribe();

            return () => {
                supabase.removeChannel(auditSub);
                supabase.removeChannel(ideaSub);
                supabase.removeChannel(franchiseSub);
                supabase.removeChannel(userSub);
            };
        }
    }, [profile, navigate, searchQuery]); // REMOVED page dependency

    // High-Speed Paginated Fetch Effect
    useEffect(() => {
        const fetchPaginatedData = async () => {
            if (!profile?.is_admin) return;
            setPageLoading(true);
            try {
                const searchStr = searchQuery ? `%${searchQuery}%` : null;

                let iQuery = supabase
                    .from('income_ideas')
                    .select('*, profiles(full_name)')
                    .order('created_at', { ascending: false });

                let fQuery = supabase
                    .from('franchises')
                    .select('*, profiles(full_name)')
                    .order('created_at', { ascending: false });

                if (searchStr) {
                    iQuery = iQuery.ilike('title', searchStr);
                    fQuery = fQuery.ilike('name', searchStr);
                }

                const { data: fullIdeas } = await iQuery.range(page * ROWS_PER_PAGE, (page + 1) * ROWS_PER_PAGE - 1);
                const { data: fullFranchises } = await fQuery.range(page * ROWS_PER_PAGE, (page + 1) * ROWS_PER_PAGE - 1);

                setAllIdeas(fullIdeas || []);
                setAllFranchises(fullFranchises || []);
            } catch (err) {
                console.error('Pagination fetch error:', err);
            } finally {
                setPageLoading(false);
            }
        };

        fetchPaginatedData();
    }, [page, profile, searchQuery]);

    // Search Filtering Logic
    const filterItems = (items) => {
        if (!searchQuery) return items;
        return items.filter(item =>
            (item.title || item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.profiles?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.id.includes(searchQuery) ||
            (item.description || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const handleSaveCategory = async (formData) => {
        try {
            const isEditing = categoryModal.category !== null;
            let error;

            if (isEditing) {
                const { error: err } = await supabase
                    .from('categories')
                    .update(formData)
                    .eq('id', categoryModal.category.id);
                error = err;
            } else {
                const { error: err } = await supabase
                    .from('categories')
                    .insert([formData]);
                error = err;
            }

            if (!error) {
                toast.success(`Category ${isEditing ? 'updated' : 'created'} successfully`);
                // Re-fetch all to get updated list
                const { data } = await supabase.from('categories').select('*').order('display_order', { ascending: true });
                setAllCategories(data || []);
            } else {
                throw error;
            }
        } catch (err) {
            toast.error('Operation failed: ' + err.message);
        }
    };

    const handleDeleteCategory = (id) => {
        setConfirmConfig({
            isOpen: true,
            title: "Delete Category?",
            message: "Warning: This may affect existing items linked to this category. Are you sure you want to proceed?",
            type: "danger",
            confirmText: "Delete Permanently",
            onConfirm: async () => {
                const { error } = await supabase.from('categories').delete().eq('id', id);
                if (!error) {
                    toast.success('Category deleted');
                    setAllCategories(prev => prev.filter(c => c.id !== id));
                } else {
                    toast.error('Deletion failed: ' + error.message);
                }
            }
        });
    };

    const handleUnbanUser = (userId) => {
        setConfirmConfig({
            isOpen: true,
            title: "Unban Investor User?",
            message: "Are you sure you want to restore access for this user? They will be able to log in and use all institutional features again.",
            type: "success",
            confirmText: "Unban User",
            onConfirm: async () => {
                const { error } = await supabase.from('profiles').update({ is_banned: false }).eq('id', userId);
                if (!error) {
                    toast.success('User access has been restored.');
                    // Log action
                    await supabase.from('admin_logs').insert([{
                        admin_id: user.id,
                        action_type: 'unban',
                        target_type: 'user',
                        target_id: userId,
                        details: { reason: 'Manual Admin Unban' }
                    }]);
                    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, is_banned: false } : u));
                } else {
                    toast.error('Restore failed: ' + error.message);
                }
            }
        });
    };

    const handleBanUser = (userId) => {
        // Check if user is an admin
        const targetUser = allUsers.find(u => u.id === userId);
        const isTargetAdmin = targetUser?.is_admin;

        setConfirmConfig({
            isOpen: true,
            title: "Ban User?",
            message: isTargetAdmin
                ? "⚠️ This user is an administrator. Banning will automatically revoke their admin privileges and they will lose access to all institutional features immediately."
                : "Are you sure you want to ban this user? They will lose access to all institutional features immediately.",
            type: "danger",
            confirmText: "Ban User",
            onConfirm: async () => {
                // Auto-revoke admin if user is admin
                const updateData = isTargetAdmin
                    ? { is_banned: true, is_admin: false }
                    : { is_banned: true };

                const { error } = await supabase
                    .from('profiles')
                    .update(updateData)
                    .eq('id', userId);

                if (!error) {
                    toast.success(isTargetAdmin
                        ? 'User has been banned and admin privileges revoked.'
                        : 'User has been banned.'
                    );

                    // Log action
                    await supabase.from('admin_logs').insert([{
                        admin_id: user.id,
                        action_type: 'ban',
                        target_type: 'user',
                        target_id: userId,
                        details: {
                            reason: 'Manual Admin Ban',
                            admin_revoked: isTargetAdmin
                        }
                    }]);

                    // Update local state
                    setAllUsers(prev => prev.map(u =>
                        u.id === userId
                            ? { ...u, is_banned: true, is_admin: isTargetAdmin ? false : u.is_admin }
                            : u
                    ));
                } else {
                    toast.error('Ban failed: ' + error.message);
                }
            }
        });
    };

    const handleToggleAdmin = (userId, currentAdminStatus, userName) => {
        const targetUser = allUsers.find(u => u.id === userId);
        const currentUserProfile = allUsers.find(u => u.id === user.id);

        // Define hierarchy levels
        const hierarchyLevels = {
            'owner': 4,
            'super_admin': 3,
            'admin': 2,
            'moderator': 1,
            'user': 0
        };

        const currentUserLevel = hierarchyLevels[currentUserProfile?.role || 'admin'] || 2;
        const targetUserLevel = hierarchyLevels[targetUser?.role || 'user'] || 0;

        // CRITICAL SAFETY CHECK #1: Prevent self-demotion
        if (userId === user.id && currentAdminStatus) {
            toast.error('⚠️ Security Error: You cannot revoke your own admin privileges. Ask another administrator to do this.', {
                duration: 5000,
                icon: '🚫'
            });
            return;
        }

        // HIERARCHY CHECK: Prevent demoting owners
        if (currentAdminStatus && targetUser?.role === 'owner') {
            toast.error('🛡️ Protection: Platform owners cannot be demoted. This is a permanent security role.', {
                duration: 6000,
                icon: '👑'
            });
            return;
        }

        // HIERARCHY CHECK: Can only manage users at lower levels
        if (currentAdminStatus && targetUserLevel >= currentUserLevel) {
            const roleName = targetUser?.role === 'super_admin' ? 'Super Administrator' : targetUser?.role === 'owner' ? 'Owner' : 'Peer Administrator';
            toast.error(`⚠️ Insufficient Privileges: You cannot demote a ${roleName}. Only higher-level admins can perform this action.`, {
                duration: 6000,
                icon: '🚫'
            });
            return;
        }

        // CRITICAL SAFETY CHECK #2: Prevent last admin from being demoted
        if (currentAdminStatus) {
            const totalAdmins = allUsers.filter(u => u.is_admin).length;
            if (totalAdmins <= 1) {
                toast.error('⚠️ System Protection: Cannot revoke the last administrator. The platform must have at least one admin at all times.', {
                    duration: 6000,
                    icon: '🛡️'
                });
                return;
            }
        }

        const action = currentAdminStatus ? 'Revoke' : 'Grant';
        const newStatus = !currentAdminStatus;

        setConfirmConfig({
            isOpen: true,
            title: `${action} Administrator Privileges?`,
            message: currentAdminStatus
                ? `Are you sure you want to revoke admin privileges from ${userName || 'this user'}? They will lose access to all administrative functions and the admin dashboard.`
                : `Are you sure you want to grant administrator privileges to ${userName || 'this user'}? They will have full access to moderate content, manage users, and all administrative functions.`,
            type: currentAdminStatus ? "warning" : "success",
            confirmText: `${action} Admin Access`,
            onConfirm: async () => {
                // When granting admin, set level to 'admin' by default
                const updateData = newStatus
                    ? { is_admin: true, role: 'admin' }
                    : { is_admin: false, role: 'user' };

                const { error } = await supabase
                    .from('profiles')
                    .update(updateData)
                    .eq('id', userId);

                if (!error) {
                    toast.success(`${action === 'Grant' ? 'Administrator privileges granted' : 'Administrator privileges revoked'} successfully.`);

                    // Log action
                    await supabase.from('admin_logs').insert([{
                        admin_id: user.id,
                        action_type: newStatus ? 'grant_admin' : 'revoke_admin',
                        target_type: 'user',
                        target_id: userId,
                        details: {
                            action: `${action} Admin Privileges`,
                            target_user: userName || 'Unknown User',
                            admin_level: newStatus ? 'admin' : null
                        }
                    }]);

                    // Update local state
                    setAllUsers(prev => prev.map(u =>
                        u.id === userId
                            ? { ...u, is_admin: newStatus, role: newStatus ? 'admin' : 'user' }
                            : u
                    ));
                } else {
                    toast.error(`Failed to ${action.toLowerCase()} admin privileges: ` + error.message);
                }
            }
        });
    };

    const handlePermanentDelete = (id, type, title) => {
        setDeleteModal({
            isOpen: true,
            id,
            type,
            itemTitle: title || (type === 'idea' ? 'Idea' : 'Franchise')
        });
    };

    const confirmPermanentDelete = async () => {
        const { id, type } = deleteModal;
        const itemType = type === 'idea' ? 'Idea' : 'Franchise';
        const table = type === 'idea' ? 'income_ideas' : 'franchises';

        const { error, data } = await supabase
            .from(table)
            .delete()
            .eq('id', id)
            .select();

        if (error) {
            toast.error('Delete failed: ' + error.message);
            return;
        }

        // RLS Policy Check: If no data returned, delete was blocked or row not found
        if (!data || data.length === 0) {
            toast.error('Delete failed: Permission denied or item not found. Check Admin RLS policies.');
            console.error('Delete returned 0 rows. Possible RLS blocking.');
            return;
        }

        if (!error && data.length > 0) {
            toast.success(`${itemType} permanently deleted from database`);

            // Log action
            await supabase.from('admin_logs').insert([{
                admin_id: user.id,
                action_type: 'permanent_delete',
                target_type: type,
                target_id: id,
                details: { warning: 'PERMANENT_DELETION' }
            }]);

            // Remove from all local states
            if (type === 'idea') {
                setPendingIdeas(prev => prev.filter(i => i.id !== id));
                setApprovedIdeas(prev => prev.filter(i => i.id !== id));
                setAllIdeas(prev => prev.filter(i => i.id !== id));
                setArchivedIdeas(prev => prev.filter(i => i.id !== id));
            } else {
                setPendingFranchises(prev => prev.filter(f => f.id !== id));
                setApprovedFranchises(prev => prev.filter(f => f.id !== id));
                setAllFranchises(prev => prev.filter(f => f.id !== id));
                setArchivedFranchises(prev => prev.filter(f => f.id !== id));
            }
        } else {
            toast.error('Delete failed: ' + error.message);
        }
    };

    const handleToggleFeatured = async (id, type, currentStatus) => {
        const table = type === 'idea' ? 'income_ideas' : 'franchises';
        const { error } = await supabase
            .from(table)
            .update({ is_featured: !currentStatus })
            .eq('id', id);

        if (!error) {
            toast.success(`Item ${!currentStatus ? 'featured' : 'unfeatured'} successfully`);
            // Update local state
            if (type === 'idea') {
                setAllIdeas(prev => prev.map(i => i.id === id ? { ...i, is_featured: !currentStatus } : i));
                setPendingIdeas(prev => prev.map(i => i.id === id ? { ...i, is_featured: !currentStatus } : i));
                setApprovedIdeas(prev => prev.map(i => i.id === id ? { ...i, is_featured: !currentStatus } : i));
            } else {
                setAllFranchises(prev => prev.map(f => f.id === id ? { ...f, is_featured: !currentStatus } : f));
                setPendingFranchises(prev => prev.map(f => f.id === id ? { ...f, is_featured: !currentStatus } : f));
                setApprovedFranchises(prev => prev.map(f => f.id === id ? { ...f, is_featured: !currentStatus } : f));
            }
            // Log action
            await supabase.from('admin_logs').insert([{
                admin_id: user.id,
                action_type: !currentStatus ? 'feature' : 'unfeature',
                target_type: type,
                target_id: id
            }]);
        } else {
            toast.error('Failed to update featured status');
        }
    };

    const handleBulkApprove = async () => {
        const ideaIds = selectedItems.ideas;
        const franchiseIds = selectedItems.franchises;

        if (ideaIds.length === 0 && franchiseIds.length === 0) {
            toast.error('No items selected');
            return;
        }

        for (const id of ideaIds) {
            await handleApprove(id, 'idea');
        }
        for (const id of franchiseIds) {
            await handleApprove(id, 'franchise');
        }

        setSelectedItems({ ideas: [], franchises: [] });
        toast.success(`Bulk approved ${ideaIds.length + franchiseIds.length} items`);
    };

    const handleBulkArchive = () => {
        const ideaIds = selectedItems.ideas;
        const franchiseIds = selectedItems.franchises;

        if (ideaIds.length === 0 && franchiseIds.length === 0) {
            toast.error('No items selected');
            return;
        }

        setConfirmConfig({
            isOpen: true,
            title: "Archive Selected Items?",
            message: `Are you sure you want to archive ${ideaIds.length + franchiseIds.length} items? This will remove them from public view.`,
            type: "danger",
            confirmText: "Archive All",
            onConfirm: async () => {
                for (const id of ideaIds) {
                    const table = 'income_ideas';
                    await supabase.from(table).update({ deleted_at: new Date() }).eq('id', id);
                }
                for (const id of franchiseIds) {
                    const table = 'franchises';
                    await supabase.from(table).update({ deleted_at: new Date() }).eq('id', id);
                }

                // Refresh lists
                setPendingIdeas(prev => prev.filter(i => !ideaIds.includes(i.id)));
                setPendingFranchises(prev => prev.filter(f => !franchiseIds.includes(f.id)));
                setSelectedItems({ ideas: [], franchises: [] });
                toast.success('Bulk archive completed');
            }
        });
    };

    const logAssetAction = async (assetId, assetType, action, prevStatus, newStatus, feedback = '') => {
        try {
            await supabase.from('asset_audit_logs').insert([{
                asset_id: assetId,
                asset_type: assetType,
                modified_by: profile?.id,
                action: action,
                previous_status: prevStatus,
                new_status: newStatus,
                feedback: feedback
            }]);
        } catch (err) {
            console.warn('Audit logging skipped (infrastructure may be pending):', err.message);
        }
    };

    const handleUnarchive = (id, type) => {
        setConfirmConfig({
            isOpen: true,
            title: `Restore ${type === 'idea' ? 'Blueprint' : 'Brand'}?`,
            message: `Are you sure you want to restore this ${type}? It will be returned to community circulation and database visibility.`,
            type: "success",
            confirmText: "Restore Asset",
            onConfirm: async () => {
                const table = type === 'idea' ? 'income_ideas' : 'franchises';
                const { error } = await supabase
                    .from(table)
                    .update({ deleted_at: null })
                    .eq('id', id);

                if (!error) {
                    await logAssetAction(id, type, 'RESTORE', 'deleted', 'active', 'Restored from Archive by Administrator');
                    toast.success('Asset restored successfully');

                    if (type === 'idea') {
                        const restoredItem = archivedIdeas.find(i => i.id === id);
                        setArchivedIdeas(prev => prev.filter(i => i.id !== id));

                        // Update in all ideas if present
                        setAllIdeas(prev => prev.map(i => i.id === id ? { ...i, deleted_at: null } : i));

                        // Add back to approved if it was approved
                        if (restoredItem && restoredItem.is_approved) {
                            setApprovedIdeas(prev => [{ ...restoredItem, deleted_at: null }, ...prev].slice(0, 20));
                        }
                    } else {
                        const restoredItem = archivedFranchises.find(f => f.id === id);
                        setArchivedFranchises(prev => prev.filter(f => f.id !== id));

                        // Update in all franchises if present
                        setAllFranchises(prev => prev.map(f => f.id === id ? { ...f, deleted_at: null } : f));

                        // Add back to approved if it was approved
                        if (restoredItem && restoredItem.is_approved) {
                            setApprovedFranchises(prev => [{ ...restoredItem, deleted_at: null }, ...prev].slice(0, 20));
                        }
                    }
                } else {
                    toast.error('Restore failed: ' + error.message);
                }
            }
        });
    };

    const handleDelete = (id, type) => {
        setConfirmConfig({
            isOpen: true,
            title: `Archive ${type === 'idea' ? 'Blueprint' : 'Brand'}?`,
            message: `Are you sure you want to archive this ${type}? It will be removed from community circulation but retained in the institutional database.`,
            onConfirm: async () => {
                const table = type === 'idea' ? 'income_ideas' : 'franchises';
                const { error } = await supabase
                    .from(table)
                    .update({ deleted_at: new Date() })
                    .eq('id', id);

                if (!error) {
                    await logAssetAction(id, type, 'DECOMMISSION', 'active', 'deleted', 'Archived by Administrator');
                    toast.success('Asset archived successfully');
                    setPendingIdeas(prev => prev.filter(i => i.id !== id));
                    setApprovedIdeas(prev => prev.filter(i => i.id !== id));
                    setAllIdeas(prev => prev.filter(i => i.id !== id));
                    setPendingFranchises(prev => prev.filter(f => f.id !== id));
                    setApprovedFranchises(prev => prev.filter(f => f.id !== id));
                    setAllFranchises(prev => prev.filter(f => f.id !== id));

                    setStats(prev => ({
                        ...prev,
                        [type === 'idea' ? 'ideas' : 'franchises']: Math.max(0, stats[type === 'idea' ? 'ideas' : 'franchises'] - 1)
                    }));
                    if (type === 'idea') {
                        setArchivedIdeas(prev => [...prev, { ...pendingIdeas.find(i => i.id === id) || allIdeas.find(i => i.id === id), deleted_at: new Date() }]);
                    } else {
                        setArchivedFranchises(prev => [...prev, { ...pendingFranchises.find(f => f.id === id) || allFranchises.find(f => f.id === id), deleted_at: new Date() }]);
                    }
                } else {
                    toast.error('Archive failed: ' + error.message);
                }
            },
            type: 'danger'
        });
    };

    /**
     * Strategic Revision Handler: 
     * Transmits a professional request to the asset author for data enhancement.
     * 
     * @param {string} id - The unique identifier for the asset.
     * @param {'idea' | 'franchise'} type - The asset classification.
     */
    const handleRequestRevision = (id, type) => {
        setActionConfig({
            isOpen: true,
            title: 'Request Asset Revision',
            message: `Enter the specific information required to bring this ${type === 'idea' ? 'blueprint' : 'brand'} up to standard.`,
            inputType: 'text',
            confirmText: 'Send Update Request',
            onConfirm: async (feedback) => {
                const table = type === 'idea' ? 'income_ideas' : 'franchises';
                const { error } = await supabase
                    .from(table)
                    .update({
                        status: 'revision',
                        admin_feedback: feedback
                    })
                    .eq('id', id);

                if (!error) {
                    const item = type === 'idea'
                        ? pendingIdeas.find(i => i.id === id) || allIdeas.find(i => i.id === id)
                        : pendingFranchises.find(f => f.id === id) || allFranchises.find(f => f.id === id);

                    if (item?.author_id) {
                        await supabase.from('notifications').insert([{
                            user_id: item.author_id,
                            title: 'Action Required: Asset Revision 📝',
                            message: `Feedback for "${item.title || item.name}": ${feedback}`,
                            type: 'system',
                            link: '/my-ideas'
                        }]);
                    }
                    toast.success('Revision request transmitted.');
                    await logAssetAction(id, type, 'REVISION_REQUEST', 'pending', 'revision', feedback);
                    // Refresh data
                    setPendingIdeas(prev => prev.map(i => i.id === id ? { ...i, status: 'revision' } : i));
                } else {
                    toast.error('Transmission failed: ' + error.message);
                }
            }
        });
    };

    const handleApprove = async (id, type) => {
        const table = type === 'idea' ? 'income_ideas' : 'franchises';
        const { error } = await supabase
            .from(table)
            .update({ is_approved: true })
            .eq('id', id);

        if (!error) {
            // Notify Author
            const item = type === 'idea'
                ? pendingIdeas.find(i => i.id === id)
                : pendingFranchises.find(f => f.id === id);

            if (item && item.author_id) {
                await supabase.from('notifications').insert([{
                    user_id: item.author_id,
                    title: 'Asset Approved 🚀',
                    message: `Your ${type === 'idea' ? 'blueprint' : 'franchise'} "${item.title || item.name}" has been verified and is now live.`,
                    type: 'approval',
                    link: type === 'idea' ? `/ideas/${item.slug}` : `/franchise/${item.slug}`
                }]);
            }

            if (type === 'idea') {
                const approvedItem = pendingIdeas.find(i => i.id === id);
                await logAssetAction(id, 'idea', 'AUTHORIZATION', 'pending', 'approved');
                setPendingIdeas(prev => prev.filter(i => i.id !== id));
                if (approvedItem) setApprovedIdeas(prev => [{ ...approvedItem, is_approved: true, status: 'approved' }, ...prev]);
            } else {
                const approvedItem = pendingFranchises.find(f => f.id === id);
                await logAssetAction(id, 'franchise', 'AUTHORIZATION', 'pending', 'approved');
                setPendingFranchises(prev => prev.filter(f => f.id !== id));
                if (approvedItem) setApprovedFranchises(prev => [{ ...approvedItem, is_approved: true, status: 'approved' }, ...prev]);
            }
        }
    };

    const handleUpdateAuditStatus = (id, status) => {
        if (status === 'completed') {
            setActionConfig({
                isOpen: true,
                title: 'Finalize Expert Verification',
                message: 'Provide a comprehensive assessment and link to the official verification report.',
                inputType: 'audit',
                confirmText: 'Approve & Send Report',
                onConfirm: async (feedback, reportUrl) => {
                    executeAuditUpdate(id, status, feedback, reportUrl);
                }
            });
        } else {
            const feedback = status === 'in-review' ? 'Your verification request is currently being analyzed by our expert panel.' : '';
            executeAuditUpdate(id, status, feedback, '');
        }
    };

    /**
     * Expert Audit Processor:
     * Manages the finalization of high-budget investment audits, including
     * the transmission of institutional PDF reports and expert feedback.
     */
    const executeAuditUpdate = async (id, status, feedback, reportUrl) => {
        const { error } = await supabase
            .from('expert_audit_requests')
            .update({
                status,
                admin_feedback: feedback,
                report_url: reportUrl,
                updated_at: new Date()
            })
            .eq('id', id);

        if (!error) {
            const audit = auditRequests.find(a => a.id === id);

            if (audit && audit.user_id) {
                await supabase.from('notifications').insert([{
                    user_id: audit.user_id,
                    title: status === 'completed' ? 'Expert Verification Complete 🚀' : 'Verification In-Review 🔍',
                    message: status === 'completed'
                        ? `Expert analysis for "${audit.brand_name}" is ready: ${feedback.slice(0, 50)}...`
                        : `Your verification for "${audit.brand_name}" has moved to In-Review status.`,
                    type: 'system',
                    link: '/dashboard'
                }]);
            }

            toast.success(`Verification status updated to ${status.toUpperCase()}`);
            setAuditRequests(prev => prev.map(a => a.id === id ? { ...a, status, admin_feedback: feedback, report_url: reportUrl } : a));
            setStats(prev => ({
                ...prev,
                audits: status === 'pending' ? prev.audits : Math.max(0, prev.audits - (status === 'in-review' ? 0 : 1))
            }));
        } else {
            toast.error('Update failed: ' + error.message);
        }
    };

    const handlePurgeStorage = async () => {
        setConfirmConfig({
            isOpen: true,
            title: '☢️ AUTHORIZE SYSTEM PURGE',
            message: `You are about to permanently delete ${maintenanceQueue.length} orphaned assets from Supabase Storage clusters. This action is IRREVERSIBLE. Do you wish to proceed with the reclamation protocol?`,
            type: 'danger',
            onConfirm: async () => {
                const results = { success: 0, failed: 0 };

                for (const item of maintenanceQueue) {
                    const { error: storageError } = await supabase.storage
                        .from(item.bucket_name)
                        .remove([item.file_path]);

                    if (!storageError) {
                        await supabase.from('storage_deletion_queue').delete().eq('id', item.id);
                        results.success++;
                    } else {
                        results.failed++;
                    }
                }

                toast.success(`Purge complete: ${results.success} cleared, ${results.failed} failed.`);
                setMaintenanceQueue([]);
                await logAssetAction('SYSTEM', 'MAINTENANCE', 'STORAGE_PURGE', 'active', 'purged', `Cleaned ${results.success} orphaned files.`);
            }
        });
    };

    if (!profile?.is_admin) return null;

    return (
        <div className="min-h-screen bg-charcoal-50 pt-32 pb-20 px-4">
            <SEO title="Admin Moderation Terminal | Silent Money" />

            <div className="max-w-7xl mx-auto">
                <header className="mb-12">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
                        <div>
                            <div className="text-[10px] font-black text-primary-600 uppercase tracking-[0.3em] mb-2">Institutional Platform Terminal</div>
                            <h1 className="text-4xl font-black text-charcoal-900 tracking-tighter">Admin <span className="text-charcoal-400">Dashboard</span></h1>
                        </div>
                        <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-white rounded-2xl border border-charcoal-100 shadow-sm text-[10px] font-black text-charcoal-600 uppercase tracking-widest">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            System: Operational
                        </div>
                    </div>

                    {/* Highly Engineered Persistent Tab Bar */}
                    <div className="w-full bg-white p-1.5 rounded-[1.5rem] border border-charcoal-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)]">
                        <div className="w-full overflow-x-auto hide-scrollbar scroll-smooth">
                            <div className="flex items-center gap-1.5 min-w-max md:min-w-full md:justify-between px-0.5">
                                <button
                                    onClick={() => setActiveTab('pending')}
                                    className={`px-4 py-3 rounded-[1.15rem] text-[10px] font-black uppercase tracking-[0.1em] transition-all flex items-center gap-3 whitespace-nowrap flex-1 justify-center ${activeTab === 'pending' ? 'bg-charcoal-950 text-white shadow-xl translate-y-[-1px]' : 'text-charcoal-400 hover:text-charcoal-900 hover:bg-charcoal-50'}`}
                                >
                                    <span>Review</span>
                                    <div className="flex gap-1">
                                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black ${activeTab === 'pending' ? 'bg-white/10 text-white' : 'bg-charcoal-100 text-charcoal-400'}`}>{pendingIdeas.length + pendingFranchises.length}</span>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setActiveTab('history')}
                                    className={`px-4 py-3 rounded-[1.15rem] text-[10px] font-black uppercase tracking-[0.1em] transition-all flex items-center gap-3 whitespace-nowrap flex-1 justify-center ${activeTab === 'history' ? 'bg-charcoal-950 text-white shadow-xl translate-y-[-1px]' : 'text-charcoal-400 hover:text-charcoal-900 hover:bg-charcoal-50'}`}
                                >
                                    <span>History</span>
                                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black ${activeTab === 'history' ? 'bg-white/10 text-white' : 'bg-charcoal-100 text-charcoal-400'}`}>{approvedIdeas.length + approvedFranchises.length}</span>
                                </button>

                                <button
                                    onClick={() => setActiveTab('all')}
                                    className={`px-4 py-3 rounded-[1.15rem] text-[10px] font-black uppercase tracking-[0.1em] transition-all flex items-center gap-3 whitespace-nowrap flex-1 justify-center ${activeTab === 'all' ? 'bg-charcoal-950 text-white shadow-xl translate-y-[-1px]' : 'text-charcoal-400 hover:text-charcoal-900 hover:bg-charcoal-50'}`}
                                >
                                    <span>Database</span>
                                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black ${activeTab === 'all' ? 'bg-white/10 text-white' : 'bg-charcoal-100 text-charcoal-400'}`}>{allIdeas.length + allFranchises.length}</span>
                                </button>

                                <button
                                    onClick={() => setActiveTab('archived')}
                                    className={`px-4 py-3 rounded-[1.15rem] text-[10px] font-black uppercase tracking-[0.1em] transition-all flex items-center gap-3 whitespace-nowrap flex-1 justify-center ${activeTab === 'archived' ? 'bg-charcoal-950 text-white shadow-xl translate-y-[-1px]' : 'text-charcoal-400 hover:text-charcoal-900 hover:bg-charcoal-50'}`}
                                >
                                    <span>Archived</span>
                                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black ${activeTab === 'archived' ? 'bg-white/10 text-white' : 'bg-charcoal-100 text-charcoal-400'}`}>{archivedIdeas.length + archivedFranchises.length}</span>
                                </button>

                                {/* Spacing to delineate Administrative sectors from Database sectors */}
                                <div className="hidden lg:block w-4 shrink-0" />

                                <button
                                    onClick={() => setActiveTab('audits')}
                                    className={`px-4 py-3 rounded-[1.15rem] text-[10px] font-black uppercase tracking-[0.1em] transition-all flex items-center gap-3 whitespace-nowrap flex-1 justify-center ${activeTab === 'audits' ? 'bg-primary-600 text-white shadow-xl shadow-primary-600/20 translate-y-[-1px]' : 'text-charcoal-400 hover:text-primary-600 hover:bg-primary-50'}`}
                                >
                                    <span>Verifications</span>
                                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black ${activeTab === 'audits' ? 'bg-white/20 text-white' : 'bg-primary-50 text-primary-600'}`}>{auditRequests.length}</span>
                                </button>

                                <button
                                    onClick={() => setActiveTab('users')}
                                    className={`px-4 py-3 rounded-[1.15rem] text-[10px] font-black uppercase tracking-[0.1em] transition-all flex items-center gap-3 whitespace-nowrap flex-1 justify-center ${activeTab === 'users' ? 'bg-charcoal-950 text-white shadow-xl translate-y-[-1px]' : 'text-charcoal-400 hover:text-charcoal-900 hover:bg-charcoal-50'}`}
                                >
                                    <span>Users</span>
                                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black ${activeTab === 'users' ? 'bg-white/10 text-white' : 'bg-charcoal-100 text-charcoal-400'}`}>{allUsers.length}</span>
                                </button>

                                <button
                                    onClick={() => setActiveTab('categories')}
                                    className={`px-4 py-3 rounded-[1.15rem] text-[10px] font-black uppercase tracking-[0.1em] transition-all flex items-center gap-3 whitespace-nowrap flex-1 justify-center ${activeTab === 'categories' ? 'bg-charcoal-950 text-white shadow-xl translate-y-[-1px]' : 'text-charcoal-400 hover:text-charcoal-900 hover:bg-charcoal-50'}`}
                                >
                                    <span>Taxonomy</span>
                                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black ${activeTab === 'categories' ? 'bg-white/10 text-white' : 'bg-charcoal-100 text-charcoal-400'}`}>{allCategories.length}</span>
                                </button>

                                <button
                                    onClick={() => setActiveTab('logs')}
                                    className={`px-4 py-3 rounded-[1.15rem] text-[10px] font-black uppercase tracking-[0.1em] transition-all flex items-center gap-3 whitespace-nowrap flex-1 justify-center ${activeTab === 'logs' ? 'bg-charcoal-950 text-white shadow-xl translate-y-[-1px]' : 'text-charcoal-400 hover:text-charcoal-900 hover:bg-charcoal-50'}`}
                                >
                                    <span>Logs</span>
                                </button>

                                <button
                                    onClick={() => setActiveTab('performance')}
                                    className={`px-4 py-3 rounded-[1.15rem] text-[10px] font-black uppercase tracking-[0.1em] transition-all flex items-center gap-3 whitespace-nowrap flex-1 justify-center ${activeTab === 'performance' ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xl translate-y-[-1px]' : 'text-charcoal-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                                >
                                    <span>Growth</span>
                                </button>

                                <button
                                    onClick={() => setActiveTab('maintenance')}
                                    className={`px-4 py-3 rounded-[1.15rem] text-[10px] font-black uppercase tracking-[0.1em] transition-all flex items-center gap-3 whitespace-nowrap flex-1 justify-center ${activeTab === 'maintenance' ? 'bg-red-500 text-white shadow-xl shadow-red-500/20 translate-y-[-1px]' : 'text-charcoal-400 hover:text-red-500 hover:bg-red-50'}`}
                                >
                                    <span>System</span>
                                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black ${activeTab === 'maintenance' ? 'bg-white/20 text-white' : 'bg-red-50 text-red-500'}`}>{maintenanceQueue.length}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400">🔍</span>
                        <input
                            type="text"
                            placeholder="Search by ID, Name, or User..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-12 py-3 rounded-xl border border-charcoal-100 focus:ring-2 focus:ring-primary-600 outline-none font-medium text-sm transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-charcoal-50 text-charcoal-400 rounded-lg hover:text-charcoal-900 transition-colors"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Premium Institutional Pagination Command Bar */}
                    {activeTab === 'all' && (
                        <div className="flex items-center bg-white p-1 rounded-2xl border border-charcoal-100 shadow-sm self-stretch md:self-auto h-12">
                            <button
                                disabled={page === 0 || pageLoading}
                                onClick={() => setPage(p => p - 1)}
                                className="h-full px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-charcoal-400 hover:text-charcoal-900 flex items-center gap-2 group transition-all disabled:opacity-30"
                            >
                                <span className="group-hover:-translate-x-1 transition-transform">←</span> Prev
                            </button>

                            <div className="w-px h-6 bg-charcoal-100 mx-1" />

                            <div className="px-6 h-full flex items-center justify-center min-w-[120px]">
                                {pageLoading ? (
                                    <div className="flex gap-1">
                                        <div className="w-1 h-1 rounded-full bg-primary-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-1 h-1 rounded-full bg-primary-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-1 h-1 rounded-full bg-primary-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                ) : (
                                    <span className="text-[10px] font-black text-charcoal-900 uppercase tracking-widest">
                                        Data <span className="text-primary-600">Page {page + 1}</span>
                                    </span>
                                )}
                            </div>

                            <div className="w-px h-6 bg-charcoal-100 mx-1" />

                            <button
                                disabled={pageLoading || (allIdeas.length < ROWS_PER_PAGE && allFranchises.length < ROWS_PER_PAGE)}
                                onClick={() => setPage(p => p + 1)}
                                className="h-full px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-charcoal-950 hover:bg-charcoal-950 hover:text-white flex items-center gap-2 group transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-charcoal-950"
                            >
                                Next <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Bulk Actions Bar */}
                {(selectedItems.ideas.length > 0 || selectedItems.franchises.length > 0) && activeTab === 'pending' && (
                    <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-2xl flex items-center justify-between">
                        <div className="text-sm font-black text-primary-900 uppercase tracking-wider">
                            {selectedItems.ideas.length + selectedItems.franchises.length} Items Selected
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleBulkApprove} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-black uppercase tracking-wider hover:bg-emerald-700">
                                Approve All
                            </button>
                            <button onClick={handleBulkArchive} className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-black uppercase tracking-wider hover:bg-red-700">
                                Archive All
                            </button>
                            <button onClick={() => setSelectedItems({ ideas: [], franchises: [] })} className="px-4 py-2 bg-white border border-charcoal-200 text-charcoal-600 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-charcoal-50">
                                Clear
                            </button>
                        </div>
                    </div>
                )}

                {/* ACTIVITY LOGS TAB CONTENT */}
                {activeTab === 'logs' && (
                    <div className="card bg-white border-none shadow-xl p-8">
                        <h2 className="text-xl font-black text-charcoal-900 uppercase tracking-tighter mb-6">System Activity Logs</h2>
                        <div className="space-y-4">
                            {adminLogs.map(log => (
                                <div key={log.id} className="flex items-center gap-4 p-4 bg-charcoal-50 rounded-xl border border-charcoal-100">
                                    <div className="w-10 h-10 rounded-full bg-charcoal-200 flex items-center justify-center text-lg">
                                        {log.action_type === 'approve' ? '✅' : log.action_type === 'ban' ? '🚫' : '📝'}
                                    </div>
                                    <div>
                                        <div className="text-xs font-black text-charcoal-900 uppercase tracking-wide">
                                            {log.profiles?.full_name || 'System Admin'} <span className="text-charcoal-400">•</span> {log.action_type}
                                        </div>
                                        <div className="text-[10px] font-mono text-charcoal-500 mt-1">
                                            Target: {log.target_type} ({log.target_id})
                                        </div>
                                    </div>
                                    <div className="ml-auto text-[10px] font-bold text-charcoal-400">
                                        {new Date(log.created_at).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'audits' && (
                    <div className="mt-8">
                        <section className="card bg-white border-none shadow-xl p-8">
                            <div className="flex justify-between items-center mb-8 border-b border-charcoal-50 pb-4">
                                <h2 className="text-base font-black text-charcoal-900 uppercase tracking-widest flex items-center gap-3">
                                    <span>🔍</span> Verification Requests
                                </h2>
                                <span className="text-[10px] font-black text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full uppercase tracking-widest">
                                    {auditRequests.length} Total Requests
                                </span>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {auditRequests.length === 0 ? (
                                    <div className="col-span-full py-20 text-center text-charcoal-400 font-medium italic">
                                        No verification requests received yet.
                                    </div>
                                ) : (
                                    auditRequests.map(audit => (
                                        <div key={audit.id} className="p-6 bg-charcoal-50 rounded-[2rem] border border-charcoal-100 flex flex-col h-full relative group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-xl font-black text-charcoal-950 uppercase tracking-tight">{audit.brand_name}</h3>
                                                    <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest font-mono">{audit.brand_sector}</p>
                                                </div>
                                                <select
                                                    value={audit.status}
                                                    onChange={(e) => handleUpdateAuditStatus(audit.id, e.target.value)}
                                                    className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg appearance-none cursor-pointer border shadow-sm ${audit.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                        audit.status === 'in-review' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                            audit.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                                'bg-gray-100 text-gray-500 border-gray-200'
                                                        }`}
                                                >
                                                    <option value="pending">PENDING</option>
                                                    <option value="in-review">IN-REVIEW</option>
                                                    <option value="completed">COMPLETED</option>
                                                    <option value="cancelled">CANCELLED</option>
                                                </select>
                                            </div>

                                            <div className="space-y-4 mb-6 flex-1">
                                                <div className="p-3 bg-white rounded-xl border border-charcoal-100/50">
                                                    <div className="text-[8px] font-black text-charcoal-400 uppercase tracking-widest mb-1">Target Budget</div>
                                                    <div className="text-xs font-bold text-charcoal-900 font-mono">₹{audit.investment_budget}</div>
                                                </div>
                                                <div className="p-3 bg-white rounded-xl border border-charcoal-100/50">
                                                    <div className="text-[8px] font-black text-charcoal-400 uppercase tracking-widest mb-1">Location</div>
                                                    <div className="text-xs font-bold text-charcoal-900">{audit.location_target || 'N/A'}</div>
                                                </div>
                                                {audit.additional_notes && (
                                                    <div className="p-3 bg-white rounded-xl border border-charcoal-100/50">
                                                        <div className="text-[8px] font-black text-charcoal-400 uppercase tracking-widest mb-1">User Notes</div>
                                                        <p className="text-[10px] text-charcoal-600 font-medium leading-relaxed italic line-clamp-3">"{audit.additional_notes}"</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="pt-4 border-t border-charcoal-200/50 mt-auto">
                                                {audit.admin_feedback && (
                                                    <div className="mb-4 p-3 bg-primary-50 rounded-xl border border-primary-100">
                                                        <div className="text-[8px] font-black text-primary-600 uppercase tracking-widest mb-1">Admin Response</div>
                                                        <p className="text-[10px] text-charcoal-700 font-medium leading-relaxed italic line-clamp-2">"{audit.admin_feedback}"</p>
                                                        {audit.report_url && (
                                                            <a
                                                                href={audit.report_url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="mt-2 inline-flex items-center gap-2 text-[8px] font-black text-primary-600 uppercase tracking-widest hover:underline"
                                                            >
                                                                <span>🗂️</span> View Uploaded Report
                                                            </a>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-charcoal-400">
                                                    <span>User ID: {audit.user_id.slice(0, 8)}...</span>
                                                    <span>{new Date(audit.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}

                            </div>
                        </section>
                    </div>
                )}

                {['pending', 'history', 'all', 'archived'].includes(activeTab) && (
                    <>
                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Ideas Section */}
                            <section className="card bg-white border-none shadow-xl p-8 h-fit">
                                <div className="flex justify-between items-center mb-8 border-b border-charcoal-50 pb-4">
                                    <h2 className="text-sm font-black text-charcoal-900 uppercase tracking-widest flex items-center gap-2">
                                        <span>💡</span> {activeTab === 'pending' ? 'Pending Ideas' : activeTab === 'history' ? 'Recently Approved' : activeTab === 'archived' ? 'Archived Ideas' : 'All Ideas'}
                                    </h2>
                                    <span className="text-[10px] font-black text-primary-600 bg-primary-50 px-3 py-1 rounded-full uppercase tracking-widest">
                                        {(filterItems(activeTab === 'pending' ? pendingIdeas : activeTab === 'history' ? approvedIdeas : activeTab === 'archived' ? archivedIdeas : allIdeas)).length} Items
                                    </span>
                                </div>

                                <div className="space-y-6">
                                    {(filterItems(activeTab === 'pending' ? pendingIdeas : activeTab === 'history' ? approvedIdeas : activeTab === 'archived' ? archivedIdeas : allIdeas)).length === 0 ? (
                                        <div className="py-12 text-center text-charcoal-400 font-medium italic">
                                            {activeTab === 'pending' ? 'No pending ideas.' : 'No items found.'}
                                        </div>
                                    ) : (
                                        (filterItems(activeTab === 'pending' ? pendingIdeas : activeTab === 'history' ? approvedIdeas : activeTab === 'archived' ? archivedIdeas : allIdeas)).map(idea => (
                                            <div key={idea.id} className="p-5 bg-charcoal-50 rounded-xl border border-charcoal-100 group hover:border-primary-200 transition-all relative">
                                                {activeTab === 'pending' && (
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedItems.ideas.includes(idea.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedItems(prev => ({ ...prev, ideas: [...prev.ideas, idea.id] }));
                                                            } else {
                                                                setSelectedItems(prev => ({ ...prev, ideas: prev.ideas.filter(id => id !== idea.id) }));
                                                            }
                                                        }}
                                                        className="absolute top-4 left-4 w-5 h-5 rounded border-2 border-charcoal-300 cursor-pointer"
                                                    />
                                                )}
                                                <div className="flex justify-between items-start mb-3 ml-8">
                                                    <div className="flex-1">
                                                        <h3 className="text-base font-black text-charcoal-950 uppercase tracking-tight leading-tight mb-1">{idea.title}</h3>
                                                        <div className="text-[9px] font-black text-charcoal-400 uppercase tracking-widest flex items-center gap-2">
                                                            <span>By {idea.profiles?.full_name || 'Anonymous Author'}</span>
                                                            {idea.deleted_at ? (
                                                                <span className="text-red-500 flex items-center gap-1 ring-1 ring-red-100 px-2 py-0.5 rounded-full bg-red-50/50">
                                                                    <span className="w-1 h-1 rounded-full bg-red-500" /> ARCHIVED
                                                                </span>
                                                            ) : idea.is_approved ? (
                                                                <span className="text-emerald-500 flex items-center gap-1 ring-1 ring-emerald-100 px-2 py-0.5 rounded-full bg-emerald-50/50">
                                                                    <span className="w-1 h-1 rounded-full bg-emerald-500 opacity-50" /> AUTH
                                                                </span>
                                                            ) : (
                                                                <span className="text-amber-500 flex items-center gap-1 ring-1 ring-amber-100 px-2 py-0.5 rounded-full bg-amber-50/50">
                                                                    <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" /> PENDING
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mb-4">
                                                    <p className="text-xs text-charcoal-500 line-clamp-2 leading-relaxed font-medium">
                                                        {idea.short_description}
                                                    </p>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-charcoal-100/50">
                                                    {activeTab !== 'pending' && (
                                                        <button
                                                            onClick={() => handleToggleFeatured(idea.id, 'idea', idea.is_featured)}
                                                            className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all ${idea.is_featured
                                                                ? 'bg-amber-100 text-amber-700 border border-amber-300'
                                                                : 'bg-white text-charcoal-400 border border-charcoal-200 hover:border-amber-300'
                                                                }`}
                                                            title={idea.is_featured ? 'Remove from Featured' : 'Mark as Featured'}
                                                        >
                                                            {idea.is_featured ? '⭐ Featured' : '☆ Feature'}
                                                        </button>
                                                    )}
                                                    {activeTab === 'pending' && (
                                                        <div className="flex gap-1.5 w-full sm:w-auto">
                                                            <button
                                                                onClick={() => handleApprove(idea.id, 'idea')}
                                                                className="flex-1 sm:flex-none px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[8px] font-black uppercase tracking-wider hover:bg-emerald-700 transition-all"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleRequestRevision(idea.id, 'idea')}
                                                                className="flex-1 sm:flex-none px-3 py-1.5 bg-white text-amber-600 border border-amber-200 rounded-lg text-[8px] font-black uppercase tracking-wider hover:bg-amber-50 transition-all"
                                                            >
                                                                Revision
                                                            </button>
                                                        </div>
                                                    )}
                                                    <div className="flex gap-1.5 items-center ml-auto">
                                                        <Link
                                                            to={`/ideas/${idea.slug}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="px-2.5 py-1.5 bg-charcoal-50 text-charcoal-600 rounded-lg text-[8px] font-black uppercase tracking-wider hover:bg-charcoal-900 hover:text-white transition-all"
                                                        >
                                                            Preview
                                                        </Link>
                                                        <Link
                                                            to={`/edit-idea/${idea.id}`}
                                                            className="px-2.5 py-1.5 bg-white text-primary-600 border border-primary-100 rounded-lg text-[8px] font-black uppercase tracking-wider hover:bg-primary-600 hover:text-white transition-all"
                                                        >
                                                            Edit
                                                        </Link>
                                                        <button
                                                            onClick={() => activeTab === 'archived' ? handleUnarchive(idea.id, 'idea') : handleDelete(idea.id, 'idea')}
                                                            className={`px-2.5 py-1.5 bg-white ${activeTab === 'archived' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-red-400 hover:bg-red-50 hover:text-red-600'} border border-transparent rounded-lg text-[8px] font-black uppercase tracking-wider transition-all`}
                                                        >
                                                            {activeTab === 'archived' ? 'Restore' : 'Archive'}
                                                        </button>
                                                        {(activeTab === 'archived' || activeTab === 'all') && (
                                                            <button
                                                                onClick={() => handlePermanentDelete(idea.id, 'idea', idea.title)}
                                                                className="px-2.5 py-1.5 bg-red-600 text-white rounded-lg text-[8px] font-black uppercase tracking-wider hover:bg-red-700 transition-all"
                                                                title="Permanently delete from database"
                                                            >
                                                                🗑️ Delete
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                {idea.proof_url && (
                                                    <div className="mt-3 text-right">
                                                        <a href={idea.proof_url} target="_blank" rel="noreferrer" className="text-[8px] font-black text-primary-600 uppercase tracking-widest hover:underline inline-flex items-center gap-1 opacity-60 hover:opacity-100">
                                                            <span>📁</span> Proof Attached
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </section>

                            {/* Franchises Section */}
                            <section className="card bg-white border-none shadow-xl p-8 h-fit">
                                <div className="flex justify-between items-center mb-8 border-b border-charcoal-50 pb-4">
                                    <h2 className="text-sm font-black text-charcoal-900 uppercase tracking-widest flex items-center gap-2">
                                        <span>🏢</span> {activeTab === 'pending' ? 'Pending Franchises' : activeTab === 'history' ? 'Verified Franchises' : activeTab === 'archived' ? 'Archived Franchises' : 'All Franchises'}
                                    </h2>
                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">
                                        {(filterItems(activeTab === 'pending' ? pendingFranchises : activeTab === 'history' ? approvedFranchises : activeTab === 'archived' ? archivedFranchises : allFranchises)).length} Items
                                    </span>
                                </div>

                                <div className="space-y-6">
                                    {(filterItems(activeTab === 'pending' ? pendingFranchises : activeTab === 'history' ? approvedFranchises : allFranchises)).length === 0 ? (
                                        <div className="py-12 text-center text-charcoal-400 font-medium italic">
                                            {activeTab === 'pending' ? 'No pending franchises.' : 'No items found.'}
                                        </div>
                                    ) : (
                                        (filterItems(activeTab === 'pending' ? pendingFranchises : activeTab === 'history' ? approvedFranchises : activeTab === 'archived' ? archivedFranchises : allFranchises)).map(fran => (
                                            <div key={fran.id} className="p-5 bg-charcoal-50 rounded-xl border border-charcoal-100 group hover:border-emerald-200 transition-all relative">
                                                {activeTab === 'pending' && (
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedItems.franchises.includes(fran.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedItems(prev => ({ ...prev, franchises: [...prev.franchises, fran.id] }));
                                                            } else {
                                                                setSelectedItems(prev => ({ ...prev, franchises: prev.franchises.filter(id => id !== fran.id) }));
                                                            }
                                                        }}
                                                        className="absolute top-4 left-4 w-5 h-5 rounded border-2 border-charcoal-300 cursor-pointer"
                                                    />
                                                )}
                                                <div className="flex justify-between items-start mb-3 ml-8">
                                                    <div className="flex-1">
                                                        <h3 className="text-base font-black text-charcoal-950 uppercase tracking-tight leading-tight mb-1">{fran.name}</h3>
                                                        <div className="text-[9px] font-black text-charcoal-400 uppercase tracking-widest flex items-center gap-2">
                                                            <span>By {fran.profiles?.full_name || 'Anonymous Author'}</span>
                                                            {fran.deleted_at ? (
                                                                <span className="text-red-500 flex items-center gap-1 ring-1 ring-red-100 px-2 py-0.5 rounded-full bg-red-50/50">
                                                                    <span className="w-1 h-1 rounded-full bg-red-500" /> ARCHIVED
                                                                </span>
                                                            ) : fran.is_approved ? (
                                                                <span className="text-emerald-500 flex items-center gap-1 ring-1 ring-emerald-100 px-2 py-0.5 rounded-full bg-emerald-50/50">
                                                                    <span className="w-1 h-1 rounded-full bg-emerald-500 opacity-50" /> VERIFIED
                                                                </span>
                                                            ) : (
                                                                <span className="text-amber-500 flex items-center gap-1 ring-1 ring-amber-100 px-2 py-0.5 rounded-full bg-amber-50/50">
                                                                    <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" /> PENDING
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    <span className="text-[8px] font-black text-charcoal-400 bg-white border border-charcoal-100 px-2 py-1 rounded-md uppercase tracking-widest">
                                                        {fran.category}
                                                    </span>
                                                    <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-md uppercase tracking-widest">
                                                        {(fran.investment_min / 100000).toFixed(1)}L Min
                                                    </span>
                                                </div>


                                                <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-charcoal-100/50 ml-8">
                                                    {activeTab !== 'pending' && (
                                                        <button
                                                            onClick={() => handleToggleFeatured(fran.id, 'franchise', fran.is_featured)}
                                                            className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all ${fran.is_featured
                                                                ? 'bg-amber-100 text-amber-700 border border-amber-300'
                                                                : 'bg-white text-charcoal-400 border border-charcoal-200 hover:border-amber-300'
                                                                }`}
                                                            title={fran.is_featured ? 'Remove from Featured' : 'Mark as Featured'}
                                                        >
                                                            {fran.is_featured ? '⭐ Featured' : '☆ Feature'}
                                                        </button>
                                                    )}
                                                    {activeTab === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(fran.id, 'franchise')}
                                                                className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg text-[8px] font-black uppercase tracking-wider hover:bg-emerald-700 transition-all"
                                                            >
                                                                Verify
                                                            </button>
                                                            <button
                                                                onClick={() => handleRequestRevision(fran.id, 'franchise')}
                                                                className="px-3.5 py-1.5 bg-white text-amber-600 border border-amber-200 rounded-lg text-[8px] font-black uppercase tracking-wider hover:bg-amber-50 transition-all"
                                                            >
                                                                Request Changes
                                                            </button>
                                                        </>
                                                    )}
                                                    <Link
                                                        to={`/franchise/${fran.slug}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="px-3.5 py-1.5 bg-charcoal-100 text-charcoal-600 border border-charcoal-200 rounded-lg text-[8px] font-black uppercase tracking-wider hover:bg-charcoal-900 hover:text-white transition-all"
                                                    >
                                                        Preview
                                                    </Link>
                                                    <Link
                                                        to={`/edit-franchise/${fran.id}`}
                                                        className="px-3.5 py-1.5 bg-white text-primary-600 border border-primary-100 rounded-lg text-[8px] font-black uppercase tracking-wider hover:bg-primary-600 hover:text-white transition-all"
                                                    >
                                                        Modify
                                                    </Link>
                                                    <button
                                                        onClick={() => activeTab === 'archived' ? handleUnarchive(fran.id, 'franchise') : handleDelete(fran.id, 'franchise')}
                                                        className={`ml-auto px-3.5 py-1.5 bg-white ${activeTab === 'archived' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-red-400 hover:bg-red-50 hover:text-red-600'} border border-transparent rounded-lg text-[8px] font-black uppercase tracking-wider transition-all`}
                                                    >
                                                        {activeTab === 'archived' ? 'Unarchive' : 'Archive'}
                                                    </button>
                                                    {(activeTab === 'archived' || activeTab === 'all') && (
                                                        <button
                                                            onClick={() => handlePermanentDelete(fran.id, 'franchise', fran.name)}
                                                            className="px-3.5 py-1.5 bg-red-600 text-white border border-red-700 rounded-lg text-[8px] font-black uppercase tracking-wider hover:bg-red-700 transition-all"
                                                            title="Permanently delete from database"
                                                        >
                                                            🗑️ Delete
                                                        </button>
                                                    )}
                                                </div>
                                                {fran.proof_url && (
                                                    <div className="mt-3 text-right">
                                                        <a href={fran.proof_url} target="_blank" rel="noreferrer" className="text-[8px] font-black text-primary-600 uppercase tracking-widest hover:underline inline-flex items-center gap-1 opacity-60 hover:opacity-100">
                                                            <span>📁</span> Proof Attached
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}

                                    {filterItems(activeTab === 'pending' ? pendingFranchises : activeTab === 'history' ? approvedFranchises : activeTab === 'archived' ? archivedFranchises : allFranchises).length === 0 && (
                                        <div className="py-20 text-center">
                                            <div className="text-4xl mb-4">🏢</div>
                                            <div className="text-sm font-black text-charcoal-900 uppercase tracking-widest">No Brands Found in This Sector</div>
                                            <p className="text-[10px] text-charcoal-400 font-bold uppercase tracking-widest mt-2">Check database for archived or unverified assets</p>
                                            {searchQuery && (
                                                <button
                                                    onClick={() => setSearchQuery('')}
                                                    className="mt-6 px-6 py-2 bg-charcoal-100 text-charcoal-600 rounded-xl text-[9px] font-black uppercase tracking-widest"
                                                >
                                                    Clear Search
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>

                        {/* Bottom Command Bar - Dynamic Pagination */}
                        {activeTab === 'all' && (
                            <div className="mt-10 flex justify-end">
                                <div className="flex items-center bg-white p-1 rounded-2xl border border-charcoal-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] h-12">
                                    <button
                                        disabled={page === 0 || pageLoading}
                                        onClick={() => {
                                            setPage(p => p - 1);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="h-full px-5 rounded-xl text-[10px] font-black uppercase tracking-widest text-charcoal-400 hover:text-charcoal-900 flex items-center gap-2 transition-all disabled:opacity-30"
                                    >
                                        ← Previous
                                    </button>

                                    <div className="w-px h-6 bg-charcoal-100 mx-1" />

                                    <div className="px-6 h-full flex items-center justify-center min-w-[140px]">
                                        {pageLoading ? (
                                            <div className="flex gap-1">
                                                <div className="w-1 h-1 rounded-full bg-primary-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <div className="w-1 h-1 rounded-full bg-primary-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <div className="w-1 h-1 rounded-full bg-primary-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-black text-charcoal-900 uppercase tracking-widest">
                                                Registry <span className="text-primary-600">Page {page + 1}</span>
                                            </span>
                                        )}
                                    </div>

                                    <div className="w-px h-6 bg-charcoal-100 mx-1" />

                                    <button
                                        disabled={pageLoading || (allIdeas.length < ROWS_PER_PAGE && allFranchises.length < ROWS_PER_PAGE)}
                                        onClick={() => {
                                            setPage(p => p + 1);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="h-full px-6 bg-charcoal-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 group transition-all hover:bg-black disabled:opacity-30"
                                    >
                                        Next Page <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'users' && (
                    <div className="mt-8">
                        <section className="card bg-white border-none shadow-xl p-8">
                            <div className="flex justify-between items-center mb-10 border-b border-charcoal-50 pb-6">
                                <div>
                                    <h2 className="text-xl font-black text-charcoal-900 uppercase tracking-tighter flex items-center gap-3">
                                        <span>👤</span> Users
                                    </h2>
                                    <p className="text-[10px] text-charcoal-400 font-bold uppercase tracking-widest mt-1">Platform members</p>
                                </div>
                                <span className="text-[11px] font-black text-white bg-charcoal-900 px-4 py-2 rounded-xl uppercase tracking-[0.2em] shadow-lg shadow-charcoal-200">
                                    {allUsers.length} Active Profiles
                                </span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-[10px] font-black text-charcoal-400 uppercase tracking-[0.2em] border-b border-charcoal-50">
                                            <th className="pb-4 pl-4">User</th>
                                            <th className="pb-4 text-center">Role Status</th>
                                            <th className="pb-4 text-center">Joined On</th>
                                            <th className="pb-4 text-right pr-4">Profile ID</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-charcoal-50">
                                        {allUsers.map(u => (
                                            <tr key={u.id} className="group hover:bg-charcoal-50 transition-colors">
                                                <td className="py-6 pl-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-xl border border-primary-100 group-hover:scale-110 transition-transform">
                                                            {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full rounded-2xl object-cover" /> : '👤'}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-black text-charcoal-900 flex items-center gap-2">
                                                                {u.full_name || 'Anonymous'}
                                                                {u.id === user.id && (
                                                                    <span className="text-[9px] font-black text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md uppercase tracking-widest">You</span>
                                                                )}
                                                            </div>
                                                            <div className="text-[10px] font-bold text-primary-600 uppercase tracking-widest">{u.membership_tier || 'Basic'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-6 text-center">
                                                    <div className="flex gap-2 justify-center flex-wrap">
                                                        {u.is_admin ? (
                                                            <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${u.role === 'owner'
                                                                ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-lg'
                                                                : u.role === 'super_admin'
                                                                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                                                                    : 'bg-charcoal-900 text-white'
                                                                }`}>
                                                                {u.role === 'owner' && '👑'}
                                                                {u.role === 'super_admin' && '⚡'}
                                                                {u.role === 'admin' && '🔑'}
                                                                {u.role === 'moderator' && '🛡️'}
                                                                {u.role === 'owner' ? 'OWNER' : u.role === 'super_admin' ? 'SUPER ADMIN' : u.role === 'admin' ? 'ADMINISTRATOR' : 'MODERATOR'}
                                                            </span>
                                                        ) : (
                                                            <span className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-charcoal-100 text-charcoal-400">
                                                                INVESTOR
                                                            </span>
                                                        )}
                                                        {!u.is_banned && (
                                                            <button
                                                                onClick={() => handleToggleAdmin(u.id, u.is_admin, u.full_name)}
                                                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${u.is_admin
                                                                    ? 'bg-amber-100 text-amber-700 border border-amber-300 hover:bg-amber-200'
                                                                    : 'bg-emerald-100 text-emerald-700 border border-emerald-300 hover:bg-emerald-200'
                                                                    }`}
                                                                title={u.is_admin ? 'Revoke Admin Privileges' : 'Grant Admin Privileges'}
                                                            >
                                                                {u.is_admin ? '⚡ Revoke Admin' : '👑 Make Admin'}
                                                            </button>
                                                        )}
                                                        {!u.is_admin && !u.is_banned && (
                                                            <button
                                                                onClick={() => handleBanUser(u.id)}
                                                                className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-red-200"
                                                            >
                                                                BAN
                                                            </button>
                                                        )}
                                                        {u.is_banned && (
                                                            <button
                                                                onClick={() => handleUnbanUser(u.id)}
                                                                className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-red-700 shadow-lg shadow-red-200"
                                                            >
                                                                BANNED (UNBAN)
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-6 text-center text-[11px] font-mono font-bold text-charcoal-500">
                                                    {new Date(u.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="py-6 text-right pr-4 text-[9px] font-mono text-charcoal-300">
                                                    {u.id.slice(0, 16)}...
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'categories' && (
                    <div className="space-y-6">
                        <section className="card bg-white border-none shadow-xl p-8 mb-10 overflow-hidden relative">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-xl font-black text-charcoal-900 uppercase tracking-tighter">Taxonomy Management</h2>
                                    <p className="text-[10px] font-bold text-charcoal-400 uppercase tracking-widest mt-1">Configure global asset classification silos</p>
                                </div>
                                <button
                                    onClick={() => setCategoryModal({ isOpen: true, category: null })}
                                    className="px-6 py-2.5 bg-charcoal-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 shadow-lg shadow-charcoal-900/10 transition-all flex items-center gap-2"
                                >
                                    <span>➕</span> Add New Category
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-[10px] font-black text-charcoal-400 uppercase tracking-[0.2em] border-b border-charcoal-50">
                                            <th className="pb-4 pl-4 text-center">Order</th>
                                            <th className="pb-4">Category</th>
                                            <th className="pb-4">Slug / Path</th>
                                            <th className="pb-4">Description</th>
                                            <th className="pb-4 text-right pr-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-charcoal-50">
                                        {allCategories.map(cat => (
                                            <tr key={cat.id} className="group hover:bg-charcoal-50 transition-colors">
                                                <td className="py-6 pl-4 text-center">
                                                    <span className="w-8 h-8 rounded-lg bg-charcoal-100 flex items-center justify-center text-[10px] font-black text-charcoal-600 mx-auto">
                                                        {cat.display_order}
                                                    </span>
                                                </td>
                                                <td className="py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-lg border border-primary-100 group-hover:scale-110 transition-transform">
                                                            {cat.icon || '📁'}
                                                        </div>
                                                        <div className="text-sm font-black text-charcoal-900">{cat.name}</div>
                                                    </div>
                                                </td>
                                                <td className="py-6">
                                                    <span className="px-2 py-1 bg-charcoal-100 rounded text-[9px] font-mono font-bold text-charcoal-600">/{cat.slug}</span>
                                                </td>
                                                <td className="py-6 pr-8">
                                                    <div className="text-[10px] font-medium text-charcoal-500 line-clamp-1 max-w-xs">{cat.description || 'No description provided.'}</div>
                                                </td>
                                                <td className="py-6 text-right pr-4">
                                                    <div className="flex gap-2 justify-end">
                                                        <button onClick={() => setCategoryModal({ isOpen: true, category: cat })} className="p-2 bg-white text-charcoal-400 rounded-lg hover:text-primary-600 hover:bg-primary-50 transition-all">⚙️</button>
                                                        <button onClick={() => handleDeleteCategory(cat.id)} className="p-2 bg-white text-charcoal-400 rounded-lg hover:text-red-600 hover:bg-red-50 transition-all">🗑️</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                )}

                {/* PERFORMANCE HUB TAB CONTENT */}
                {activeTab === 'performance' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <section className="grid lg:grid-cols-4 gap-6">
                            <div className="bg-white p-8 rounded-[2rem] border border-charcoal-50 shadow-xl shadow-charcoal-900/5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">📈</div>
                                <h3 className="text-[10px] font-black text-charcoal-400 uppercase tracking-[0.2em] mb-4">User Adoption</h3>
                                <div className="text-4xl font-black text-charcoal-950 mb-2">{allUsers.length} <span className="text-emerald-500 text-sm">Active</span></div>
                                <div className="w-full h-1 bg-charcoal-50 rounded-full mt-4 overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full w-[65%]" />
                                </div>
                                <p className="text-[10px] text-charcoal-400 font-bold mt-4 uppercase tracking-widest">Growth Velocity: High</p>
                            </div>

                            <div className="bg-charcoal-950 p-8 rounded-[2rem] text-white shadow-2xl shadow-charcoal-950/20 relative group">
                                <div className="absolute top-0 right-0 p-4 opacity-20">💎</div>
                                <h3 className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] mb-4">Asset Inventory</h3>
                                <div className="text-4xl font-black mb-2">{stats.ideas + stats.franchises} <span className="text-primary-400/50 text-sm">Silos</span></div>
                                <div className="flex gap-1 mt-6">
                                    {[30, 45, 25, 60, 40, 75, 90].map((h, i) => (
                                        <div key={i} className="flex-1 bg-primary-600/20 rounded-t-sm relative group/bar" style={{ height: '40px' }}>
                                            <div className="absolute bottom-0 left-0 w-full bg-primary-500 rounded-t-sm transition-all duration-1000" style={{ height: `${h}%` }} />
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[10px] text-white/30 font-bold mt-4 uppercase tracking-widest">Submissions: +12% WoW</p>
                            </div>

                            <div className="bg-white p-8 rounded-[2rem] border border-charcoal-50 shadow-xl shadow-charcoal-900/5">
                                <h3 className="text-[10px] font-black text-charcoal-400 uppercase tracking-[0.2em] mb-4">Verification Rate</h3>
                                <div className="text-4xl font-black text-charcoal-950 mb-2">
                                    {auditRequests.length > 0 ? ((auditRequests.filter(a => a.status === 'completed').length / auditRequests.length) * 100).toFixed(0) : 0}%
                                </div>
                                <div className="flex items-center gap-3 mt-4">
                                    <div className="w-12 h-12 rounded-full border-4 border-charcoal-50 border-t-primary-600 animate-spin" />
                                    <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest">
                                        {auditRequests.filter(a => a.status === 'pending').length} Pending Review
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-primary-600 to-indigo-700 p-8 rounded-[2rem] text-white shadow-xl">
                                <h3 className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-4">Global Reach</h3>
                                <div className="text-4xl font-black mb-2">PAN <span className="text-white/40">India</span></div>
                                <div className="mt-4 flex -space-x-3">
                                    {allUsers.slice(0, 5).map((u, i) => (
                                        <div key={i} className="w-10 h-10 rounded-full bg-white/20 border-2 border-primary-600 flex items-center justify-center text-xs font-black backdrop-blur-sm">
                                            {u.full_name?.[0] || 'U'}
                                        </div>
                                    ))}
                                    <div className="w-10 h-10 rounded-full bg-white text-primary-600 border-2 border-primary-600 flex items-center justify-center text-[10px] font-black">
                                        +{allUsers.length - 5}
                                    </div>
                                </div>
                                <p className="text-[10px] text-white/60 font-bold mt-4 uppercase tracking-widest">Institutional Coverage</p>
                            </div>
                        </section>

                        <div className="grid lg:grid-cols-2 gap-8">
                            <section className="bg-white p-10 rounded-[2.5rem] border border-charcoal-50 shadow-xl">
                                <div className="flex justify-between items-center mb-10">
                                    <h2 className="text-xl font-black text-charcoal-950 uppercase tracking-tighter">Sector Distribution</h2>
                                    <span className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest">Macro Overview</span>
                                </div>
                                <div className="space-y-6">
                                    {allCategories.slice(0, 6).map((cat, i) => {
                                        const count = (allIdeas.filter(id => id.category === cat.name).length + allFranchises.filter(f => f.category === cat.name).length);
                                        const percentage = Math.max(15, Math.min(95, (count / (stats.ideas + stats.franchises || 1)) * 300));
                                        return (
                                            <div key={cat.id} className="group">
                                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2 text-charcoal-600">
                                                    <span>{cat.name}</span>
                                                    <span className="text-primary-600">{count} Units</span>
                                                </div>
                                                <div className="h-4 bg-charcoal-50 rounded-lg p-1">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${percentage}%` }}
                                                        transition={{ duration: 1.5, delay: i * 0.1, ease: "circOut" }}
                                                        className="h-full bg-gradient-to-r from-charcoal-900 to-charcoal-700 rounded-md"
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>

                            <section className="bg-charcoal-950 p-10 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 blur-[80px] rounded-full -mr-32 -mt-32" />
                                <div className="flex justify-between items-center mb-10 relative">
                                    <h2 className="text-xl font-black uppercase tracking-tighter">Approval Efficiency</h2>
                                    <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-[10px] font-black tracking-widest">Q1 STATS</div>
                                </div>
                                <div className="space-y-8 relative">
                                    <div className="flex items-end gap-2 h-48">
                                        {[15, 25, 20, 35, 45, 40, 60, 55, 75, 70, 85, 95].map((h, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ scaleY: 0 }}
                                                animate={{ scaleY: 1 }}
                                                transition={{ duration: 0.8, delay: i * 0.05 }}
                                                className="flex-1 bg-primary-500/30 rounded-t-lg origin-bottom border-t-2 border-primary-400"
                                                style={{ height: `${h}%` }}
                                            />
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                                            <div className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-2">Avg Verification Time</div>
                                            <div className="text-2xl font-black">4.2h</div>
                                        </div>
                                        <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                                            <div className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-2">Rejection Ratio</div>
                                            <div className="text-2xl font-black">12.5%</div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                )}

                {/* MAINTENANCE TAB CONTENT */}
                {activeTab === 'maintenance' && (
                    <div className="space-y-6">
                        <section className="card bg-white border-none shadow-xl p-10 overflow-hidden relative">
                            <div className="flex items-center justify-between mb-12">
                                <div>
                                    <h2 className="text-2xl font-black text-charcoal-900 uppercase tracking-tighter">System Reclamation HUD</h2>
                                    <p className="text-[10px] font-bold text-charcoal-400 uppercase tracking-widest mt-1">Orphaned storage identification and mass purge protocol</p>
                                </div>
                                <button
                                    onClick={handlePurgeStorage}
                                    disabled={maintenanceQueue.length === 0}
                                    className="px-8 py-3.5 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-700 shadow-xl shadow-red-200 transition-all flex items-center gap-3 disabled:opacity-30 disabled:grayscale"
                                >
                                    <span>☢️</span> Purge Orphaned Assets
                                </button>
                            </div>

                            {maintenanceQueue.length === 0 ? (
                                <div className="py-32 flex flex-col items-center justify-center text-center">
                                    <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-4xl mb-6 border border-emerald-100 shadow-inner">🟢</div>
                                    <h3 className="text-sm font-black text-charcoal-900 uppercase tracking-[0.2em]">Storage Optimized</h3>
                                    <p className="text-[10px] text-charcoal-400 font-bold uppercase tracking-widest mt-2 max-w-xs">No orphaned image assets detected in the deletion queue.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-[10px] font-black text-charcoal-400 uppercase tracking-[0.2em] border-b border-charcoal-50">
                                                <th className="pb-4 pl-4">Asset Type</th>
                                                <th className="pb-4">Source Path</th>
                                                <th className="pb-4">Bucket</th>
                                                <th className="pb-4 text-right pr-4">Identified On</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-charcoal-50">
                                            {maintenanceQueue.map(item => (
                                                <tr key={item.id} className="group hover:bg-charcoal-50 transition-colors">
                                                    <td className="py-5 pl-4">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-lg">{item.bucket_name === 'assets' ? '💡' : '🏢'}</span>
                                                            <span className="text-[10px] font-black text-charcoal-900 uppercase">{item.bucket_name === 'assets' ? 'Blueprint' : 'Franchise'} Image</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-5">
                                                        <span className="px-3 py-1 bg-charcoal-100 rounded text-[9px] font-mono font-bold text-charcoal-600 truncate max-w-xs block">
                                                            {item.file_path}
                                                        </span>
                                                    </td>
                                                    <td className="py-5">
                                                        <span className="text-[10px] font-black text-primary-600 bg-primary-50 px-2 py-1 rounded-md uppercase tracking-widest">{item.bucket_name}</span>
                                                    </td>
                                                    <td className="py-5 text-right pr-4">
                                                        <span className="text-[9px] font-black text-charcoal-400">{new Date(item.created_at).toLocaleString()}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-charcoal-900 rounded-[2rem] p-8 text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[40px] rounded-full -mr-16 -mt-16 group-hover:bg-white/10 transition-all duration-700" />
                                <h4 className="text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mb-4">Total Debt Clearance</h4>
                                <div className="text-4xl font-black mb-2">{maintenanceQueue.length} <span className="text-white/30">Assets</span></div>
                                <p className="text-[11px] text-white/50 leading-relaxed font-medium">Accumulated orphaned files awaiting hard-deletion from Supabase storage clusters.</p>
                            </div>
                            <div className="bg-white rounded-[2rem] p-8 border border-charcoal-100 shadow-xl group">
                                <h4 className="text-[10px] font-black text-charcoal-400 uppercase tracking-[0.3em] mb-4">Storage Integrity</h4>
                                <div className="text-4xl font-black text-charcoal-900 mb-2">99.9%</div>
                                <p className="text-[11px] text-charcoal-500 leading-relaxed font-medium">Current database-to-storage synchronization status. Automated triggers are operational.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmConfig.onConfirm}
                title={confirmConfig.title}
                message={confirmConfig.message}
                type={confirmConfig.type}
            />
            <AdminActionModal
                isOpen={actionConfig.isOpen}
                onClose={() => setActionConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={actionConfig.onConfirm}
                title={actionConfig.title}
                message={actionConfig.message}
                inputType={actionConfig.inputType}
                confirmText={actionConfig.confirmText}
            />
            <DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmPermanentDelete}
                itemType={deleteModal.itemTitle}
                title="Confirm Permanent Deletion"
            />
            <CategoryModal
                isOpen={categoryModal.isOpen}
                onClose={() => setCategoryModal({ isOpen: false, category: null })}
                onConfirm={handleSaveCategory}
                category={categoryModal.category}
            />
        </div>
    );
}
