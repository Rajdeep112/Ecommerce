import React, { useEffect, useState } from 'react'
import { HiUsers } from "react-icons/hi2";
import { RiBankCard2Fill } from "react-icons/ri";
import { FaShippingFast } from "react-icons/fa";
import { BsBagCheckFill } from "react-icons/bs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import Cookies from 'js-cookie';
import { formatINR } from '../utils/formatCurrency';


export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = Cookies.get('token');
                const res = await axios.get('http://localhost:3000/dashboard/stats', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setStats(res.data);
            } catch (err) {
                console.error("Error fetching dashboard stats:", err);
                setError("Could not load dashboard stats.");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const dailySeries = stats?.dailySeries || [];
    const totalOrdersByStatus = stats?.ordersByStatus || [];

    return (
        <div className='w-[95%] lg:w-[80%] mx-auto my-[80px] min-h-screen animate-fadeInUp'>
            <h1 className='text-[40px] font-semibold p color'>Dashboard</h1>
            {error && <p className="text-red-500">{error}</p>}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-[10px]'>
                <div className='group border-[2px] rounded-[5px] border-brand-600 hover:bg-brand-600 hover:cursor-pointer flex items-center gap-[10px] px-[20px] py-[7px] duration-500 hover:-translate-y-0.5 transition-transform '>
                    <HiUsers className='text-[60px] color group-hover:text-white' />
                    <div className='flex flex-col'>
                        <p className='text-[20px] group-hover:text-white'>Total Users</p>
                        <p className='color group-hover:text-white font-bold text-[17px]'>{loading ? "..." : (stats?.totalUsers ?? 0)}+</p>
                    </div>
                </div>
                <div className='group border-[2px] rounded-[5px] border-brand-600 hover:bg-brand-600 hover:cursor-pointer flex items-center gap-[10px] px-[20px] py-[7px] duration-500 hover:-translate-y-0.5 transition-transform '>
                    <RiBankCard2Fill className='text-[60px] color group-hover:text-white' />
                    <div className='flex flex-col'>
                        <p className='text-[20px] group-hover:text-white'>Listed Products</p>
                        <p className='color group-hover:text-white font-bold text-[17px]'>{loading ? "..." : (stats?.totalProducts ?? 0)}+</p>
                    </div>
                </div>
                <div className='group border-[2px] rounded-[5px] border-brand-600 hover:bg-brand-600 hover:cursor-pointer flex items-center gap-[10px] px-[20px] py-[7px] duration-500 hover:-translate-y-0.5 transition-transform '>
                    <FaShippingFast className='text-[60px] color group-hover:text-white' />
                    <div className='flex flex-col'>
                        <p className='text-[20px] group-hover:text-white'>Total Orders</p>
                        <p className='color group-hover:text-white font-bold text-[17px]'>{loading ? "..." : (stats?.totalOrders ?? 0)}+</p>
                    </div>
                </div>
                <div className='group border-[2px] rounded-[5px] border-brand-600 hover:bg-brand-600 hover:cursor-pointer flex items-center gap-[10px] px-[20px] py-[7px] duration-500 hover:-translate-y-0.5 transition-transform '>
                    <BsBagCheckFill className='text-[50px] color group-hover:text-white' />
                    <div className='flex flex-col'>
                        <p className='text-[20px] group-hover:text-white'>Total Revenue</p>
                        <p className='color group-hover:text-white font-bold text-[17px]'>{loading ? "..." : formatINR(stats?.totalRevenue ?? 0)}</p>
                    </div>
                </div>
            </div>

            {totalOrdersByStatus.length > 0 && (
                <div className="flex flex-wrap gap-4 mt-6">
                    {totalOrdersByStatus.map((s) => (
                        <div key={s.status} className="border border-brand-600 rounded px-4 py-2 text-center">
                            <p className="text-sm text-ink-600 capitalize">{s.status}</p>
                            <p className="color font-bold text-[18px]">{s.count}</p>
                        </div>
                    ))}
                </div>
            )}

            <div className="my-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold color">Orders & Revenue (Last 30 Days)</h2>
                </div>
                <ResponsiveContainer height={400} className=" w-full ">
                    <LineChart data={dailySeries}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value, name) => name === 'revenue' ? formatINR(value) : value} />
                        <Line type="monotone"
                            dataKey="orders"
                            stroke="#059669"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 7 }}
                            isAnimationActive={true}
                            animationBegin={300}
                            animationDuration={900}
                            animationEasing="ease-in" />
                        <Line type="monotone"
                            dataKey="revenue"
                            stroke="#047857"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 7 }}
                            isAnimationActive={true}
                            animationBegin={300}
                            animationDuration={900}
                            animationEasing="ease-in" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

        </div>
    )
}
