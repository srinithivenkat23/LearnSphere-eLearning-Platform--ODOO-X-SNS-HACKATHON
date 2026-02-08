import { useState } from 'react';
import { Briefcase, TrendingUp, Target, Rocket, Code, Palette, DollarSign, Users, CheckCircle, ArrowRight, Star, Award } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function CareerPathways() {
    const [selectedPath, setSelectedPath] = useState(null);

    const pathways = [
        {
            id: 1,
            title: 'Software Engineer',
            icon: Code,
            color: 'blue',
            salary: '$95K - $180K',
            growth: '+22%',
            demand: 'Very High',
            description: 'Build the future with code. Design, develop, and maintain software applications.',
            skills: ['JavaScript', 'Python', 'React', 'Node.js', 'SQL'],
            courses: ['Full Stack Development', 'Data Structures', 'System Design'],
            timeline: '6-12 months',
            jobs: '125,000+ openings'
        },
        {
            id: 2,
            title: 'UX/UI Designer',
            icon: Palette,
            color: 'purple',
            salary: '$70K - $140K',
            growth: '+18%',
            demand: 'High',
            description: 'Create beautiful, intuitive experiences that users love.',
            skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
            courses: ['UX Fundamentals', 'Visual Design', 'Interaction Design'],
            timeline: '4-8 months',
            jobs: '45,000+ openings'
        },
        {
            id: 3,
            title: 'Data Scientist',
            icon: TrendingUp,
            color: 'emerald',
            salary: '$100K - $200K',
            growth: '+31%',
            demand: 'Very High',
            description: 'Turn data into insights. Use ML and statistics to solve complex problems.',
            skills: ['Python', 'Machine Learning', 'Statistics', 'SQL', 'Tableau'],
            courses: ['Data Analysis', 'Machine Learning', 'Deep Learning'],
            timeline: '8-14 months',
            jobs: '78,000+ openings'
        },
        {
            id: 4,
            title: 'Product Manager',
            icon: Target,
            color: 'amber',
            salary: '$90K - $170K',
            growth: '+20%',
            demand: 'High',
            description: 'Lead product vision and strategy. Bridge business and technology.',
            skills: ['Product Strategy', 'Agile', 'Analytics', 'Roadmapping'],
            courses: ['Product Management', 'User Research', 'Business Strategy'],
            timeline: '5-10 months',
            jobs: '52,000+ openings'
        },
        {
            id: 5,
            title: 'Digital Marketer',
            icon: Rocket,
            color: 'rose',
            salary: '$55K - $110K',
            growth: '+15%',
            demand: 'Medium',
            description: 'Drive growth through digital channels. Master SEO, content, and analytics.',
            skills: ['SEO', 'Content Marketing', 'Google Analytics', 'Social Media'],
            courses: ['Digital Marketing', 'SEO Mastery', 'Content Strategy'],
            timeline: '3-6 months',
            jobs: '68,000+ openings'
        },
        {
            id: 6,
            title: 'Financial Analyst',
            icon: DollarSign,
            color: 'indigo',
            salary: '$65K - $130K',
            growth: '+12%',
            demand: 'Medium',
            description: 'Analyze financial data and guide business decisions.',
            skills: ['Excel', 'Financial Modeling', 'SQL', 'Tableau'],
            courses: ['Financial Analysis', 'Investment Banking', 'Corporate Finance'],
            timeline: '6-10 months',
            jobs: '42,000+ openings'
        }
    ];

    return (
        <div className="min-h-screen bg-white font-sans">
            {/* Hero */}
            <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-purple-200 text-xs font-bold uppercase tracking-widest mb-6">
                            <Briefcase size={14} /> Career Guidance
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">Find Your Career Path</h1>
                        <p className="text-xl text-purple-100/80 mb-10 leading-relaxed">
                            Discover high-demand careers, required skills, and personalized learning paths to achieve your professional goals.
                        </p>
                    </div>
                </div>
            </div>

            {/* Career Cards */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-black text-slate-900 mb-3">Explore Career Pathways</h2>
                    <p className="text-slate-500 max-w-2xl mx-auto">
                        Click on any career to see detailed information, required skills, and recommended courses.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {pathways.map(path => {
                        const Icon = path.icon;
                        const isSelected = selectedPath === path.id;

                        return (
                            <Card
                                key={path.id}
                                onClick={() => setSelectedPath(isSelected ? null : path.id)}
                                className={`p-6 cursor-pointer transition-all duration-300 ${isSelected
                                        ? `border-2 border-${path.color}-500 shadow-2xl shadow-${path.color}-500/20 scale-105`
                                        : 'border-slate-100 hover:shadow-xl hover:scale-102'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-4 rounded-2xl bg-${path.color}-50 text-${path.color}-600`}>
                                        <Icon size={32} />
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${path.demand === 'Very High' ? 'bg-emerald-100 text-emerald-700' :
                                            path.demand === 'High' ? 'bg-blue-100 text-blue-700' :
                                                'bg-slate-100 text-slate-600'
                                        }`}>
                                        {path.demand} Demand
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 mb-2">{path.title}</h3>
                                <p className="text-sm text-slate-500 mb-4 leading-relaxed">{path.description}</p>

                                <div className="space-y-3 mb-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Salary Range</span>
                                        <span className="text-lg font-black text-slate-900">{path.salary}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Growth Rate</span>
                                        <span className={`text-sm font-bold text-emerald-600 flex items-center gap-1`}>
                                            <TrendingUp size={14} /> {path.growth}
                                        </span>
                                    </div>
                                </div>

                                {isSelected && (
                                    <div className="mt-6 pt-6 border-t border-slate-100 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Key Skills</p>
                                            <div className="flex flex-wrap gap-2">
                                                {path.skills.map((skill, i) => (
                                                    <span key={i} className={`px-2 py-1 bg-${path.color}-50 text-${path.color}-700 text-xs font-bold rounded`}>
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Recommended Courses</p>
                                            <ul className="space-y-1">
                                                {path.courses.map((course, i) => (
                                                    <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                                                        <CheckCircle size={14} className="text-emerald-500" />
                                                        {course}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 pt-2">
                                            <div className="text-center p-3 bg-slate-50 rounded-xl">
                                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Timeline</p>
                                                <p className="text-sm font-black text-slate-900">{path.timeline}</p>
                                            </div>
                                            <div className="text-center p-3 bg-slate-50 rounded-xl">
                                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Job Market</p>
                                                <p className="text-sm font-black text-slate-900">{path.jobs}</p>
                                            </div>
                                        </div>

                                        <Button className={`w-full bg-${path.color}-600 hover:bg-${path.color}-700`}>
                                            Start Learning Path <ArrowRight size={16} className="ml-2" />
                                        </Button>
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-slate-900 text-white py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <Award size={48} className="mx-auto mb-6 text-amber-400" />
                    <h2 className="text-4xl font-black mb-4">Not Sure Where to Start?</h2>
                    <p className="text-lg text-slate-300 mb-8">
                        Take our free career assessment to discover the perfect path based on your skills and interests.
                    </p>
                    <Button className="h-14 px-10 bg-white text-slate-900 hover:bg-slate-100 font-bold text-lg">
                        Take Career Quiz
                    </Button>
                </div>
            </div>
        </div>
    );
}
