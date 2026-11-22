import { useEffect, useState } from "react";
import axios from 'axios';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';
import { GoX } from "react-icons/go";

export default function ContactMessages() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = Cookies.get('token');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const fetchMessages = async () => {
        try {
            const res = await axios.get('http://localhost:3000/contact-messages', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessages(res.data || []);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleMarkRead = async (id) => {
        const previous = messages;
        setMessages(messages.map((m) => (m.id === id ? { ...m, is_read: 1 } : m)));
        try {
            await axios.put(`http://localhost:3000/contact-messages/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (error) {
            console.error('Error marking message read:', error);
            setMessages(previous);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This message will be permanently deleted.',
            icon: 'warning',
            iconColor: '#059669',
            showCancelButton: true,
            confirmButtonColor: '#059669',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
        });

        if (!result.isConfirmed) return;

        const previous = messages;
        setMessages(messages.filter((m) => m.id !== id));

        try {
            await axios.delete(`http://localhost:3000/contact-messages/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (error) {
            console.error('Error deleting message:', error);
            setMessages(previous);
            Swal.fire({
                icon: 'error',
                iconColor: '#059669',
                title: 'Error',
                text: 'Could not delete the message.',
                confirmButtonColor: '#059669',
            });
        }
    };

    if (loading) return <p className="text-center my-[80px]">Loading messages...</p>;

    return (
        <section className='w-[95%] lg:w-[80%] mx-auto my-[80px] min-h-screen animate-fadeInUp'>
            <h1 className="text-[28px] font-semibold mb-6">Get In Touch Messages</h1>

            {messages.length === 0 ? (
                <p className="text-center text-ink-500">No messages received yet</p>
            ) : (
                <div className="flex flex-col gap-4">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            onClick={() => !msg.is_read && handleMarkRead(msg.id)}
                            className={`card p-4 cursor-pointer hover:bg-ink-50 transition-colors ${msg.is_read ? 'bg-white' : 'bg-brand-50 border-brand-600'}`}
                        >
                            <div className="flex justify-between items-start flex-wrap gap-2">
                                <div>
                                    <p className="font-semibold text-[18px]">
                                        {msg.name} {!msg.is_read && <span className="text-xs bg-brand-600 text-white px-2 py-0.5 rounded ml-2">New</span>}
                                    </p>
                                    <p className="text-sm text-ink-600">{msg.email}</p>
                                    {msg.subject && <p className="text-sm font-medium mt-1">Subject: {msg.subject}</p>}
                                </div>
                                <div className="flex items-center gap-3">
                                    <p className="text-xs text-ink-500">
                                        {msg.created_at ? new Date(msg.created_at).toLocaleString() : ''}
                                    </p>
                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(msg.id); }}>
                                        <GoX className="text-[24px] text-red-600 hover:rotate-90 duration-500" />
                                    </button>
                                </div>
                            </div>
                            <p className="mt-3 text-ink-700">{msg.message}</p>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
