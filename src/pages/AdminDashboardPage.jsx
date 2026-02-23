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

// Modular Admin Components
import AdminHeader from '../components/admin/AdminHeader';
import AdminTabs from '../components/admin/AdminTabs';
import SearchBar from '../components/admin/SearchBar';
import PaginationControls from '../components/admin/PaginationControls';
import BulkActionsBar from '../components/admin/BulkActionsBar';
import AssetGridSector from '../components/admin/AssetGridSector';
import VerificationSector from '../components/admin/VerificationSector';
import UserSector from '../components/admin/UserSector';
import CategorySector from '../components/admin/CategorySector';
import LogSector from '../components/admin/LogSector';
import StatsSector from '../components/admin/StatsSector';
import MaintenanceSector from '../components/admin/MaintenanceSector';

/**
 * AdminDashboardPage: The main management dashboard for the Silent Money platform.
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
    const [selectedLog, setSelectedLog] = useState(null);
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
     */
    async function fetchAll() {
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
            const fetchAdminLogs = async () => {
                try {
                    const { data, error } = await supabase
                        .from('admin_logs')
                        .select('*, profiles:admin_id(full_name)')
                        .order('created_at', { ascending: false })
                        .limit(50);

                    if (error) {
                        const { data: simpleData } = await supabase
                            .from('admin_logs')
                            .select('*')
                            .order('created_at', { ascending: false })
                            .limit(50);
                        return simpleData || [];
                    }
                    return data || [];
                } catch (e) {
                    return [];
                }
            };

            const fetchAssetLogs = async () => {
                try {
                    const { data, error } = await supabase
                        .from('asset_audit_logs')
                        .select('*, profiles:modified_by(full_name)')
                        .order('created_at', { ascending: false })
                        .limit(50);

                    if (error) {
                        const { data: simpleData } = await supabase
                            .from('asset_audit_logs')
                            .select('*')
                            .order('created_at', { ascending: false })
                            .limit(50);
                        return simpleData || [];
                    }
                    return data || [];
                } catch (e) {
                    return [];
                }
            };

            const [aLogs, astLogs, categoriesRes, usersRes, maintenanceRes] = await Promise.all([
                fetchAdminLogs(),
                fetchAssetLogs(),
                supabase.from('categories').select('*').order('display_order', { ascending: true }),
                supabase.from('profiles').select('*').order('created_at', { ascending: false }),
                supabase.from('storage_deletion_queue').select('*').order('created_at', { ascending: false })
            ]);

            // Normalize and combine logs
            const normalizedAdminLogs = aLogs.map(log => ({
                id: `admin-${log.id}`,
                action_type: log.action_type || 'system_action',
                target_type: log.target_type || 'system',
                target_id: log.target_id || '',
                created_at: log.created_at,
                profiles: log.profiles,
                details: log.details ? (typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details)) : null
            }));

            const normalizedAssetLogs = astLogs.map(log => ({
                id: `asset-${log.id}`,
                action_type: log.action || 'asset_action',
                target_type: log.asset_type || 'asset',
                target_id: log.asset_id || '',
                created_at: log.created_at,
                profiles: log.profiles,
                details: log.feedback ? (typeof log.feedback === 'object' ? JSON.stringify(log.feedback) : String(log.feedback)) : null
            }));

            const combinedLogs = [...normalizedAdminLogs, ...normalizedAssetLogs]
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 100);

            setAdminLogs(combinedLogs);
            setAllCategories(categoriesRes.data || []);
            setAllUsers(usersRes.data || []);
            setMaintenanceQueue(maintenanceRes.data || []);

            return {
                logs: combinedLogs,
                categories: categoriesRes.data,
                users: usersRes.data,
                maintenance: maintenanceRes.data
            };
        };

        const [ideas, franchises, audits, meta] = await Promise.all([
            fetchIdeas(),
            fetchFranchises(),
            fetchAudits(),
            fetchMetaData(),
            fetchApproved(),
            fetchArchived()
        ]);

        setStats({
            ideas: (ideas || []).length,
            franchises: (franchises || []).length,
            audits: (audits || []).filter(a => a.status === 'pending').length,
            users: (meta?.users || []).length,
            categories: (meta?.categories || []).length
        });

        setLoading(false);
    }

    useEffect(() => {
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

            const userSub = supabase
                .channel('admin-users')
                .on('postgres_changes', {
                    event: 'UPDATE',
                    table: 'profiles',
                    schema: 'public'
                }, (payload) => {
                    const updatedUser = payload.new;
                    setAllUsers(prev => prev.map(u =>
                        u.id === updatedUser.id ? { ...u, ...updatedUser } : u
                    ));

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
    }, [profile, navigate, searchQuery]);

    useEffect(() => {
        const fetchPaginatedData = async () => {
            if (!profile?.is_admin) return;
            setPageLoading(true);
            try {
                const searchStr = searchQuery ? `%${searchQuery}%` : null;

                let iQuery = supabase
                    .from('income_ideas')
                    .select('*, profiles(full_name)')
                    .eq('is_approved', true)
                    .is('deleted_at', null)
                    .order('created_at', { ascending: false });

                let fQuery = supabase
                    .from('franchises')
                    .select('*, profiles(full_name)')
                    .eq('is_approved', true)
                    .is('deleted_at', null)
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

    const handleSaveCategory = async (formData) => {
        const isEditing = categoryModal.category !== null;
        let error;
        if (isEditing) {
            const { error: err } = await supabase.from('categories').update(formData).eq('id', categoryModal.category.id);
            error = err;
        } else {
            const { error: err } = await supabase.from('categories').insert([formData]);
            error = err;
        }

        if (!error) {
            toast.success(`Category ${isEditing ? 'updated' : 'created'} successfully`);
            const { data } = await supabase.from('categories').select('*').order('display_order', { ascending: true });
            setAllCategories(data || []);
        } else {
            toast.error('Operation failed: ' + error.message);
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
            message: "Are you sure you want to restore access for this user?",
            type: "success",
            confirmText: "Unban User",
            onConfirm: async () => {
                const { error } = await supabase.from('profiles').update({ is_banned: false }).eq('id', userId);
                if (!error) {
                    toast.success('User access has been restored.');
                    await supabase.from('admin_logs').insert([{
                        admin_id: user.id,
                        action_type: 'unban',
                        target_type: 'user',
                        target_id: userId,
                        details: { reason: 'Restored Access' }
                    }]);
                    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, is_banned: false } : u));
                } else {
                    toast.error('Restore failed: ' + error.message);
                }
            }
        });
    };

    const handleBanUser = (userId) => {
        const targetUser = allUsers.find(u => u.id === userId);
        const isTargetAdmin = targetUser?.is_admin;

        setConfirmConfig({
            isOpen: true,
            title: "Ban User?",
            message: isTargetAdmin ? "⚠️ This user is an admin. Banning will remove admin access." : "Are you sure you want to ban this user?",
            type: "danger",
            confirmText: "Ban User",
            onConfirm: async () => {
                const updateData = isTargetAdmin ? { is_banned: true, is_admin: false } : { is_banned: true };
                const { error } = await supabase.from('profiles').update(updateData).eq('id', userId);
                if (!error) {
                    toast.success(isTargetAdmin ? 'User banned and admin revoked.' : 'User banned.');
                    await supabase.from('admin_logs').insert([{
                        admin_id: user.id,
                        action_type: 'ban',
                        target_type: 'user',
                        target_id: userId,
                        details: { reason: 'Blocked Access', admin_revoked: isTargetAdmin }
                    }]);
                    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, is_banned: true, is_admin: isTargetAdmin ? false : u.is_admin } : u));
                } else {
                    toast.error('Ban failed: ' + error.message);
                }
            }
        });
    };

    const handleToggleAdmin = (userId, currentAdminStatus, userName) => {
        if (userId === user.id && currentAdminStatus) {
            toast.error('⚠️ Security Error: You cannot revoke your own admin privileges.');
            return;
        }

        const action = currentAdminStatus ? 'Revoke' : 'Grant';
        const newStatus = !currentAdminStatus;

        setConfirmConfig({
            isOpen: true,
            title: `${action} Administrator Privileges?`,
            message: `Are you sure you want to ${action.toLowerCase()} privileges for ${userName || 'this user'}?`,
            type: currentAdminStatus ? "warning" : "success",
            confirmText: `${action} Admin Access`,
            onConfirm: async () => {
                const updateData = newStatus ? { is_admin: true, role: 'admin' } : { is_admin: false, role: 'user' };
                const { error } = await supabase.from('profiles').update(updateData).eq('id', userId);
                if (!error) {
                    toast.success(`${action} successful.`);
                    await supabase.from('admin_logs').insert([{
                        admin_id: user.id,
                        action_type: newStatus ? 'grant_admin' : 'revoke_admin',
                        target_type: 'user',
                        target_id: userId,
                        details: { action: `${action} Admin Privileges`, target_user: userName || 'Unknown User' }
                    }]);
                    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, is_admin: newStatus, role: newStatus ? 'admin' : 'user' } : u));
                } else {
                    toast.error(`Failed to ${action.toLowerCase()} privileges: ` + error.message);
                }
            }
        });
    };

    const handlePermanentDelete = (id, type, title) => {
        setDeleteModal({ isOpen: true, id, type, itemTitle: title || (type === 'idea' ? 'Idea' : 'Franchise') });
    };

    const confirmPermanentDelete = async () => {
        const { id, type } = deleteModal;
        const table = type === 'idea' ? 'income_ideas' : 'franchises';
        const { error, data } = await supabase.from(table).delete().eq('id', id).select();

        if (!error && data?.length > 0) {
            toast.success(`Deleted permanently`);
            await supabase.from('admin_logs').insert([{
                admin_id: user.id,
                action_type: 'permanent_delete',
                target_type: type,
                target_id: id,
                details: { warning: 'PERMANENT_DELETION' }
            }]);
            fetchAll();
        } else {
            toast.error('Delete failed: ' + (error?.message || 'Permission denied'));
        }
    };

    const handleToggleFeatured = async (id, type, currentStatus) => {
        const table = type === 'idea' ? 'income_ideas' : 'franchises';
        const { error } = await supabase.from(table).update({ is_featured: !currentStatus }).eq('id', id);
        if (!error) {
            toast.success(`Item ${!currentStatus ? 'featured' : 'unfeatured'}`);
            fetchAll();
            await supabase.from('admin_logs').insert([{ admin_id: user.id, action_type: !currentStatus ? 'feature' : 'unfeature', target_type: type, target_id: id }]);
        } else {
            toast.error('Failed to update featured status');
        }
    };

    const handleBulkApprove = async () => {
        const { ideas, franchises } = selectedItems;
        for (const id of ideas) await handleApprove(id, 'idea');
        for (const id of franchises) await handleApprove(id, 'franchise');
        setSelectedItems({ ideas: [], franchises: [] });
        toast.success(`Bulk approved ${ideas.length + franchises.length} items`);
    };

    const handleBulkArchive = () => {
        const { ideas, franchises } = selectedItems;
        setConfirmConfig({
            isOpen: true,
            title: "Archive Selected Items?",
            message: `Archive ${ideas.length + franchises.length} items?`,
            type: "danger",
            confirmText: "Archive All",
            onConfirm: async () => {
                for (const id of ideas) await supabase.from('income_ideas').update({ deleted_at: new Date() }).eq('id', id);
                for (const id of franchises) await supabase.from('franchises').update({ deleted_at: new Date() }).eq('id', id);
                setSelectedItems({ ideas: [], franchises: [] });
                toast.success('Bulk archive completed');
                fetchAll();
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
        } catch (err) { console.warn('Audit logging skipped:', err.message); }
    };

    const handleUnarchive = (id, type) => {
        setConfirmConfig({
            isOpen: true,
            title: `Restore?`,
            message: `Restore this ${type}?`,
            type: "success",
            confirmText: "Restore Asset",
            onConfirm: async () => {
                const table = type === 'idea' ? 'income_ideas' : 'franchises';
                const { error } = await supabase.from(table).update({ deleted_at: null }).eq('id', id);
                if (!error) {
                    await logAssetAction(id, type, 'RESTORE', 'deleted', 'active', 'Restored from Archive');
                    toast.success('Asset restored');
                    fetchAll();
                } else {
                    toast.error('Restore failed: ' + error.message);
                }
            }
        });
    };

    const handleDelete = (id, type) => {
        setConfirmConfig({
            isOpen: true,
            title: `Archive?`,
            message: `Archive this ${type}?`,
            onConfirm: async () => {
                const table = type === 'idea' ? 'income_ideas' : 'franchises';
                const { error } = await supabase.from(table).update({ deleted_at: new Date() }).eq('id', id);
                if (!error) {
                    await logAssetAction(id, type, 'DECOMMISSION', 'active', 'deleted', 'Archived');
                    toast.success('Asset archived');
                    fetchAll();
                } else {
                    toast.error('Archive failed: ' + error.message);
                }
            },
            type: 'danger'
        });
    };

    const handleRequestRevision = (id, type) => {
        setActionConfig({
            isOpen: true,
            title: 'Request Revision',
            message: `Enter revision details for this ${type}.`,
            onConfirm: async (feedback) => {
                const table = type === 'idea' ? 'income_ideas' : 'franchises';
                const { error } = await supabase.from(table).update({ status: 'revision', admin_feedback: feedback }).eq('id', id);
                if (!error) {
                    toast.success('Revision request sent.');
                    await logAssetAction(id, type, 'REVISION_REQUEST', 'pending', 'revision', feedback);
                    fetchAll();
                } else {
                    toast.error('Failed: ' + error.message);
                }
            }
        });
    };

    const handleApprove = async (id, type) => {
        const table = type === 'idea' ? 'income_ideas' : 'franchises';
        const { error } = await supabase.from(table).update({ is_approved: true }).eq('id', id);
        if (!error) {
            await logAssetAction(id, type, 'AUTHORIZATION', 'pending', 'approved');
            toast.success('Approved successfully');
            fetchAll();
        } else {
            toast.error('Approval failed: ' + error.message);
        }
    };

    const handleUpdateAuditStatus = async (id, status) => {
        if (status === 'completed') {
            setActionConfig({
                isOpen: true,
                title: 'Finalize Verification',
                message: 'Provide summary and report link.',
                inputType: 'audit',
                onConfirm: async (feedback, reportUrl) => {
                    executeAuditUpdate(id, status, feedback, reportUrl);
                }
            });
        } else {
            executeAuditUpdate(id, status, status === 'in-review' ? 'Under review.' : '', '');
        }
    };

    const executeAuditUpdate = async (id, status, feedback, reportUrl) => {
        const { error } = await supabase.from('expert_audit_requests').update({ status, admin_feedback: feedback, report_url: reportUrl, updated_at: new Date() }).eq('id', id);
        if (!error) {
            toast.success(`Updated to ${status}`);
            fetchAll();
        } else {
            toast.error('Failed: ' + error.message);
        }
    };

    const handlePurgeStorage = async () => {
        setConfirmConfig({
            isOpen: true,
            title: '☢️ PURGE STORAGE',
            message: `Delete ${maintenanceQueue.length} files?`,
            type: 'danger',
            onConfirm: async () => {
                for (const item of maintenanceQueue) {
                    const { error } = await supabase.storage.from(item.bucket_name).remove([item.file_path]);
                    if (!error) await supabase.from('storage_deletion_queue').delete().eq('id', item.id);
                }
                toast.success('Purge complete');
                setMaintenanceQueue([]);
            }
        });
    };

    const downloadUsersCSV = () => {
        const headers = ['ID', 'Full Name', 'Membership', 'Is Admin', 'Is Banned', 'Created At'];
        const rows = allUsers.map(u => [u.id, u.full_name || 'Anonymous', u.membership_tier || 'Basic', u.is_admin ? 'Yes' : 'No', u.is_banned ? 'Yes' : 'No', new Date(u.created_at).toLocaleString()]);
        const csvContent = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `silent_money_users_${new Date().toISOString().split('T')[0]}.csv`);
        link.click();
        toast.success('CSV Exported');
    };

    const growthMetrics = (() => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentUsers = allUsers.filter(u => new Date(u.created_at) > thirtyDaysAgo).length;
        const recentIdeas = allIdeas.filter(i => new Date(i.created_at) > thirtyDaysAgo).length;
        const recentFranchises = allFranchises.filter(f => new Date(f.created_at) > thirtyDaysAgo).length;
        return {
            userGrowth: allUsers.length > 0 ? ((recentUsers / Math.max(1, allUsers.length - recentUsers)) * 100).toFixed(1) : 0,
            assetGrowth: (stats.ideas + stats.franchises) > 0 ? (((recentIdeas + recentFranchises) / Math.max(1, (stats.ideas + stats.franchises) - (recentIdeas + recentFranchises))) * 100).toFixed(1) : 0,
            recentAssets: recentIdeas + recentFranchises
        };
    })();

    if (!profile?.is_admin) return null;

    return (
        <div className="min-h-screen bg-charcoal-50 pt-32 pb-20 px-4">
            <SEO title="Admin Dashboard | Silent Money" />

            <div className="max-w-7xl mx-auto">
                <AdminHeader loading={loading} pageLoading={pageLoading} onRefresh={fetchAll} />

                <AdminTabs
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    counts={{
                        pending: pendingIdeas.length + pendingFranchises.length,
                        history: approvedIdeas.length + approvedFranchises.length,
                        database: allIdeas.length + allFranchises.length,
                        archived: archivedIdeas.length + archivedFranchises.length,
                        audits: auditRequests.length,
                        users: allUsers.length,
                        categories: allCategories.length,
                        logs: adminLogs.length,
                        maintenance: maintenanceQueue.length
                    }}
                />

                <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
                    <SearchBar value={searchQuery} onChange={setSearchQuery} onClear={() => setSearchQuery('')} />
                    {activeTab === 'all' && (
                        <PaginationControls page={page} setPage={setPage} loading={pageLoading} hasNextPage={allIdeas.length >= ROWS_PER_PAGE || allFranchises.length >= ROWS_PER_PAGE} type="Data" />
                    )}
                </div>

                {activeTab === 'logs' && (
                    <LogSector logs={adminLogs} selectedLog={selectedLog} setSelectedLog={setSelectedLog} />
                )}

                {activeTab === 'audits' && (
                    <VerificationSector auditRequests={auditRequests} onUpdateStatus={handleUpdateAuditStatus} />
                )}

                {activeTab === 'pending' && (
                    <BulkActionsBar
                        selectedCount={selectedItems.ideas.length + selectedItems.franchises.length}
                        onApprove={handleBulkApprove}
                        onArchive={handleBulkArchive}
                        onClear={() => setSelectedItems({ ideas: [], franchises: [] })}
                    />
                )}

                {['pending', 'history', 'all', 'archived'].includes(activeTab) && (
                    <>
                        <AssetGridSector
                            activeTab={activeTab}
                            ideas={activeTab === 'pending' ? pendingIdeas : activeTab === 'history' ? approvedIdeas : activeTab === 'archived' ? archivedIdeas : allIdeas}
                            franchises={activeTab === 'pending' ? pendingFranchises : activeTab === 'history' ? approvedFranchises : activeTab === 'archived' ? archivedFranchises : allFranchises}
                            selectedItems={selectedItems}
                            setSelectedItems={setSelectedItems}
                            onApprove={handleApprove}
                            onRequestRevision={handleRequestRevision}
                            onToggleFeatured={handleToggleFeatured}
                            onDelete={handleDelete}
                            onUnarchive={handleUnarchive}
                            onPermanentDelete={handlePermanentDelete}
                            searchQuery={searchQuery}
                        />
                        {activeTab === 'all' && (
                            <PaginationControls page={page} setPage={setPage} pageLoading={pageLoading} hasNext={allIdeas.length >= ROWS_PER_PAGE || allFranchises.length >= ROWS_PER_PAGE} />
                        )}
                    </>
                )}

                {activeTab === 'users' && (
                    <UserSector
                        users={allUsers}
                        currentUser={user}
                        onToggleAdmin={handleToggleAdmin}
                        onBanUser={handleBanUser}
                        onUnbanUser={handleUnbanUser}
                        onDownloadCSV={downloadUsersCSV}
                    />
                )}

                {activeTab === 'categories' && (
                    <CategorySector
                        categories={allCategories}
                        onEditCategory={(cat) => setCategoryModal({ isOpen: true, category: cat })}
                        onDeleteCategory={handleDeleteCategory}
                        onAddCategory={() => setCategoryModal({ isOpen: true, category: null })}
                    />
                )}

                {activeTab === 'performance' && (
                    <StatsSector
                        users={allUsers}
                        stats={stats}
                        auditRequests={auditRequests}
                        categories={allCategories}
                        ideas={allIdeas}
                        franchises={allFranchises}
                        growthMetrics={growthMetrics}
                    />
                )}

                {activeTab === 'maintenance' && (
                    <MaintenanceSector
                        queue={maintenanceQueue}
                        onPurge={handlePurgeStorage}
                    />
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
