import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { formatINR } from '../utils/formatCurrency';

export default function OrderHistory() {
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        if (user === null) {
            navigate("/auth");
        }
    }, [user]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = Cookies.get('token');
                const res = await axios.get('http://localhost:3000/orders/my', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setOrders(res.data || []);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (!user) return null;

    return (
        <section className='w-[95%] md:w-[80%] mx-auto mt-[100px] min-h-screen animate-fadeInUp'>
            <h2 className='text-2xl p color text-center my-[40px]'>My Orders</h2>
            {loading ? (
                <p className="text-center">Loading orders...</p>
            ) : orders.length === 0 ? (
                <p className="text-center">You have not placed any orders yet.</p>
            ) : (
                <div className='flex flex-col gap-4'>
                    {orders.map((order) => (
                        <div key={order.id} className='card p-[20px] hover:bg-ink-50 transition-colors'>
                            <div className='flex flex-wrap justify-between items-center mb-3'>
                                <p className='font-semibold color'>Order #{order.id}</p>
                                <p className='text-sm capitalize'>Status: {order.status}</p>
                                <p className='text-sm'>{order.createdat}</p>
                                <p className='font-semibold color'>{formatINR(order.total || order.totalAmount)}</p>
                            </div>
                            <div className='flex flex-col gap-2'>
                                {(order.items || []).map((item) => (
                                    <div key={item.id || item.productId} className='flex items-center gap-3'>
                                        {item.image && (
                                            <img src={`http://localhost:3000${item.image}`} alt={item.name} className='w-[50px] h-[50px] object-cover rounded' />
                                        )}
                                        <p>{item.name} x {item.quantity}</p>
                                        <p className='ml-auto'>{formatINR(item.price)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
