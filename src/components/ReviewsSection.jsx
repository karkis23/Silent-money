import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReviewsSection({ ideaId, authorId, user }) {
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [content, setContent] = useState('');
    const [replyContent, setReplyContent] = useState({}); // Stores replies per review ID
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const [error, setError] = useState('');
    const [userHasReviewed, setUserHasReviewed] = useState(false);
    const isAuthor = user?.id === authorId;

    useEffect(() => {
        fetchReviews();
    }, [ideaId]);

    const fetchReviews = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('income_idea_reviews')
            .select('*, profiles(id, full_name, avatar_url)')
            .eq('idea_id', ideaId)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setReviews(data);
            const reviewed = data.find(r => r.user_id === user?.id);
            setUserHasReviewed(!!reviewed);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;

        setSubmitting(true);
        setError('');

        const { error } = await supabase
            .from('income_idea_reviews')
            .insert([{
                user_id: user.id,
                idea_id: ideaId,
                rating,
                content
            }]);

        if (error) {
            if (error.code === '23505') {
                setError('You have already reviewed this blueprint.');
            } else {
                setError('Transmission failed. Ensure the blueprint is active.');
            }
        } else {
            setContent('');
            setRating(5);
            fetchReviews();
        }
        setSubmitting(false);
    };

    const handlePostReply = async (reviewId) => {
        const reply = replyContent[reviewId];
        if (!reply?.trim()) return;

        setSubmitting(true);
        const { error } = await supabase
            .from('income_idea_reviews')
            .update({
                author_response: reply,
                responded_at: new Date().toISOString()
            })
            .eq('id', reviewId);

        if (!error) {
            setReplyContent(prev => ({ ...prev, [reviewId]: '' }));
            setReplyingTo(null);
            fetchReviews();
        } else {
            console.error('Reply error:', error);
            alert('Failed to transmit reply to the community grid.');
        }
        setSubmitting(false);
    };

    const handleDelete = async (reviewId) => {
        if (!confirm('Are you sure you want to retract your review?')) return;

        const { error } = await supabase
            .from('income_idea_reviews')
            .delete()
            .eq('id', reviewId);

        if (!error) {
            fetchReviews();
        }
    };

    return (
        <div className="card space-y-8 bg-white/50 backdrop-blur-sm border-charcoal-100">
            <h3 className="text-xl font-black text-charcoal-900 flex items-center gap-3">
                <span>💬</span> Community Intel
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
                                placeholder="Share your experience with this blueprint..."
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
                        <p className="text-primary-600 text-xs font-medium opacity-80">You've successfully shared your feedback on this asset.</p>
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
                                        <button
                                            onClick={() => handleDelete(review.id)}
                                            className="text-charcoal-300 hover:text-red-500 transition-colors"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                            <p className="text-sm text-charcoal-600 font-medium leading-relaxed italic pr-4 mb-4">
                                "{review.content}"
                            </p>

                            {/* Author Response Section */}
                            {review.author_response ? (
                                <div className="mt-4 pl-6 border-l-2 border-primary-100 py-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[8px] font-black bg-primary-600 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">Blueprint Author</span>
                                        <span className="text-[8px] font-black text-charcoal-300 uppercase tracking-widest">
                                            {new Date(review.responded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                        </span>
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
                                        <span>↩️ Reply as Author</span>
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
        </div>
    );
}
