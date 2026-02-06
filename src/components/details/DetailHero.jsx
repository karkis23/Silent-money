import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import BackButton from '../BackButton';

export default function DetailHero({
    title,
    category,
    shortDescription,
    imageUrl,
    profiles,
    isVerified,
    isPremium,
    isFeatured,
    assetGrade,
    backLabel = "Back to Feed",
    actions,
    stats
}) {
    return (
        <div className="relative overflow-hidden bg-white border-b border-charcoal-100/50">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-50/20 via-transparent to-transparent -z-0 pointer-events-none" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-600/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 lg:pb-20 relative z-10">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-charcoal-50/50 rounded-xl border border-charcoal-100/50 group hover:bg-white hover:shadow-lg transition-all decoration-none">
                            <BackButton label={backLabel} />
                        </div>
                        <div className="h-px flex-1 bg-gradient-to-r from-charcoal-100 to-transparent hidden sm:block" />
                    </div>

                    <div className="grid lg:grid-cols-12 gap-12 items-start">
                        <div className="lg:col-span-12">
                            <div className="flex flex-wrap items-center gap-4 mb-8">
                                <span className="bg-charcoal-900 text-white px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-xl shadow-charcoal-200/50">
                                    {category === 'blueprint' ? '💡' : '🏢'} {category}
                                </span>
                                {isVerified && (
                                    <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-100/50">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                        Verified Blueprint
                                    </div>
                                )}
                                {isPremium && (
                                    <span className="bg-amber-50 text-amber-600 border border-amber-100 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]">
                                        Premium Strategy
                                    </span>
                                )}
                            </div>

                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-charcoal-950 mb-8 leading-[1.1] tracking-tighter">
                                {title}
                            </h1>

                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                                <div className="max-w-2xl">
                                    <p className="text-xl md:text-2xl text-charcoal-500 font-medium leading-relaxed mb-8">
                                        {shortDescription}
                                    </p>

                                    <div className="flex flex-wrap items-center gap-6">
                                        {profiles && (
                                            <Link to={`/profile/${profiles.id}`} className="inline-flex items-center gap-3 group">
                                                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-charcoal-50 shadow-inner border border-charcoal-100/50">
                                                    {profiles.avatar_url ? (
                                                        <img src={profiles.avatar_url} className="w-full h-full object-cover" alt={profiles.full_name} />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-sm font-black text-primary-600">
                                                            {profiles.full_name?.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-[9px] font-black text-charcoal-400 uppercase tracking-widest leading-none mb-1">Architect</div>
                                                    <div className="text-sm font-black text-charcoal-900 group-hover:text-primary-600 transition-colors uppercase leading-none">
                                                        {profiles.full_name}
                                                    </div>
                                                </div>
                                            </Link>
                                        )}

                                        <div className="h-8 w-px bg-charcoal-100 hidden md:block" />

                                        <div className="flex items-center gap-4">
                                            <div className="text-right hidden sm:block">
                                                <div className="text-[9px] font-black text-charcoal-400 uppercase tracking-widest leading-none mb-1">Review</div>
                                                <div className="text-sm font-black text-emerald-600 leading-none">{assetGrade || 'A+ Grade'}</div>
                                            </div>
                                            <div className="flex -space-x-3">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-charcoal-50 overflow-hidden">
                                                        <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="user" className="w-full h-full object-cover" />
                                                    </div>
                                                ))}
                                                <div className="w-8 h-8 rounded-full border-2 border-white bg-primary-600 flex items-center justify-center text-[10px] font-black text-white">
                                                    +2k
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 p-2 bg-white border border-charcoal-100 rounded-[2.5rem] shadow-2xl shadow-charcoal-200/30 w-full sm:w-auto flex-nowrap shrink-0">
                                    {actions}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hero Asset */}
                    <div className="mt-12 group relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary-600/5 blur-[120px] rounded-full -z-10 group-hover:bg-primary-600/10 transition-colors duration-1000" />
                        <div className="aspect-[21/9] rounded-[3rem] overflow-hidden border-4 border-white shadow-2xl relative">
                            <img
                                src={imageUrl || 'https://images.unsplash.com/photo-1579621970795-87faff2f9160?q=80&w=1000'}
                                className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                                alt={title}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-1000" />

                            <div className="absolute bottom-10 left-10 right-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pointer-events-none">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-white/10 backdrop-blur-2xl flex items-center justify-center text-3xl shadow-inner border border-white/20">
                                        💡
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-white/50 uppercase tracking-[0.4em] mb-1">Blueprint Status</div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-lg font-black text-white uppercase tracking-wider">Live & Operational</div>
                                            {isFeatured && (
                                                <span className="bg-amber-500 text-white px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase shadow-lg shadow-amber-500/20">⭐ Top PICK</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {stats && (
                                    <div className="flex gap-4">
                                        {stats.map((stat, i) => (
                                            <div key={i} className="px-6 py-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10">
                                                <div className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-0.5">{stat.label}</div>
                                                <div className="text-sm font-black text-white">{stat.value}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
