import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export default function GlobalSearch() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
            }
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (!query) {
            setResults([]);
            return;
        }

        const fetchResults = async () => {
            setLoading(true);

            try {
                // Try the RPC first, then fallback to direct queries
                const { data: rpcData, error: rpcError } = await supabase.rpc('search_knowledge', {
                    search_query: query
                });

                if (!rpcError && rpcData && rpcData.length > 0) {
                    setResults(rpcData.map(res => ({
                        ...res,
                        path: res.type === 'blueprint' ? `/ideas/${res.slug}` : `/franchise/${res.slug}`
                    })));
                    setLoading(false);
                    return;
                }

                // Fallback: Direct table search using ilike
                const searchPattern = `%${query}%`;

                const [ideasRes, franchisesRes] = await Promise.all([
                    supabase
                        .from('income_ideas')
                        .select('id, title, slug, short_description')
                        .eq('is_approved', true)
                        .is('deleted_at', null)
                        .or(`title.ilike.${searchPattern},short_description.ilike.${searchPattern}`)
                        .limit(10),
                    supabase
                        .from('franchises')
                        .select('id, name, slug, description')
                        .eq('is_approved', true)
                        .is('deleted_at', null)
                        .or(`name.ilike.${searchPattern},description.ilike.${searchPattern}`)
                        .limit(10)
                ]);

                const combined = [
                    ...(ideasRes.data || []).map(idea => ({
                        id: idea.id,
                        name: idea.title,
                        slug: idea.slug,
                        type: 'blueprint',
                        path: `/ideas/${idea.slug}`
                    })),
                    ...(franchisesRes.data || []).map(fran => ({
                        id: fran.id,
                        name: fran.name,
                        slug: fran.slug,
                        type: 'franchise',
                        path: `/franchise/${fran.slug}`
                    }))
                ];

                setResults(combined);
            } catch (err) {
                console.error('Search error:', err);
                setResults([]);
            }

            setLoading(false);
        };

        const timer = setTimeout(fetchResults, 300);
        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (path) => {
        setIsOpen(false);
        setQuery('');
        navigate(path);
    };

    return (
        <div className="relative" ref={searchRef}>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-3 px-4 py-2 bg-charcoal-50 border border-charcoal-100 rounded-xl text-charcoal-400 hover:text-charcoal-900 transition-all group"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-xs font-bold mr-4">Search Knowledge...</span>
                <span className="text-[10px] font-black opacity-40 bg-white px-1.5 py-0.5 rounded border border-charcoal-200">⌘K</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-charcoal-950/40 backdrop-blur-sm z-[60]"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            className="fixed top-24 left-1/2 -translate-x-1/2 w-[95%] md:w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-charcoal-100 z-[70] overflow-hidden"
                        >
                            <div className="p-6 border-b border-charcoal-50 flex items-center gap-4">
                                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Find your next wealth engine..."
                                    className="w-full text-xl font-bold bg-transparent border-none focus:ring-0 text-charcoal-900 placeholder:text-charcoal-300"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                            </div>

                            <div className="max-h-[400px] overflow-y-auto p-2">
                                {loading && (
                                    <div className="p-8 text-center text-charcoal-400 font-bold animate-pulse">Scanning Neural Network...</div>
                                )}
                                {!loading && query && results.length === 0 && (
                                    <div className="p-8 text-center text-charcoal-400 font-medium">No intelligence found for "{query}"</div>
                                )}
                                {!query && (
                                    <div className="p-8 text-charcoal-400">
                                        <div className="text-[10px] font-black uppercase tracking-widest mb-4">Trending Intelligence</div>
                                        <div className="grid grid-cols-2 gap-3">
                                            {['Amul', 'Ecommerce', 'Software', 'Tata EV'].map(t => (
                                                <button key={t} onClick={() => setQuery(t)} className="text-left px-4 py-2 bg-charcoal-50 rounded-xl hover:bg-primary-50 text-sm font-bold text-charcoal-700 transition-all transition-all">{t}</button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {results.map(res => (
                                    <button
                                        key={`${res.type}-${res.id}`}
                                        onClick={() => handleSelect(res.path)}
                                        className="w-full flex items-center justify-between p-4 hover:bg-cream-50 rounded-2xl transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-charcoal-50 rounded-xl flex items-center justify-center group-hover:bg-primary-50 transition-all">
                                                {res.type === 'blueprint' ? '💡' : '🏢'}
                                            </div>
                                            <div className="text-left">
                                                <div className="text-sm font-black text-charcoal-900">{res.name}</div>
                                                <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest">{res.type}</div>
                                            </div>
                                        </div>
                                        <div className="text-charcoal-300 group-hover:text-primary-600">→</div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
