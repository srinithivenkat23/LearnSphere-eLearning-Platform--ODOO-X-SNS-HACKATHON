import { useState, useEffect } from 'react';
import { Star, User } from 'lucide-react';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc, runTransaction } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import Button from '../ui/Button';

export default function Reviews({ courseId }) {
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [userReview, setUserReview] = useState(null);
    const [isEnrolled, setIsEnrolled] = useState(false);

    useEffect(() => {
        loadReviews();
        checkEnrollment();
    }, [courseId]);

    const checkEnrollment = async () => {
        if (!auth.currentUser) return;
        try {
            const q = query(
                collection(db, 'enrollments'),
                where('courseId', '==', courseId),
                where('userId', '==', auth.currentUser.uid)
            );
            const snapshot = await getDocs(q);
            setIsEnrolled(!snapshot.empty);
        } catch (err) {
            console.error(err);
        }
    };

    const loadReviews = async () => {
        try {
            const q = query(collection(db, 'reviews'), where('courseId', '==', courseId));
            const snapshot = await getDocs(q);
            const reviewsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setReviews(reviewsData);

            if (auth.currentUser) {
                const myReview = reviewsData.find(r => r.userId === auth.currentUser.uid);
                setUserReview(myReview);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!auth.currentUser) return alert("Please login to review");
        if (!isEnrolled) return alert("Only enrolled students can leave reviews.");

        setSubmitting(true);
        try {
            const courseRef = doc(db, 'courses', courseId);

            await runTransaction(db, async (transaction) => {
                const courseSnap = await transaction.get(courseRef);
                if (!courseSnap.exists()) throw "Course does not exist!";

                const data = courseSnap.data();
                const currentRating = data.rating || 0;
                const reviewsCount = data.reviewsCount || 0;

                const newReviewsCount = reviewsCount + 1;
                const newRating = ((currentRating * reviewsCount) + rating) / newReviewsCount;

                // Add review
                const reviewRef = doc(collection(db, 'reviews'));
                transaction.set(reviewRef, {
                    courseId,
                    userId: auth.currentUser.uid,
                    userName: auth.currentUser.displayName || auth.currentUser.email,
                    rating,
                    comment,
                    createdAt: serverTimestamp()
                });

                // Update course
                transaction.update(courseRef, {
                    rating: newRating,
                    reviewsCount: newReviewsCount
                });
            });

            setComment('');
            loadReviews();
        } catch (err) {
            console.error(err);
            alert("Failed to post review: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : 'N/A';

    return (
        <div className="mt-12 bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                Student Reviews
                <span className="text-sm font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-full flex items-center gap-1">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" /> {averageRating} ({reviews.length})
                </span>
            </h3>

            <div className="space-y-8">
                {reviews.map((review) => (
                    <div key={review.id} className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                            <User size={20} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-slate-900">{review.userName.split('@')[0]}</span>
                                <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={12} className={i < review.rating ? "fill-current" : "text-slate-300"} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-slate-600 text-sm">{review.comment}</p>
                        </div>
                    </div>
                ))}
                {reviews.length === 0 && <p className="text-slate-500 italic">No reviews yet.</p>}
            </div>

            {!userReview && auth.currentUser && isEnrolled && (
                <form onSubmit={handleSubmit} className="mt-8 pt-8 border-t border-slate-100">
                    <h4 className="font-bold text-slate-900 mb-4">Write a Review</h4>
                    <div className="flex items-center gap-1 mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                type="button"
                                key={star}
                                onClick={() => setRating(star)}
                                className={`transition-colors ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`}
                            >
                                <Star size={24} />
                            </button>
                        ))}
                    </div>
                    <textarea
                        className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4"
                        rows={3}
                        placeholder="Share your experience..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                    />
                    <Button disabled={submitting} type="submit">{submitting ? 'Posting...' : 'Post Review'}</Button>
                </form>
            )}
            {!userReview && auth.currentUser && !isEnrolled && (
                <div className="mt-8 pt-8 border-t border-slate-100 text-center text-slate-500 italic text-sm">
                    Only enrolled students can share their experience.
                </div>
            )}
            {!auth.currentUser && (
                <div className="mt-8 pt-8 border-t border-slate-100 text-center text-slate-500 italic text-sm">
                    Please log in to leave a review.
                </div>
            )}
        </div>
    );
}
