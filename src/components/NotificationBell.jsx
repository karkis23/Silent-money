import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function NotificationBell() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!user) return;

        const fetchNotifications = async () => {
            const { data } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10);

            if (data) {
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.is_read).length);
            }
        };

        fetchNotifications();

        // High-Precision Realtime Synchronization
        const channel = supabase
            .channel('notification-changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user.id}`
            },
                payload => {
                    if (payload.eventType === 'INSERT') {
                        setNotifications(prev => [payload.new, ...prev]);
                        if (!payload.new.is_read) setUnreadCount(count => count + 1);
                    } else if (payload.eventType === 'UPDATE') {
                        setNotifications(prev => prev.map(n => n.id === payload.new.id ? payload.new : n));
                        // Recalculate unread count
                        setUnreadCount(prev => payload.new.is_read ? Math.max(0, prev - 1) : prev + 1);
                    } else if (payload.eventType === 'DELETE') {
                        setNotifications(prev => {
                            const target = prev.find(n => n.id === payload.old.id);
                            if (target && !target.is_read) setUnreadCount(c => Math.max(0, c - 1));
                            return prev.filter(n => n.id !== payload.old.id);
                        });
                    }
                })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [user]);

    const markAsRead = async (id) => {
        await supabase.from('notifications').update({ is_read: true }).eq('id', id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const deleteNotification = async (id, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        const { error } = await supabase.from('notifications').delete().eq('id', id);
        if (!error) {
            const deletedNotification = notifications.find(n => n.id === id);
            if (deletedNotification && !deletedNotification.is_read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
            setNotifications(prev => prev.filter(n => n.id !== id));
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl border border-charcoal-100 hover:bg-charcoal-50 transition-all text-charcoal-400 hover:text-charcoal-900"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-600 rounded-full border border-white" />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-charcoal-100 z-50 overflow-hidden"
                        >
                            <div className="p-4 border-b border-charcoal-50 flex justify-between items-center bg-charcoal-50/50">
                                <h3 className="text-[10px] font-black text-charcoal-900 uppercase tracking-widest">Notifications</h3>
                                <div className="flex items-center gap-3">
                                    {unreadCount > 0 && (
                                        <span className="text-[9px] font-black text-primary-600 uppercase tracking-widest">{unreadCount} New</span>
                                    )}
                                    {notifications.length > 0 && (
                                        <button
                                            onClick={async () => {
                                                const { error } = await supabase.from('notifications').delete().eq('user_id', user.id);
                                                if (!error) {
                                                    setNotifications([]);
                                                    setUnreadCount(0);
                                                }
                                            }}
                                            className="text-[9px] font-black text-red-500 uppercase tracking-widest hover:underline"
                                        >
                                            Clear All
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="max-h-[360px] overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <div className="text-2xl mb-2">🎈</div>
                                        <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest">Inbox Zero</div>
                                    </div>
                                ) : (
                                    notifications.map(n => (
                                        <div key={n.id} className="relative group border-b border-charcoal-50 last:border-0">
                                            <Link
                                                to={n.link || '#'}
                                                onClick={() => {
                                                    markAsRead(n.id);
                                                    setIsOpen(false);
                                                }}
                                                className={`block p-4 hover:bg-cream-50 transition-all ${!n.is_read ? 'bg-primary-50/30' : ''}`}
                                            >
                                                <div className="text-xs font-black text-charcoal-900 mb-1 pr-6">{n.title}</div>
                                                <div className="text-[11px] font-medium text-charcoal-500 leading-tight mb-2 pr-6">{n.message}</div>
                                                <div className="text-[8px] font-black text-charcoal-400 uppercase tracking-widest">
                                                    {new Date(n.created_at).toLocaleDateString()}
                                                </div>
                                            </Link>
                                            <button
                                                onClick={(e) => deleteNotification(n.id, e)}
                                                className="absolute top-4 right-4 p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-charcoal-300 hover:text-red-500 transition-all z-10"
                                                title="Delete notification"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            {notifications.length > 0 && (
                                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block p-3 text-center text-[9px] font-black text-charcoal-400 hover:text-primary-600 transition-colors uppercase tracking-[0.2em] border-t border-charcoal-50 bg-charcoal-50/20">
                                    View Command Center
                                </Link>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
