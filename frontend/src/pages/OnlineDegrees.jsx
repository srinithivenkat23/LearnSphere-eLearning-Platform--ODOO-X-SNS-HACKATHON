import { useState } from 'react';
import { GraduationCap, Award, Clock, Users, CheckCircle, Star, TrendingUp, Globe, BookOpen } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function OnlineDegrees() {
    const [selectedCategory, setSelectedCategory] = useState('all');

    const degrees = [
        {
            id: 1,
            title: 'Master of Computer Science',
            university: 'Stanford University',
            duration: '24 months',
            rating: 4.8,
            students: '12,450',
            category: 'technology',
            price: '$15,000',
            skills: ['AI & ML', 'Cloud Computing', 'Software Engineering'],
            accredited: true
        },
        {
            id: 2,
            title: 'MBA in Digital Business',
            university: 'Harvard Business School',
            duration: '18 months',
            rating: 4.9,
            students: '8,920',
            category: 'business',
            price: '$22,000',
            skills: ['Strategy', 'Leadership', 'Digital Marketing'],
            accredited: true
        },
        {
            id: 3,
            title: 'Bachelor of Data Science',
            university: 'MIT',
            duration: '36 months',
            rating: 4.7,
            students: '15,200',
            category: 'technology',
            price: '$18,500',
            skills: ['Statistics', 'Python', 'Big Data'],
            accredited: true
        },
        {
            id: 4,
            title: 'Master of UX Design',
            university: 'California Institute of Arts',
            duration: '12 months',
            rating: 4.6,
            students: '6,340',
            category: 'design',
            price: '$12,000',
            skills: ['UI/UX', 'Prototyping', 'User Research'],
            accredited: true
        },
        {
            id: 5,
            title: 'MBA in Finance',
            university: 'Wharton School',
            duration: '20 months',
            rating: 4.9,
            students: '9,870',
            category: 'business',
            price: '$25,000',
            skills: ['Investment', 'Risk Management', 'Analytics'],
            accredited: true
        },
        {
            id: 6,
            title: 'Master of Cybersecurity',
            university: 'Georgia Tech',
            duration: '18 months',
            rating: 4.7,
            students: '7,650',
            category: 'technology',
            price: '$14,000',
            skills: ['Network Security', 'Ethical Hacking', 'Cryptography'],
            accredited: true
        }
    ];

    const categories = [
        { id: 'all', label: 'All Programs', count: degrees.length },
        { id: 'technology', label: 'Technology', count: degrees.filter(d => d.category === 'technology').length },
        { id: 'business', label: 'Business', count: degrees.filter(d => d.category === 'business').length },
        { id: 'design', label: 'Design', count: degrees.filter(d => d.category === 'design').length }
    ];

    const filteredDegrees = selectedCategory === 'all'
        ? degrees
        : degrees.filter(d => d.category === selectedCategory);

    return (
        <div className="min-h-screen bg-white font-sans">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-blue-200 text-xs font-bold uppercase tracking-widest mb-6">
                            <GraduationCap size={14} /> Accredited Programs
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">Earn Your Degree Online</h1>
                        <p className="text-xl text-blue-100/80 mb-10 leading-relaxed">
                            Study from world-class universities. Advance your career with recognized degrees in technology, business, and design.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Button className="h-14 px-10 bg-white text-blue-900 hover:bg-blue-50 font-bold text-lg shadow-2xl">
                                Browse Programs
                            </Button>
                            <Button variant="outline" className="h-14 px-10 border-2 border-white text-white hover:bg-white/10 font-bold text-lg">
                                Download Brochure
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="bg-slate-50 border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { icon: Globe, label: 'Partner Universities', value: '50+' },
                            { icon: Users, label: 'Active Students', value: '125K+' },
                            { icon: Award, label: 'Degree Programs', value: '200+' },
                            { icon: TrendingUp, label: 'Avg. Salary Increase', value: '45%' }
                        ].map((stat, i) => (
                            <div key={i} className="text-center">
                                <stat.icon className="mx-auto mb-3 text-blue-600" size={32} />
                                <p className="text-3xl font-black text-slate-900 mb-1">{stat.value}</p>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Category Filters */}
                <div className="flex flex-wrap gap-3 mb-12 justify-center">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${selectedCategory === cat.id
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            {cat.label} ({cat.count})
                        </button>
                    ))}
                </div>

                {/* Degree Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredDegrees.map(degree => (
                        <Card key={degree.id} className="p-0 overflow-hidden hover:shadow-2xl transition-all duration-300 group border-slate-100">
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-8 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full -translate-y-16 translate-x-16"></div>
                                {degree.accredited && (
                                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                        <CheckCircle size={12} /> Accredited
                                    </div>
                                )}
                                <GraduationCap size={40} className="mb-4 opacity-90" />
                                <h3 className="text-xl font-bold mb-2 leading-tight">{degree.title}</h3>
                                <p className="text-blue-100 text-sm font-medium">{degree.university}</p>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-1 text-slate-500">
                                        <Clock size={14} />
                                        <span className="font-bold">{degree.duration}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-amber-500">
                                        <Star size={14} fill="currentColor" />
                                        <span className="font-bold text-slate-900">{degree.rating}</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {degree.skills.map((skill, i) => (
                                        <span key={i} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded">
                                            {skill}
                                        </span>
                                    ))}
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Total Cost</p>
                                        <p className="text-2xl font-black text-slate-900">{degree.price}</p>
                                    </div>
                                    <Button className="bg-blue-600 hover:bg-blue-700">
                                        Learn More
                                    </Button>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <Users size={12} />
                                    <span className="font-bold">{degree.students} students enrolled</span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
