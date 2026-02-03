import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from './ConfirmModal';
import { toast } from 'react-hot-toast';

export default function ReviewsSection({ assetId, assetType = 'idea', authorId, user }) {
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [content, setContent] = useState('');
    const [replyContent, setReplyContent] = useState({}); // Stores replies per review ID
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const [error, setError] = useState('');
    const [userHasReviewed, setUserHasReviewed] = useState(false);
    const [editingReview, setEditingReview] = useState(null); // Stores ID of review being edited
    const [editContent, setEditContent] = useState('');
    const isAuthor = user?.id === authorId;

    // Confirm Modal State
    const [confirmConfig, setConfirmConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'danger'
    });

    const tableName = assetType === 'franchise' ? 'franchise_reviews' : 'income_idea_reviews';
    const foreignKey = assetType === 'franchise' ? 'franchise_id' : 'idea_id';

    const fetchReviews = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from(tableName)
            .select('*, profiles(id, full_name, avatar_url)')
            .eq(foreignKey, assetId)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setReviews(data);
            const reviewed = data.find(r => r.user_id === user?.id);
            setUserHasReviewed(!!reviewed);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchReviews();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [assetId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;

        setSubmitting(true);
        setError('');

        const { error } = await supabase
            .from(tableName)
            .insert([{
                user_id: user.id,
                [foreignKey]: assetId,
                rating,
                content
            }]);

        if (error) {
            if (error.code === '23505') {
                setError('You have already logged intel for this asset.');
            } else {
                setError(`Transmission failed: ${error.message}`);
            }
        } else {
            setContent('');
            setRating(5);
            fetchReviews();
        }
        setSubmitting(false);
    };

    // ... handlePostReply and handleDelete stay the same but use tableName ...

    const handlePostReply = async (reviewId) => {
        const reply = replyContent[reviewId];
        if (!reply?.trim()) return;

        setSubmitting(true);
        const { error } = await supabase
            .from(tableName)
            .update({
                author_response: reply,
                responded_at: new Date().toISOString()
            })
            .eq('id', reviewId);

        if (!error) {
            toast.success('Strategy response transmitted.');
            setReplyContent(prev => ({ ...prev, [reviewId]: '' }));
            setReplyingTo(null);
            fetchReviews();
        } else {
            console.error('Reply error:', error);
            toast.error('Transmission failed: ' + error.message);
        }
        setSubmitting(false);
    };

    const handleDeleteResponse = (reviewId) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Retract Strategy Response?',
            message: 'Are you sure you want to permanently remove your owner response from this intel record? This action cannot be undone.',
            onConfirm: async () => {
                setSubmitting(true);
                const { error } = await supabase
                    .from(tableName)
                    .update({
                        author_response: null,
                        responded_at: null
                    })
                    .eq('id', reviewId);

                if (!error) {
                    toast.success('Strategy response retracted.');
                    fetchReviews();
                } else {
                    toast.error('Retraction failed: ' + error.message);
                }
                setSubmitting(false);
            },
            type: 'danger'
        });
    };

    const handleEdit = (review) => {
        setEditingReview(review.id);
        setEditContent(review.content);
    };

    const handleUpdateReview = async (reviewId) => {
        if (!editContent.trim()) return;

        setSubmitting(true);
        const { error } = await supabase
            .from(tableName)
            .update({ content: editContent })
            .eq('id', reviewId);

        if (!error) {
            toast.success('Intelligence updated.');
            setEditingReview(null);
            fetchReviews();
        } else {
            toast.error('Update failed: ' + error.message);
        }
        setSubmitting(false);
    };

    const handleDelete = (reviewId) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Retract Intel?',
            message: 'Are you sure you want to permanently remove your feedback from this asset? This action cannot be undone.',
            onConfirm: async () => {
                const { error } = await supabase
                    .from(tableName)
                    .delete()
                    .eq('id', reviewId);

                if (!error) {
                    fetchReviews();
                }
            },
            type: 'danger'
        });
    };

    return (
        <div className="card space-y-8 bg-white/50 backdrop-blur-sm border-charcoal-100">
            <h3 className="text-xl font-black text-charcoal-900 flex items-center gap-3">
                <span>💬</span> {assetType === 'franchise' ? 'Brand Intel' : 'Community Intel'}
            </h3>

            {user ? (
                !userHasReviewed ? (
                    <form onSubmit={handleSubmit} className="space-y-6 pb-8 border-b border-charcoal-50">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Operational Rating</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setRating(s)}
                                        className={`text-2xl transition-all ${s <= rating ? 'grayscale-0 scale-110' : 'grayscale opacity-30 hover:opacity-50'}`}
                                    >
                                        ⭐
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Strategic Feedback</label>
                            <textarea
                                required
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full px-5 py-4 bg-white border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none text-sm font-medium min-h-[100px] resize-none"
                                placeholder={`Share your experience with this ${assetType}...`}
                            />
                        </div>

                        {error && <p className="text-red-500 text-xs font-bold">{error}</p>}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary w-full py-4 text-xs tracking-widest uppercase font-black"
                        >
                            {submitting ? 'Transmitting...' : 'Post Intel'}
                        </button>
                    </form>
                ) : (
                    <div className="bg-primary-50 p-6 rounded-3xl border border-primary-100 text-center mb-8">
                        <p className="text-primary-700 text-sm font-bold uppercase tracking-widest mb-1">Intel Logged</p>
                        <p className="text-primary-600 text-xs font-medium opacity-80">You&apos;ve successfully shared your feedback on this asset.</p>
                    </div>
                )
            ) : (
                <div className="bg-charcoal-50 p-8 rounded-3xl text-center border border-charcoal-100 mb-8">
                    <p className="text-charcoal-600 font-bold text-sm mb-4">Login to contribute operational feedback.</p>
                    <Link to="/login" className="btn-secondary py-2 px-6 text-[10px]">Secure Access</Link>
                </div>
            )}

            <div className="space-y-6">
                {loading ? (
                    <div className="py-12 flex justify-center">
                        <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="py-12 text-center text-charcoal-400 italic text-sm font-medium">
                        No community intel available for this asset yet.
                    </div>
                ) : (
                    reviews.map((review) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group p-6 bg-white rounded-[2rem] border border-charcoal-50 hover:border-primary-100 transition-all shadow-sm hover:shadow-md"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <Link
                                    to={`/profile/${review.profiles?.id}`}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-charcoal-50 border border-charcoal-100">
                                        {review.profiles?.avatar_url ? (
                                            <img src={review.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center font-black text-primary-600">
                                                {review.profiles?.full_name?.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-charcoal-900 uppercase tracking-widest leading-none mb-1 group-hover:text-primary-600 transition-colors">
                                            {review.profiles?.full_name}
                                        </div>
                                        <div className="flex gap-0.5">
                                            {[...Array(review.rating)].map((_, i) => (
                                                <span key={i} className="text-[10px]">⭐</span>
                                            ))}
                                        </div>
                                    </div>
                                </Link>
                                <div className="flex items-start gap-3">
                                    <div className="text-[8px] font-black text-charcoal-300 uppercase tracking-widest mt-1">
                                        {new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                    </div>
                                    {user?.id === review.user_id && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEdit(review)}
                                                className="text-charcoal-300 hover:text-primary-600 transition-colors"
                                                title="Edit Intel"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(review.id)}
                                                className="text-charcoal-300 hover:text-red-500 transition-colors"
                                                title="Retract Intel"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {editingReview === review.id ? (
                                <div className="space-y-3 mb-4">
                                    <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className="w-full px-4 py-3 bg-charcoal-50 border border-charcoal-100 rounded-xl focus:ring-2 focus:ring-primary-600 outline-none text-sm font-medium min-h-[100px] resize-none"
                                    />
                                    <div className="flex gap-2 justify-end">
                                        <button
                                            onClick={() => setEditingReview(null)}
                                            className="px-4 py-2 text-[10px] font-black text-charcoal-400 uppercase tracking-widest hover:text-charcoal-900"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleUpdateReview(review.id)}
                                            disabled={submitting}
                                            className="px-6 py-2 bg-charcoal-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 transition-colors shadow-lg"
                                        >
                                            {submitting ? 'Updating...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-charcoal-600 font-medium leading-relaxed italic pr-4 mb-4">
                                    &quot;{review.content}&quot;
                                </p>
                            )}

                            {/* Author Response Section */}
                            {review.author_response ? (
                                <div className="mt-4 pl-6 border-l-2 border-primary-100 py-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[8px] font-black bg-primary-600 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">Asset Owner</span>
                                        <span className="text-[8px] font-black text-charcoal-300 uppercase tracking-widest">
                                            {review.responded_at ? new Date(review.responded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Verified Response'}
                                        </span>
                                        {isAuthor && replyingTo !== review.id && (
                                            <div className="flex items-center gap-1.5 ml-1">
                                                <button
                                                    onClick={() => {
                                                        setReplyingTo(review.id);
                                                        setReplyContent(prev => ({ ...prev, [review.id]: review.author_response }));
                                                    }}
                                                    className="text-charcoal-300 hover:text-primary-600 transition-colors"
                                                    title="Edit Strategy Response"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteResponse(review.id)}
                                                    className="text-charcoal-300 hover:text-red-500 transition-colors"
                                                    title="Retract Response"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm text-charcoal-900 font-bold leading-relaxed">
                                        {review.author_response}
                                    </p>
                                </div>
                            ) : (
                                isAuthor && replyingTo !== review.id && (
                                    <button
                                        onClick={() => setReplyingTo(review.id)}
                                        className="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:underline flex items-center gap-1.5"
                                    >
                                        <span>↩️ Reply as Owner</span>
                                    </button>
                                )
                            )}

                            {/* Reply Input (Author Only) */}
                            <AnimatePresence>
                                {replyingTo === review.id && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-4 pt-4 border-t border-charcoal-50"
                                    >
                                        <textarea
                                            value={replyContent[review.id] || ''}
                                            onChange={(e) => setReplyContent(prev => ({ ...prev, [review.id]: e.target.value }))}
                                            className="w-full px-4 py-3 bg-charcoal-50 border border-charcoal-100 rounded-xl focus:ring-2 focus:ring-primary-600 outline-none text-xs font-medium min-h-[80px] resize-none"
                                            placeholder="Write your response to the commander..."
                                        />
                                        <div className="flex gap-2 mt-2 justify-end">
                                            <button
                                                onClick={() => setReplyingTo(null)}
                                                className="px-4 py-2 text-[10px] font-black text-charcoal-400 uppercase tracking-widest hover:text-charcoal-900"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => handlePostReply(review.id)}
                                                disabled={submitting}
                                                className="px-6 py-2 bg-charcoal-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 transition-colors shadow-lg"
                                            >
                                                {submitting ? 'Sending...' : 'Post Response'}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))
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
        </div>
    );
}
