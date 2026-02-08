import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import { LogOut, User, BookOpen, Search, ChevronDown, Bell, Globe, Trophy } from 'lucide-react';
import { useState } from 'react';

const LearnerLayout = () => {
    const { user, userData, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        // create a search query param or navigate to catalog with filter
        // For now, simple redirect to catalog
        navigate(`/?search=${searchTerm}`);
    };

    const handleSwitchToInstructor = async () => {
        if (!user) return;
        try {
            // Mock role switch for now or call backend API
            alert("Role switching to Instructor is handled by the backend. This is a placeholder.");
        } catch (err) {
            console.error("Failed to switch role:", err);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">
            {/* Navbar */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-[68px] flex items-center justify-between gap-4">

                    {/* Left: Logo & Explore */}
                    <div className="flex items-center gap-6 shrink-0">
                        <Link to="/" className="flex items-center gap-1 group">
                            <div className="font-bold text-2xl text-blue-600 tracking-tight">
                                LearnSphere
                            </div>
                        </Link>

                        <button className="hidden md:flex items-center gap-1 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors">
                            Explore <ChevronDown size={16} />
                        </button>
                    </div>

                    {/* Middle: Search */}
                    <div className="hidden md:flex flex-1 max-w-2xl px-4">
                        <form onSubmit={handleSearch} className="w-full relative">
                            <input
                                type="text"
                                placeholder="What do you want to learn?"
                                className="w-full h-10 pl-4 pr-10 rounded-sm border border-gray-300 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button type="submit" className="absolute right-0 top-0 h-10 w-10 bg-blue-600 flex items-center justify-center text-white rounded-r-sm hover:bg-blue-700">
                                <Search size={16} />
                            </button>
                        </form>
                    </div>

                    {/* Right: Menu */}
                    <div className="flex items-center gap-4 shrink-0">
                        <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-700">
                            <Link to="/" className="hover:text-blue-600">Courses</Link>
                            <Link to="/leaderboard" className="hover:text-blue-600 font-bold flex items-center gap-1.5"><Trophy size={14} className="text-amber-500" /> Leaderboard</Link>
                            <Link to="/degrees" className="hover:text-blue-600">Online Degrees</Link>
                            <Link to="/careers" className="hover:text-blue-600">Find your New Career</Link>
                            {userData?.role === 'learner' && (
                                <button onClick={handleSwitchToInstructor} className="hover:text-blue-600">Teach on LearnSphere</button>
                            )}
                            {['instructor', 'admin'].includes(userData?.role) && (
                                <Link to="/instructor" className="hover:text-blue-600 font-bold text-blue-600">
                                    {userData?.role === 'admin' ? 'Admin Dashboard' : 'Instructor Mode'}
                                </Link>
                            )}
                        </div>

                        <div className="h-6 w-px bg-gray-300 hidden lg:block mx-2"></div>

                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link to="/my-courses" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                                    Student Dashboard
                                </Link>
                                <Link to="/profile" className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full border border-blue-100 hover:bg-blue-100 transition-colors">
                                    <Trophy size={14} className="text-blue-600" />
                                    <span className="text-sm font-bold">{userData?.points || 0}</span>
                                </Link>
                                <button className="text-gray-600 hover:text-blue-600">
                                    <Bell size={20} />
                                </button>

                                <div className="group relative">
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200 hover:bg-blue-200 transition-colors"
                                    >
                                        {userData?.name ? userData.name[0].toUpperCase() : <User size={18} />}
                                    </button>

                                    {/* Demo Role Switcher */}
                                    {isProfileOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={() => setIsProfileOpen(false)}
                                            ></div>
                                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-150 transform origin-top-right">
                                                <div className="px-4 py-3 border-b border-gray-100">
                                                    <p className="text-sm font-bold text-gray-900 truncate">{userData?.name || 'User'}</p>
                                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                                    <div className="mt-2 text-xs font-mono bg-slate-100 p-1 rounded text-center uppercase border border-slate-200">
                                                        Role: Student
                                                    </div>
                                                </div>
                                                <Link
                                                    to="/my-courses"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                    onClick={() => setIsProfileOpen(false)}
                                                >
                                                    Student Dashboard
                                                </Link>
                                                <Link
                                                    to="/profile"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                    onClick={() => setIsProfileOpen(false)}
                                                >
                                                    Profile
                                                </Link>

                                                <div className="border-t border-gray-100 my-1"></div>

                                                {userData?.role === 'learner' ? (
                                                    <button
                                                        onClick={() => {
                                                            handleSwitchToInstructor();
                                                            setIsProfileOpen(false);
                                                        }}
                                                        className="w-full text-left px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 font-bold"
                                                    >
                                                        Switch to Instructor View
                                                    </button>
                                                ) : (
                                                    <Link
                                                        to="/instructor"
                                                        className="block px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 font-bold"
                                                        onClick={() => setIsProfileOpen(false)}
                                                    >
                                                        {userData?.role === 'admin' ? 'Admin Dashboard' : 'Instructor Dashboard'}
                                                    </Link>
                                                )}

                                                <div className="border-t border-gray-100 mt-1"></div>
                                                <button
                                                    onClick={logout}
                                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                >
                                                    Log Out
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link to="/login" className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded transition-colors">Log In</Link>
                                <Link to="/signup">
                                    <Button className="font-bold text-sm px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white shadow-none">Join for Free</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">
                <Outlet />
            </main>

            {/* Footer Mockup */}
            <footer className="bg-gray-100 border-t border-gray-200 py-12 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">LearnSphere</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link to="#" className="hover:underline">About</Link></li>
                            <li><Link to="#" className="hover:underline">What We Offer</Link></li>
                            <li><Link to="#" className="hover:underline">Leadership</Link></li>
                            <li><Link to="#" className="hover:underline">Careers</Link></li>
                            <li><Link to="#" className="hover:underline">Catalog</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">Community</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link to="#" className="hover:underline">Students</Link></li>
                            <li><Link to="#" className="hover:underline">Partners</Link></li>
                            <li><Link to="#" className="hover:underline">Developers</Link></li>
                            <li><Link to="#" className="hover:underline">Beta Testers</Link></li>
                            <li><Link to="#" className="hover:underline">Translators</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">More</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link to="#" className="hover:underline">Press</Link></li>
                            <li><Link to="#" className="hover:underline">Investors</Link></li>
                            <li><Link to="#" className="hover:underline">Terms</Link></li>
                            <li><Link to="#" className="hover:underline">Privacy</Link></li>
                            <li><Link to="#" className="hover:underline">Help</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">App</h4>
                        <Button variant="outline" className="w-full mb-2 text-xs h-10 flex items-center justify-center gap-2">
                            <Globe size={14} /> App Store
                        </Button>
                        <Button variant="outline" className="w-full text-xs h-10 flex items-center justify-center gap-2">
                            <Globe size={14} /> Google Play
                        </Button>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
                    © 2026 LearnSphere Inc. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default LearnerLayout;
