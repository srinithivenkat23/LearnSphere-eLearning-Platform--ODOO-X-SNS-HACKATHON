import { Link, useLocation } from 'react-router-dom';
import { User, BookOpen, Shield, GraduationCap, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';

export default function AuthLanding() {
    const location = useLocation();
    const isSignup = location.pathname.includes('signup');
    const actionText = isSignup ? 'Sign Up' : 'Log In';
    const subText = isSignup ? 'Join as a' : 'Log in as';

    const roles = [
        {
            id: 'learner',
            title: 'Student',
            description: 'Learn new skills, earn certificates, and advance your career.',
            icon: GraduationCap,
            color: 'bg-blue-50 text-blue-600',
            border: 'hover:border-blue-500',
            path: isSignup ? '/learner/signup' : '/learner/login'
        },
        {
            id: 'instructor',
            title: 'Instructor',
            description: 'Share your knowledge, and manage your students.',
            icon: BookOpen,
            color: 'bg-purple-50 text-purple-600',
            border: 'hover:border-purple-500',
            path: isSignup ? '/instructor/signup' : '/instructor/login'
        },
        {
            id: 'admin',
            title: 'Admin',
            description: 'Manage the platform and users',
            icon: Shield,
            color: 'bg-emerald-50 text-emerald-600',
            border: 'hover:border-emerald-500',
            path: isSignup ? '/admin/signup' : '/admin/login'
        }
    ];

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
            <div className="w-full max-w-4xl">
                <div className="text-center mb-12">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30 mb-6 text-2xl">
                        LS
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">{actionText} to LearnSphere</h1>
                    <p className="text-slate-500 text-lg">Choose your account type to continue</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {roles.map((role) => (
                        <Link
                            key={role.id}
                            to={role.path}
                            className={`bg-white p-8 rounded-2xl border-2 border-transparent shadow-xl shadow-slate-200/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl ${role.border}`}
                        >
                            <div className={`w-14 h-14 rounded-xl ${role.color} flex items-center justify-center mb-6`}>
                                <role.icon size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">{role.title}</h3>
                            <p className="text-slate-500 mb-6 text-sm">{role.description}</p>

                            <div className="flex items-center text-sm font-bold font-medium group text-slate-900">
                                {subText} {role.title}
                                <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-slate-500">
                        {isSignup ? 'Already have an account?' : "Don't have an account?"}
                        <Link
                            to={isSignup ? '/login' : '/signup'}
                            className="ml-2 font-bold text-blue-600 hover:text-blue-700 hover:underline"
                        >
                            {isSignup ? 'Log in' : 'Sign up'}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
