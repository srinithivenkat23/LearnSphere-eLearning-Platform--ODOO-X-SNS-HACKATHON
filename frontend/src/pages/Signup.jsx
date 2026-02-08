import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { ArrowRight, CheckCircle, Smartphone, Globe, Shield } from 'lucide-react';

export default function Signup({ defaultRole = 'learner', secretCodeRequired = false, title = "Create Account" }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState(defaultRole);
    const [secretCode, setSecretCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { signup } = useAuth();

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        if (secretCodeRequired && secretCode !== 'ADMIN_SECRET') {
            setError("Invalid Admin Secret Code");
            return;
        }

        setLoading(true);

        try {
            const result = await signup(name, email, password, role);

            if (result.success) {
                if (role === 'instructor' || role === 'admin') {
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
            <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden text-white flex-col justify-between p-16">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-700 to-indigo-900 opacity-90 z-10"></div>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center"></div>

                <div className="relative z-20">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-8 border border-white/30">
                        <span className="font-bold text-2xl">LS</span>
                    </div>
                    <h1 className="text-5xl font-bold leading-tight mb-4">
                        Join the future of<br />
                        online learning.
                    </h1>
                </div>

                <div className="relative z-20 grid grid-cols-2 gap-8">
                    <div>
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mb-4 text-purple-300">
                            <Globe size={20} />
                        </div>
                        <h3 className="font-bold text-lg mb-2">Learn Anywhere</h3>
                        <p className="text-purple-100 text-sm">Access courses from any device, anytime, anywhere.</p>
                    </div>
                    <div>
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mb-4 text-purple-300">
                            <Shield size={20} />
                        </div>
                        <h3 className="font-bold text-lg mb-2">Verified Content</h3>
                        <p className="text-purple-100 text-sm">Curated courses from industry professionals.</p>
                    </div>
                </div>
            </div>

            {/* Right Side - Signup Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50 lg:bg-white">
                <div className="w-full max-w-md animate-fade-in-up">
                    <div className="mb-8">
                        <Link to="/" className="lg:hidden w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center text-white font-bold mb-8">
                            LS
                        </Link>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">{title}</h2>
                        <p className="text-slate-500">
                            {defaultRole === 'learner'
                                ? "Join LearnSphere to start your learning journey and build new skills."
                                : "Start your 30-day free trial. No credit card required."
                            }
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-100 flex items-start gap-2">
                            <div className="mt-0.5">⚠️</div>
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSignup} className="space-y-4">
                        <Input
                            label="Full Name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="John Doe"
                            className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                        />
                        <Input
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="name@company.com"
                            className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                        />
                        <Input
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Create a strong password"
                            className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                        />

                        {secretCodeRequired && (
                            <Input
                                label="Admin Secret Code"
                                type="password"
                                value={secretCode}
                                onChange={(e) => setSecretCode(e.target.value)}
                                required
                                placeholder="Enter secret code"
                                className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                            />
                        )}

                        {!defaultRole && (
                            <div className="pt-2">
                                <label className="block text-sm font-medium text-slate-700 mb-2">I am a...</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setRole('learner')}
                                        className={`p-4 rounded-xl border text-center transition-all ${role === 'learner' ? 'border-purple-600 bg-purple-50 text-purple-900 ring-1 ring-purple-600' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                                    >
                                        <div className="font-bold">Student</div>
                                        <div className="text-xs opacity-75">I want to learn</div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole('instructor')}
                                        className={`p-4 rounded-xl border text-center transition-all ${role === 'instructor' ? 'border-purple-600 bg-purple-50 text-purple-900 ring-1 ring-purple-600' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                                    >
                                        <div className="font-bold">Instructor</div>
                                        <div className="text-xs opacity-75">I want to teach</div>
                                    </button>
                                </div>
                            </div>
                        )}

                        <Button type="submit" className="w-full h-12 text-base shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all transform hover:-translate-y-0.5 bg-gradient-to-r from-purple-600 to-indigo-600" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Get Started'} <ArrowRight size={18} className="ml-2" />
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500">
                            Already have an account?{' '}
                            <Link to="/login" className="text-purple-600 font-bold hover:text-purple-700 transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
