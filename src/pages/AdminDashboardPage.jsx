import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/SEO';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import AdminActionModal from '../components/AdminActionModal';

/**
 * Admin Moderation Terminal (Operational Console)
 * 
 * STRATEGIC SECTORS:
 * 1. Live Moderation: Pending community content approval.
 * 2. History: Recently authorized and live assets.
 * 3. Expert Audits: Institutional due-diligence queue.
 * 4. User Registry: Authorized member monitoring.
 */
export default function AdminDashboardPage() {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const [pendingIdeas, setPendingIdeas] = useState([]);
    const [pendingFranchises, setPendingFranchises] = useState([]);
    const [approvedIdeas, setApprovedIdeas] = useState([]);
    const [approvedFranchises, setApprovedFranchises] = useState([]);
    const [allIdeas, setAllIdeas] = useState([]);
    const [allFranchises, setAllFranchises] = useState([]);
    const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'history', 'all'
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ ideas: 0, franchises: 0, audits: 0, users: 0 });
    const [auditRequests, setAuditRequests] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const location = useLocation();

    // Confirm Modal State
    const [confirmConfig, setConfirmConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'danger'
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
        if (tab && ['pending', 'history', 'all', 'audits', 'users'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [location.search]);

    useEffect(() => {
        // Strict Admin Gate
        if (!loading && (!profile || !profile.is_admin)) {
            navigate('/dashboard');
            return;
        }
    }, [profile, loading, navigate]);

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);

            // Fetch Pending
            const { data: pIdeas } = await supabase
                .from('income_ideas')
                .select('*, profiles(full_name)')
                .eq('is_approved', false)
                .is('deleted_at', null)
                .order('created_at', { ascending: false });

            const { data: pFranchises } = await supabase
                .from('franchises')
                .select('*, profiles(full_name)')
                .eq('is_approved', false)
                .is('deleted_at', null)
                .order('created_at', { ascending: false });

            // Fetch Approved (History)
            const { data: aIdeas } = await supabase
                .from('income_ideas')
                .select('*, profiles(full_name)')
                .eq('is_approved', true)
                .is('deleted_at', null)
                .order('updated_at', { ascending: false })
                .limit(20);

            const { data: aFranchises } = await supabase
                .from('franchises')
                .select('*, profiles(full_name)')
                .eq('is_approved', true)
                .is('deleted_at', null)
                .order('updated_at', { ascending: false })
                .limit(20);

            // Fetch All Assets
            const { data: fullIdeas } = await supabase
                .from('income_ideas')
                .select('*, profiles(full_name)')
                .order('created_at', { ascending: false });

            const { data: fullFranchises } = await supabase
                .from('franchises')
                .select('*, profiles(full_name)')
                .order('created_at', { ascending: false });

            // Fetch Expert Audits - Wrapped in try/catch to prevent total UI failure on join issues
            let audits = [];
            try {
                const { data: auditData, error: auditError } = await supabase
                    .from('expert_audit_requests')
                    .select('*, profiles(full_name)')
                    .order('created_at', { ascending: false });

                if (auditError) {
                    console.error('Audit fetch error (with join):', auditError);
                    // Fallback to simple fetch if join fails
                    const { data: simpleAudits } = await supabase
                        .from('expert_audit_requests')
                        .select('*')
                        .order('created_at', { ascending: false });
                    audits = simpleAudits || [];
                } else {
                    audits = auditData || [];
                }
            } catch (err) {
                console.error('Audit fetch crash:', err);
            }

            // Fetch All Users
            const { data: usersData } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            setPendingIdeas(pIdeas || []);
            setPendingFranchises(pFranchises || []);
            setApprovedIdeas(aIdeas || []);
            setApprovedFranchises(aFranchises || []);
            setAllIdeas(fullIdeas || []);
            setAllFranchises(fullFranchises || []);
            setAuditRequests(audits);
            setAllUsers(usersData || []);

            setStats({
                ideas: (pIdeas || []).length,
                franchises: (pFranchises || []).length,
                audits: (audits || []).filter(a => a.status === 'pending').length,
                users: (usersData || []).length
            });
            setLoading(false);
        };

        if (profile?.is_admin) {
            fetchAll();

            // Real-time Subscriptions for Admins
            const auditSub = supabase
                .channel('admin-audits')
                .on('postgres_changes', { event: 'INSERT', table: 'expert_audit_requests', schema: 'public' }, (payload) => {
                    toast.success(`🚀 NEW AUDIT: ${payload.new.brand_name}`, {
                        icon: '📋',
                        style: { background: '#2563eb', color: '#fff' }
                    });
                    fetchAll(); // Refresh to get profile joins
                })
                .subscribe();

            const ideaSub = supabase
                .channel('admin-ideas')
                .on('postgres_changes', { event: 'INSERT', table: 'income_ideas', schema: 'public' }, (payload) => {
                    toast.success(`💡 NEW IDEA: ${payload.new.title}`, {
                        icon: '✨',
                    });
                    fetchAll();
                })
                .subscribe();

            const franchiseSub = supabase
                .channel('admin-franchises')
                .on('postgres_changes', { event: 'INSERT', table: 'franchises', schema: 'public' }, (payload) => {
                    toast.success(`🏢 NEW BRAND: ${payload.new.name}`, {
                        icon: '🏢',
                    });
                    fetchAll();
                })
                .subscribe();

            return () => {
                supabase.removeChannel(auditSub);
                supabase.removeChannel(ideaSub);
                supabase.removeChannel(franchiseSub);
            };
        }
    }, [profile, navigate]);

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
            title: 'Request Strategic Revision',
            message: `Enter the specific operational details required to bring this ${type === 'idea' ? 'blueprint' : 'brand'} up to institutional standards.`,
            inputType: 'text',
            confirmText: 'Transmit Revision Request',
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
                setPendingIdeas(prev => prev.filter(i => i.id !== id));
                if (approvedItem) setApprovedIdeas(prev => [{ ...approvedItem, is_approved: true, status: 'approved' }, ...prev]);
            } else {
                const approvedItem = pendingFranchises.find(f => f.id === id);
                setPendingFranchises(prev => prev.filter(f => f.id !== id));
                if (approvedItem) setApprovedFranchises(prev => [{ ...approvedItem, is_approved: true, status: 'approved' }, ...prev]);
            }
        }
    };

    const handleUpdateAuditStatus = (id, status) => {
        if (status === 'completed') {
            setActionConfig({
                isOpen: true,
                title: 'Finalize Expert Audit',
                message: 'Provide a comprehensive expert assessment and link to the institutional due-diligence report.',
                inputType: 'audit',
                confirmText: 'Authorize & Send Report',
                onConfirm: async (feedback, reportUrl) => {
                    executeAuditUpdate(id, status, feedback, reportUrl);
                }
            });
        } else {
            const feedback = status === 'in-review' ? 'Your audit request is currently being analyzed by our expert panel.' : '';
            executeAuditUpdate(id, status, feedback, '');
        }
    };

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
                    title: status === 'completed' ? 'Expert Audit Complete 🚀' : 'Audit In-Review 🔍',
                    message: status === 'completed'
                        ? `Expert analysis for "${audit.brand_name}" is ready: ${feedback.slice(0, 50)}...`
                        : `Your audit for "${audit.brand_name}" has moved to In-Review status.`,
                    type: 'system',
                    link: '/dashboard'
                }]);
            }

            toast.success(`Audit status updated to ${status.toUpperCase()}`);
            setAuditRequests(prev => prev.map(a => a.id === id ? { ...a, status, admin_feedback: feedback, report_url: reportUrl } : a));
            setStats(prev => ({
                ...prev,
                audits: status === 'pending' ? prev.audits : Math.max(0, prev.audits - (status === 'in-review' ? 0 : 1))
            }));
        } else {
            toast.error('Update failed: ' + error.message);
        }
    };

    if (!profile?.is_admin) return null;

    return (
        <div className="min-h-screen bg-charcoal-50 pt-32 pb-20 px-4">
            <SEO title="Admin Moderation Terminal | Silent Money" />

            <div className="max-w-7xl mx-auto">
                <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <div className="text-[10px] font-black text-primary-600 uppercase tracking-[0.3em] mb-2">Control Center</div>
                        <h1 className="text-4xl font-black text-charcoal-900 tracking-tighter">Moderation <span className="text-charcoal-400">Terminal</span></h1>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
                        {/* Tab Switcher */}
                        <div className="flex bg-white p-1.5 rounded-2xl border border-charcoal-100 shadow-sm w-full md:w-auto">
                            <button
                                onClick={() => setActiveTab('pending')}
                                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all gap-3 flex items-center ${activeTab === 'pending' ? 'bg-charcoal-900 text-white shadow-lg shadow-charcoal-200' : 'text-charcoal-400 hover:text-charcoal-600'}`}
                            >
                                <span className="opacity-70">Live Moderation</span>
                                <div className="flex gap-1.5">
                                    <span className={`px-1.5 py-0.5 rounded-md text-[8px] flex items-center gap-1 ${activeTab === 'pending' ? 'bg-white/20 text-white' : 'bg-charcoal-100 text-charcoal-400'}`}>
                                        💡 {pendingIdeas.length}
                                    </span>
                                    <span className={`px-1.5 py-0.5 rounded-md text-[8px] flex items-center gap-1 ${activeTab === 'pending' ? 'bg-white/20 text-white' : 'bg-charcoal-100 text-charcoal-400'}`}>
                                        🏢 {pendingFranchises.length}
                                    </span>
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all gap-3 flex items-center ${activeTab === 'history' ? 'bg-charcoal-900 text-white shadow-lg shadow-charcoal-200' : 'text-charcoal-400 hover:text-charcoal-600'}`}
                            >
                                <span className="opacity-70">History</span>
                                <div className="flex gap-1.5">
                                    <span className={`px-1.5 py-0.5 rounded-md text-[8px] flex items-center gap-1 ${activeTab === 'history' ? 'bg-white/20 text-white' : 'bg-charcoal-100 text-charcoal-400'}`}>
                                        💡 {approvedIdeas.length}
                                    </span>
                                    <span className={`px-1.5 py-0.5 rounded-md text-[8px] flex items-center gap-1 ${activeTab === 'history' ? 'bg-white/20 text-white' : 'bg-charcoal-100 text-charcoal-400'}`}>
                                        🏢 {approvedFranchises.length}
                                    </span>
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all gap-3 flex items-center ${activeTab === 'all' ? 'bg-charcoal-900 text-white shadow-lg shadow-charcoal-200' : 'text-charcoal-400 hover:text-charcoal-600'}`}
                            >
                                <span className="opacity-70">Database</span>
                                <div className="flex gap-1.5">
                                    <span className={`px-1.5 py-0.5 rounded-md text-[8px] flex items-center gap-1 ${activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-charcoal-100 text-charcoal-400'}`}>
                                        💡 {allIdeas.length}
                                    </span>
                                    <span className={`px-1.5 py-0.5 rounded-md text-[8px] flex items-center gap-1 ${activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-charcoal-100 text-charcoal-400'}`}>
                                        🏢 {allFranchises.length}
                                    </span>
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('audits')}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all gap-2 flex items-center ${activeTab === 'audits' ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'text-charcoal-400 hover:text-charcoal-600'}`}
                            >
                                Audit Requests
                                <span className={`px-1.5 py-0.5 rounded-md text-[8px] ${activeTab === 'audits' ? 'bg-white/20 text-white' : 'bg-primary-50 text-primary-600'}`}>
                                    {auditRequests.length}
                                </span>
                            </button>
                            <button
                                onClick={() => setActiveTab('users')}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all gap-2 flex items-center ${activeTab === 'users' ? 'bg-charcoal-900 text-white shadow-lg' : 'text-charcoal-400 hover:text-charcoal-600'}`}
                            >
                                Verified Members
                                <span className={`px-1.5 py-0.5 rounded-md text-[8px] ${activeTab === 'users' ? 'bg-white/20 text-white' : 'bg-charcoal-100 text-charcoal-400'}`}>
                                    {allUsers.length}
                                </span>
                            </button>
                        </div>

                        <div className="flex gap-4">
                            <div className="p-4 bg-white rounded-2xl border border-charcoal-100 shadow-sm min-w-[100px]">
                                <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest mb-1">Queue</div>
                                <div className="text-2xl font-black text-charcoal-900">{stats.ideas + stats.franchises}</div>
                            </div>
                            <div className="p-4 bg-primary-600 rounded-2xl shadow-lg shadow-primary-200 min-w-[100px]">
                                <div className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Audits</div>
                                <div className="text-2xl font-black text-white">{stats.audits}</div>
                            </div>
                            <div className="p-4 bg-white rounded-2xl border border-charcoal-100 shadow-sm min-w-[100px]">
                                <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest mb-1">Users</div>
                                <div className="text-2xl font-black text-charcoal-900">{stats.users}</div>
                            </div>
                        </div>
                    </div>
                </header>

                {activeTab === 'audits' ? (
                    <div className="mt-8">
                        <section className="card bg-white border-none shadow-xl p-8">
                            <div className="flex justify-between items-center mb-8 border-b border-charcoal-50 pb-4">
                                <h2 className="text-base font-black text-charcoal-900 uppercase tracking-widest flex items-center gap-3">
                                    <span>🔍</span> Expert Intel Queue
                                </h2>
                                <span className="text-[10px] font-black text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full uppercase tracking-widest">
                                    {auditRequests.length} Total Requests
                                </span>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {auditRequests.length === 0 ? (
                                    <div className="col-span-full py-20 text-center text-charcoal-400 font-medium italic">
                                        No expert audit requests received yet.
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
                ) : ['pending', 'history', 'all'].includes(activeTab) ? (
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Ideas Section */}
                        <section className="card bg-white border-none shadow-xl p-8 h-fit">
                            <div className="flex justify-between items-center mb-8 border-b border-charcoal-50 pb-4">
                                <h2 className="text-sm font-black text-charcoal-900 uppercase tracking-widest flex items-center gap-2">
                                    <span>💡</span> {activeTab === 'pending' ? 'Pending Blueprints' : activeTab === 'history' ? 'Recently Approved' : 'All Income Ideas'}
                                </h2>
                                <span className="text-[10px] font-black text-primary-600 bg-primary-50 px-3 py-1 rounded-full uppercase tracking-widest">
                                    {(activeTab === 'pending' ? pendingIdeas : activeTab === 'history' ? approvedIdeas : allIdeas).length} Items
                                </span>
                            </div>

                            <div className="space-y-6">
                                {(activeTab === 'pending' ? pendingIdeas : activeTab === 'history' ? approvedIdeas : allIdeas).length === 0 ? (
                                    <div className="py-12 text-center text-charcoal-400 font-medium italic">
                                        {activeTab === 'pending' ? 'No pending blueprints.' : 'No items found.'}
                                    </div>
                                ) : (
                                    (activeTab === 'pending' ? pendingIdeas : activeTab === 'history' ? approvedIdeas : allIdeas).map(idea => (
                                        <div key={idea.id} className="p-6 bg-charcoal-50 rounded-2xl border border-charcoal-100 group hover:border-primary-200 transition-all">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex-1 pr-4">
                                                    <h3 className="text-lg font-black text-charcoal-950 uppercase tracking-tight leading-tight mb-1">{idea.title}</h3>
                                                    <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest flex items-center gap-2">
                                                        <span>By {idea.profiles?.full_name || 'Anonymous Author'}</span>
                                                        {idea.is_approved ? (
                                                            <span className="text-emerald-500">● LIVE</span>
                                                        ) : (
                                                            <span className="text-amber-500">● PENDING</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    {activeTab === 'pending' && (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleApprove(idea.id, 'idea')}
                                                                className="px-4 py-2 bg-charcoal-950 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleRequestRevision(idea.id, 'idea')}
                                                                className="px-4 py-2 bg-amber-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all"
                                                            >
                                                                Revision
                                                            </button>
                                                        </div>
                                                    )}
                                                    <Link
                                                        to={`/edit-idea/${idea.id}`}
                                                        className="px-4 py-2 bg-white text-primary-600 border border-primary-100 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary-600 hover:text-white transition-all text-center"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(idea.id, 'idea')}
                                                        className="px-4 py-2 bg-white text-red-500 border border-red-100 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-charcoal-100/50">
                                                <p className="text-sm text-charcoal-500 line-clamp-1 leading-relaxed font-medium">
                                                    {idea.short_description}
                                                </p>
                                                {idea.proof_url && (
                                                    <a href={idea.proof_url} target="_blank" rel="noreferrer" className="text-[9px] font-black text-primary-600 uppercase tracking-widest hover:underline flex items-center gap-1 shrink-0 ml-4">
                                                        <span>📎</span> View Proof
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>

                        {/* Franchises Section */}
                        <section className="card bg-white border-none shadow-xl p-8 h-fit">
                            <div className="flex justify-between items-center mb-8 border-b border-charcoal-50 pb-4">
                                <h2 className="text-sm font-black text-charcoal-900 uppercase tracking-widest flex items-center gap-2">
                                    <span>🏢</span> {activeTab === 'pending' ? 'Franchise Queue' : activeTab === 'history' ? 'Verified Opportunities' : 'All Franchises'}
                                </h2>
                                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">
                                    {(activeTab === 'pending' ? pendingFranchises : activeTab === 'history' ? approvedFranchises : allFranchises).length} Items
                                </span>
                            </div>

                            <div className="space-y-6">
                                {(activeTab === 'pending' ? pendingFranchises : activeTab === 'history' ? approvedFranchises : allFranchises).length === 0 ? (
                                    <div className="py-12 text-center text-charcoal-400 font-medium italic">
                                        {activeTab === 'pending' ? 'No pending franchises.' : 'No items found.'}
                                    </div>
                                ) : (
                                    (activeTab === 'pending' ? pendingFranchises : activeTab === 'history' ? approvedFranchises : allFranchises).map(fran => (
                                        <div key={fran.id} className="p-6 bg-charcoal-50 rounded-2xl border border-charcoal-100 group hover:border-emerald-200 transition-all">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex-1 pr-4">
                                                    <h3 className="text-lg font-black text-charcoal-950 uppercase tracking-tight leading-tight mb-1">{fran.name}</h3>
                                                    <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest flex items-center gap-2">
                                                        <span>By {fran.profiles?.full_name || 'Anonymous Author'}</span>
                                                        {fran.is_approved ? (
                                                            <span className="text-emerald-500">● VERIFIED</span>
                                                        ) : (
                                                            <span className="text-amber-500">● PENDING</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    {activeTab === 'pending' && (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleApprove(fran.id, 'franchise')}
                                                                className="px-4 py-2 bg-charcoal-950 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleRequestRevision(fran.id, 'franchise')}
                                                                className="px-4 py-2 bg-amber-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all"
                                                            >
                                                                Revision
                                                            </button>
                                                        </div>
                                                    )}
                                                    <Link
                                                        to={`/edit-franchise/${fran.id}`}
                                                        className="px-4 py-2 bg-white text-primary-600 border border-primary-100 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary-600 hover:text-white transition-all text-center"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(fran.id, 'franchise')}
                                                        className="px-4 py-2 bg-white text-red-500 border border-red-100 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-charcoal-100/50">
                                                <div className="flex gap-2">
                                                    <span className="text-[10px] font-black text-charcoal-400 bg-white border border-charcoal-100 px-2.5 py-1 rounded-lg uppercase tracking-widest">
                                                        {fran.category}
                                                    </span>
                                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg uppercase tracking-widest">
                                                        ₹{(fran.investment_min / 100000).toFixed(1)}L Min
                                                    </span>
                                                </div>
                                                {fran.proof_url && (
                                                    <a href={fran.proof_url} target="_blank" rel="noreferrer" className="text-[9px] font-black text-primary-600 uppercase tracking-widest hover:underline flex items-center gap-1 shrink-0 ml-4">
                                                        <span>📎</span> View Proof
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>
                ) : null}

                {activeTab === 'users' && (
                    <div className="mt-8">
                        <section className="card bg-white border-none shadow-xl p-8">
                            <div className="flex justify-between items-center mb-10 border-b border-charcoal-50 pb-6">
                                <div>
                                    <h2 className="text-xl font-black text-charcoal-900 uppercase tracking-tighter flex items-center gap-3">
                                        <span>👤</span> Institutional User Registry
                                    </h2>
                                    <p className="text-[10px] text-charcoal-400 font-bold uppercase tracking-widest mt-1">Authorized platform members and expert panel</p>
                                </div>
                                <span className="text-[11px] font-black text-white bg-charcoal-900 px-4 py-2 rounded-xl uppercase tracking-[0.2em] shadow-lg shadow-charcoal-200">
                                    {allUsers.length} Active Profiles
                                </span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-[10px] font-black text-charcoal-400 uppercase tracking-[0.2em] border-b border-charcoal-50">
                                            <th className="pb-4 pl-4">Member Identity</th>
                                            <th className="pb-4 text-center">Role Status</th>
                                            <th className="pb-4 text-center">Authorized On</th>
                                            <th className="pb-4 text-right pr-4">Profile Hash</th>
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
                                                            <div className="text-sm font-black text-charcoal-900">{u.full_name || 'Anonymous Operator'}</div>
                                                            <div className="text-[10px] font-bold text-primary-600 uppercase tracking-widest">{u.membership_tier || 'Basic Tier'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-6 text-center">
                                                    <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${u.is_admin ? 'bg-charcoal-900 text-white' : 'bg-charcoal-100 text-charcoal-400'}`}>
                                                        {u.is_admin ? 'ADMINISTRATOR' : 'INVESTOR'}
                                                    </span>
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
        </div>
    );
}
