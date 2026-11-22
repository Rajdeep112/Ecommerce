import { useEffect, useState } from "react";
import axios from 'axios';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';
import { formatINR } from '../utils/formatCurrency';

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const STATUS_COLORS = {
    pending: 'bg-yellow-500',
    confirmed: 'bg-blue-500',
    shipped: 'bg-purple-500',
    delivered: 'bg-green-600',
    cancelled: 'bg-red-600',
};

export default function AllOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = Cookies.get('token');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await axios.get('http://localhost:3000/orders/', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOrders(res.data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        const previousOrders = orders;
        setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));

        try {
            await axios.put(
                `http://localhost:3000/orders/${orderId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            Swal.fire({
                icon: 'success',
                iconColor: '#059669',
                title: 'Order Updated!',
                text: `Order #${orderId} marked as ${newStatus}.`,
                confirmButtonColor: '#059669',
                timer: 1500,
                showConfirmButton: false,
            });
        } catch (error) {
            console.error('Error updating order status:', error);
            setOrders(previousOrders);
            Swal.fire({
                icon: 'error',
                iconColor: '#059669',
                title: 'Error',
                text: error.response?.data?.message || 'Could not update order status.',
                confirmButtonColor: '#059669',
            });
        }
    };

    // Group orders by customer
    const grouped = orders.reduce((acc, order) => {
        const key = order.user_id;
        if (!acc[key]) {
            acc[key] = {
                customer_name: order.customer_name,
                customer_email: order.customer_email,
                orders: [],
            };
        }
        acc[key].orders.push(order);
        return acc;
    }, {});

    if (loading) return <p className="text-center my-[80px] skeleton h-6 w-40 mx-auto rounded"></p>;

    return (
        <section className='w-[95%] lg:w-[80%] mx-auto my-[80px] min-h-screen animate-fadeInUp'>
            <h1 className="text-[28px] font-semibold mb-6">All Orders</h1>

            {Object.keys(grouped).length === 0 ? (
                <p className="text-center text-ink-500">No orders placed yet</p>
            ) : (
                Object.entries(grouped).map(([userId, group]) => (
                    <div key={userId} className="mb-10 card overflow-hidden">
                        <div className="bg-brand-600 text-white px-4 py-3 flex justify-between items-center flex-wrap gap-2">
                            <p className="font-semibold text-[18px]">{group.customer_name}</p>
                            <p className="text-sm">{group.customer_email}</p>
                        </div>

                        <div className="divide-y">
                            {group.orders.map((order) => (
                                <div key={order.id} className="p-4 hover:bg-ink-50 transition-colors">
                                    <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
                                        <div>
                                            <p className="font-semibold">Order #{order.id}</p>
                                            <p className="text-sm text-ink-500">
                                                {order.created_at ? new Date(order.created_at).toLocaleString() : ''}
                                            </p>
                                            {order.full_name && (
                                                <p className="text-sm text-ink-600 mt-1">
                                                    Ship to: {order.full_name}, {order.line1}
                                                    {order.line2 ? `, ${order.line2}` : ''}, {order.city}, {order.state} - {order.pincode} ({order.phone})
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2 py-1 rounded text-white text-xs capitalize ${STATUS_COLORS[order.status] || 'bg-gray-500'}`}>
                                                {order.status}
                                            </span>
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                className="border rounded px-2 py-1 text-sm"
                                            >
                                                {STATUS_OPTIONS.map((s) => (
                                                    <option key={s} value={s} className="capitalize">{s}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex justify-between text-sm">
                                                <p>{item.product_name} × {item.quantity}</p>
                                                <p>{formatINR(item.price * item.quantity)}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-between mt-2 pt-2 border-t font-semibold">
                                        <p>Total</p>
                                        <p>{formatINR(order.total_amount)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </section>
    );
}
