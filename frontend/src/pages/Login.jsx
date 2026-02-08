import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { ArrowRight, CheckCircle } from 'lucide-react';

export default function Login({ title = "Welcome Back" }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(email, password);

            if (result.success) {
                const isFromInstructorRoute = window.location.pathname.startsWith('/instructor') || window.location.pathname.startsWith('/admin');
                const userData = result.userData;

                if (isFromInstructorRoute && (userData?.role === 'instructor' || userData?.role === 'admin')) {
                    navigate('/instructor');
                } else {
                    navigate('/');
                }
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white">
            {/* Left Side - Brand/Welcome */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden text-white">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-900 opacity-90 z-10"></div>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center"></div>

                <div className="relative z-20 flex flex-col justify-between h-full p-16">
                    <div>
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-8 border border-white/30">
                            <span className="font-bold text-2xl">LS</span>
                        </div>
                        <h1 className="text-5xl font-bold leading-tight mb-6">
                            Master new skills,<br />
                            achieve your goals.
                        </h1>
                        <p className="text-lg text-blue-100 max-w-md">
                            Join thousands of learners on LearnSphere and take your career to the next level with our expert-led courses.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-blue-100">
                            <CheckCircle className="text-blue-400" size={20} />
                            <span>Unlimited access to 100+ courses</span>
                        </div>
                        <div className="flex items-center gap-3 text-blue-100">
                            <CheckCircle className="text-blue-400" size={20} />
                            <span>Learn from industry experts</span>
                        </div>
                        <div className="flex items-center gap-3 text-blue-100">
                            <CheckCircle className="text-blue-400" size={20} />
                            <span>Earn recognized certificates</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50 lg:bg-white">
                <div className="w-full max-w-md animate-fade-in-up">
                    <div className="mb-8">
                        <Link to="/" className="lg:hidden w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold mb-8">
                            LS
                        </Link>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">{title}</h2>
                        <p className="text-slate-500">
                            Please enter your details to sign in.
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-100 flex items-start gap-2">
                            <div className="mt-0.5">⚠️</div>
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <Input
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="name@company.com"
                            className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                        />
                        <div>
                            <Input
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                            />
                            <div className="flex justify-end mt-1">
                                <Link to="#" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        <Button type="submit" className="w-full h-12 text-base shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all transform hover:-translate-y-0.5" disabled={loading}>
                            {loading ? 'Signing In...' : 'Sign In'} <ArrowRight size={18} className="ml-2" />
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
                                Create free account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
