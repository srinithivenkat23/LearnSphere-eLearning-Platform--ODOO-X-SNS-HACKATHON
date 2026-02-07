import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Construction } from 'lucide-react';
import Button from '../components/ui/Button';

export default function PlaceholderPage({ title, message }) {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-100">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
                    <Construction size={32} />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">{title || "Coming Soon"}</h1>
                <p className="text-slate-500 mb-8 leading-relaxed">
                    {message || "We are working hard to bring you this feature. Please check back later!"}
                </p>
                <div className="flex gap-4 justify-center">
                    <Button variant="outline" onClick={() => navigate(-1)}>
                        <ArrowLeft size={18} className="mr-2" /> Go Back
                    </Button>
                    <Link to="/">
                        <Button>Go Home</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
