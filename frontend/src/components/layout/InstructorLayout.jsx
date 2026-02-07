import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, BarChart3, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const InstructorLayout = () => {
    const { logout, user, userData } = useAuth();
    const location = useLocation();

    const navItems = [
        { label: 'Dashboard', icon: (size) => <LayoutDashboard size={size} />, path: '/instructor' },
        { label: userData?.role === 'admin' ? 'All Courses' : 'My Courses', icon: (size) => <BookOpen size={size} />, path: '/instructor/courses' },
        { label: userData?.role === 'admin' ? 'Platform Reports' : 'Reporting', icon: (size) => <BarChart3 size={size} />, path: '/instructor/reports' },
        { label: 'Settings', icon: (size) => <Settings size={size} />, path: '/instructor/settings' },
        { label: userData?.role === 'admin' ? 'View Site' : 'Student View', icon: (size) => <BookOpen size={size} />, path: '/' },
    ];

    return (
        <div className="flex h-screen bg-slate-50 font-sans">
            {/* Sidebar */}
            <aside className="w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200 hidden md:flex flex-col relative z-20 shadow-xl shadow-slate-200/50">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30">
                            LS
                        </div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                            LearnSphere
                        </h1>
                    </div>
                    <p className="text-xs text-slate-400 font-bold tracking-widest uppercase ml-11">
                        {userData?.role === 'admin' ? 'Admin Portal' : 'Instructor Studio'}
                    </p>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 translate-x-1'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1'
                                    }`}
                            >
                                {item.icon(20)}
                                <span className={`font-medium ${isActive ? 'text-white' : ''}`}>{item.label}</span>
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 m-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 font-bold shadow-sm">
                            {user?.email?.[0].toUpperCase()}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold text-slate-900 truncate">{userData?.name || 'User'}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center justify-center gap-2 w-full py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors border border-transparent hover:border-red-100"
                    >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto relative">
                <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>
                <div className="relative z-10">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default InstructorLayout;
