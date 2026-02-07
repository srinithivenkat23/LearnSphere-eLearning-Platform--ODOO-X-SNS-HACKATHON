import { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Mail, UserPlus, Send } from 'lucide-react';

export function AddAttendeeModal({ isOpen, onClose, onAdd }) {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd({ name, email });
        setEmail('');
        setName('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Attendee">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Learner Name"
                    placeholder="e.g. John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <Input
                    label="Email Address"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <div className="flex gap-3 pt-4">
                    <Button variant="outline" className="flex-1" onClick={onClose} type="button">Cancel</Button>
                    <Button className="flex-1" type="submit">
                        <UserPlus size={18} className="mr-2" />
                        Invite Learner
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

export function ContactAttendeesModal({ isOpen, onClose, attendeesCount }) {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    const handleSend = async (e) => {
        e.preventDefault();
        setSending(true);
        // Mock API call
        await new Promise(r => setTimeout(r, 1000));
        alert(`Message sent to ${attendeesCount} attendees!`);
        setSending(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Contact Attendees (${attendeesCount})`}>
            <form onSubmit={handleSend} className="space-y-4">
                <Input
                    label="Subject"
                    placeholder="Important update about the course"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                />
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                    <textarea
                        rows={5}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Write your email here..."
                        required
                    />
                </div>
                <div className="flex gap-3 pt-4">
                    <Button variant="outline" className="flex-1" onClick={onClose} type="button">Discard</Button>
                    <Button className="flex-1" type="submit" disabled={sending}>
                        <Send size={18} className="mr-2" />
                        {sending ? 'Sending...' : 'Send Email'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
