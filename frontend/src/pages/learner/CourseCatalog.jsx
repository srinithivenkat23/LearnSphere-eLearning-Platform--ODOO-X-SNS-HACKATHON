import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen, Clock, Users, Zap, Shield, Globe, ArrowRight, Award, CheckCircle, Star } from 'lucide-react';
import axios from 'axios';
const API_URL = 'http://localhost:5000/api';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner, { SkeletonCard } from '../../components/ui/LoadingSpinner';

export default function CourseCatalog() {
    const { user, userData } = useAuth();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [myEnrollments, setMyEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const initialSearch = searchParams.get('search') || '';
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [priceFilter, setPriceFilter] = useState('All'); // 'All', 'Free', 'Paid'

    const categories = ['All', 'Technology', 'Business', 'Design', 'Data Science', 'Personal Development'];

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        setSearchTerm(initialSearch);
    }, [initialSearch]);

    const fetchCourses = async () => {
        try {
            // Fetch Published Courses from Node.js backend
            const response = await axios.get(`${API_URL}/courses`, {
                params: {
                    search: searchTerm,
                    category: selectedCategory
                }
            });
            setCourses(response.data);

            // If user is logged in, fetch their enrollments
            if (user) {
                const enResponse = await axios.get(`${API_URL}/enrollments/my-courses`);
                setMyEnrollments(enResponse.data);
            }
        } catch (error) {
            console.error("Error fetching courses:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinCourse = async (courseId) => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/enrollments/enroll`, { courseId });
            // Refresh enrollments and list
            alert(`Succesfully joined! You earned 10 points. New balance: ${response.data.userPoints}`);
            fetchCourses();
        } catch (error) {
            console.error("Error joining course:", error);
            alert(error.response?.data?.message || "Failed to join course");
        }
    };

    const filteredCourses = courses.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory || c.tags?.includes(selectedCategory);
        const matchesPrice = priceFilter === 'All' ||
            (priceFilter === 'Free' && !c.isPaid) ||
            (priceFilter === 'Paid' && c.isPaid);
        return matchesSearch && matchesCategory && matchesPrice;
    });

    // Mock Data for "Trusted By"
    const partners = [
        "Google", "IBM", "Meta", "Stanford", "Duke", "Yale", "Microsoft", "AWS"
    ];

    return (
        <div className="bg-white min-h-screen font-sans">
            {/* Hero Section */}
            <div className="relative bg-white overflow-hidden">
                <div className="max-w-[1400px] mx-auto">
                    <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32 flex flex-col justify-center h-full min-h-[600px] px-4 sm:px-6 lg:px-8">
                        <main className="mt-10 mx-auto max-w-7xl sm:mt-12 md:mt-16 lg:mt-20 xl:mt-28">
                            <div className="sm:text-center lg:text-left">
                                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl mb-6">
                                    <span className="block xl:inline">Learn without</span>{' '}
                                    <span className="block text-blue-600 xl:inline">limits</span>
                                </h1>
                                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                                    Build skills with courses, certificates, and degrees online from world-class universities and companies.
                                </p>
                                <div className="mt-8 sm:mt-10 sm:flex sm:justify-center lg:justify-start gap-4">
                                    <Link to="/signup">
                                        <Button className="px-8 py-4 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm">
                                            Join for Free
                                        </Button>
                                    </Link>
                                    <Link to="/enterprise">
                                        <Button variant="outline" className="px-8 py-4 text-lg font-bold border-blue-600 text-blue-600 hover:bg-blue-50 rounded-md">
                                            Try for Business
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
                <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 bg-blue-50">
                    <img
                        className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full opacity-90"
                        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
                        alt="Students learning"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-white via-white/50 to-transparent lg:via-white/20"></div>
                </div>
            </div>

            {/* Trusted By Section */}
            <div className="bg-gray-50 py-12 border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-8">
                        Collaborate with 300+ leading universities and companies
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        {partners.map((partner, i) => (
                            <span key={i} className="text-xl md:text-2xl font-bold text-gray-800">{partner}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Categories & Filter Section */}
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 border-b border-gray-100">
                <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest mr-4">Browse:</span>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${selectedCategory === cat
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Price Filter */}
                <div className="flex items-center gap-3 mt-4">
                    <span className="text-sm font-bold text-slate-700">Price:</span>
                    {['All', 'Free', 'Paid'].map(filter => (
                        <button
                            key={filter}
                            onClick={() => setPriceFilter(filter)}
                            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${priceFilter === filter
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Resume Learning Section (Logged in only) */}
            {user && myEnrollments.length > 0 && selectedCategory === 'All' && !searchTerm && (
                <div className="bg-blue-50/50 py-12">
                    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Welcome back, {userData?.name || 'Scholar'}! Resume your courses:</h2>
                            <Link to="/my-courses" className="text-sm font-bold text-blue-600 hover:underline">View All My Learning</Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myEnrollments.slice(0, 3).map(enroll => (
                                <Card key={enroll._id} className="p-4 flex gap-4 bg-white/80 border-blue-100">
                                    <div className="w-20 h-20 bg-gray-200 rounded overflow-hidden shrink-0">
                                        <img src={enroll.courseData?.imageUrl} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-900 text-sm truncate mb-1">{enroll.courseData?.title}</h3>
                                        <div className="flex items-center justify-between text-[10px] text-gray-500 mb-2">
                                            <span>{enroll.progressPercent}% Complete</span>
                                        </div>
                                        <div className="h-1 bg-gray-100 rounded-full overflow-hidden mb-3">
                                            <div className="h-full bg-blue-600" style={{ width: `${enroll.progressPercent}%` }}></div>
                                        </div>
                                        <Button size="sm" onClick={() => navigate(`/courses/${enroll.courseId}/learn`)} className="h-8 py-0 px-4 text-xs">Resume</Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Featured Courses Section */}
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            {searchTerm ? `Results for "${searchTerm}"` : selectedCategory === 'All' ? 'Most Popular Courses' : `${selectedCategory} Courses`}
                        </h2>
                        <p className="text-gray-600">Explore our highest-rated courses in {selectedCategory === 'All' ? 'all categories' : selectedCategory}</p>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredCourses.length > 0 ? filteredCourses.map((course, index) => {
                            const isEnrolled = myEnrollments.some(e => e.courseId?._id === course._id);
                            const enrollment = myEnrollments.find(e => e.courseId?._id === course._id);
                            const hasStarted = isEnrolled && enrollment.progressPercent > 0;
                            const isPaid = course.accessRule === 'paid';

                            return (
                                <motion.div
                                    key={course._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05, duration: 0.4 }}
                                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                                    className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-2xl hover:border-blue-200 transition-all duration-300 flex flex-col"
                                >
                                    <Link to={`/courses/${course._id}`} className="block relative h-40 bg-gray-200 overflow-hidden">
                                        {(course.thumbnail || course.imageUrl) ? (
                                            <img src={course.thumbnail || course.imageUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-white/30">
                                                <BookOpen size={40} />
                                            </div>
                                        )}
                                        {/* FREE/PAID Badge */}
                                        {course.isPaid ? (
                                            <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg">
                                                ₹{course.price}
                                            </div>
                                        ) : (
                                            <div className="absolute top-2 right-2 bg-gradient-to-r from-emerald-400 to-green-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg">
                                                FREE
                                            </div>
                                        )}
                                    </Link>

                                    <div className="p-4 flex-1 flex flex-col">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-6 h-6 bg-gray-100 rounded-sm overflow-hidden flex items-center justify-center text-[10px] font-bold text-gray-400">LS</div>
                                            <span className="text-xs font-semibold text-gray-700 truncate">University of LearnSphere</span>
                                        </div>

                                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-blue-600 transition-colors">
                                            {course.title}
                                        </h3>

                                        <div className="flex flex-wrap gap-1 mb-4">
                                            {course.tags?.slice(0, 2).map((tag, i) => (
                                                <span key={i} className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter bg-gray-50 px-1.5 py-0.5 rounded italic">#{tag}</span>
                                            ))}
                                        </div>

                                        <div className="flex items-center gap-1.5 mb-4">
                                            <div className="flex text-yellow-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={12} className={i < Math.floor(course.rating || 0) ? "fill-current" : "text-slate-200"} />
                                                ))}
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-500">
                                                {course.rating ? Number(course.rating).toFixed(1) : '0.0'} ({course.reviewsCount || 0})
                                            </span>
                                        </div>

                                        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between gap-4">
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                {course.studentsCount || 0} Students
                                            </div>
                                            <Button
                                                size="sm"
                                                className="h-8 py-0 px-4 text-xs font-bold"
                                                variant={isEnrolled ? "outline" : isPaid ? "primary" : "outline"}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (isEnrolled) {
                                                        navigate(`/courses/${course._id}/learn`);
                                                    } else if (course.accessRule === 'free') {
                                                        handleJoinCourse(course._id);
                                                    } else {
                                                        navigate(`/courses/${course._id}`); // Go to detail/buy page
                                                    }
                                                }}
                                            >
                                                {!user ? 'Join Course' : isEnrolled ? (hasStarted ? 'Continue' : 'Start') : isPaid ? `Buy $${course.price}` : 'Enroll'}
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        }) : (
                            <div className="col-span-full py-20 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                <Search size={48} className="mx-auto text-slate-300 mb-4" />
                                <h3 className="text-lg font-bold text-slate-900">No courses match your criteria</h3>
                                <p className="text-slate-500">Try adjusting your filters or search term.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Value Props */}
            <div className="bg-gray-50 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                                <Award size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 mb-2">Earn recognized certificates</h3>
                                <p className="text-gray-600 text-sm">Demonstrate your new skills and share your certificates with prospective employers to boost your career.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 shrink-0">
                                <Zap size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 mb-2">Learn at your own pace</h3>
                                <p className="text-gray-600 text-sm">Enjoy access to online courses and specialization programs on your own schedule.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 shrink-0">
                                <Users size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 mb-2">Learn from experts</h3>
                                <p className="text-gray-600 text-sm">Learn from top universities and leading companies like Google, IBM, and more.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Call to Action */}
            <div className="bg-blue-600 py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-white mb-6">Join for Free</h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Start your learning journey today with a free account.
                    </p>
                    <Link to="/signup">
                        <Button className="bg-white text-blue-600 hover:bg-gray-100 font-bold px-8 py-3 text-lg">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
