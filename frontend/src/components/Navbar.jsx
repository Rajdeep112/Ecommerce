import React, { useEffect, useState } from 'react';
import { HiShoppingCart, HiMiniXMark } from "react-icons/hi2";
import { FaBagShopping } from "react-icons/fa6";
import { GiHamburgerMenu } from "react-icons/gi";
import { FiChevronDown } from "react-icons/fi";
import { useDispatch, useSelector } from 'react-redux';
import { logout, setCredentials } from '../redux/authSlice';
import { setCart } from '../redux/cartSlice';
import Cookies from 'js-cookie';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import userimg from "../assets/userimg.png";
import Logo from "./Logo";

export default function Navbar() {
    const [toggle, setToggle] = useState(false);
    const [openMenu, setOpenMenu] = useState(null); // 'admin' | 'account' | null
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);
    const cartItems = useSelector((state) => state.cart.items);
    const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const token = Cookies.get("token");

    useEffect(() => {
        const fetchUser = async () => {
            const userCookie = Cookies.get('user');
            if (!userCookie || !token) return;
            try {
                const user = JSON.parse(userCookie);
                const id = user.id
                const res = await axios.post(
                    'http://localhost:3000/getuser',
                    { id },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const fetchedUser = res.data;

                dispatch(setCredentials({ user: fetchedUser, token }));
                Cookies.set('user', JSON.stringify({ id: fetchedUser.id, name: fetchedUser.name }));
            } catch (err) {
                console.error("Fetch user failed:", err);
            }
        };

        fetchUser();
    }, [navigate]);

    useEffect(() => {
        const fetchCartCount = async () => {
            if (!token) {
                dispatch(setCart([]));
                return;
            }
            try {
                const res = await axios.get('http://localhost:3000/cart/', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                dispatch(setCart(res.data?.items || []));
            } catch (err) {
                console.error("Fetch cart count failed:", err);
            }
        };

        fetchCartCount();
    }, [token, dispatch]);

    useEffect(() => {
        const closeMenu = () => setOpenMenu(null);
        document.addEventListener('click', closeMenu);
        return () => document.removeEventListener('click', closeMenu);
    }, []);

    const handleLogout = () => {
        Swal.fire({
            title: `Are you sure you want to logout, ${user?.name}?`,
            text: "You will be logged out of your account.",
            icon: 'warning',
        iconColor: '#059669',
            showCancelButton: true,
            confirmButtonColor: '#059669',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, log out!',
        }).then((result) => {
            if (result.isConfirmed) {
                dispatch(logout());
                Cookies.remove("token");
                Cookies.remove("user");
                Cookies.remove("role");
                navigate("/auth");
                setToggle(false);
                Swal.fire('Logged out!', `${user?.name} has been logged out successfully.`, 'success','#059669',);
            }
        });
    };

    return (
        <div className='relative'>
            <section className='fixed z-30 bg-white top-0 left-0 w-full border shadow-md py-[10px] md:py-[0px]'>
                <div className='w-[95%] lg:w-[80%] flex items-center mx-auto '>
                    <Link to={"/"} className='flex items-end duration-500 cursor-pointer hover:scale-[1.04] flex-shrink-0'>
                        <Logo size="md" />
                    </Link>

                    {/* Desktop Nav */}
                    <ul className='items-center ml-auto hidden md:flex flex-nowrap text-[#74818F] gap-0 justify-end'>
                        <Link to="/" className='navlink whitespace-nowrap'>Home</Link>

                        {user?.role == "admin" && (
                            <li
                                className='relative list-none'
                                onMouseEnter={() => setOpenMenu('admin')}
                                onMouseLeave={() => setOpenMenu((m) => (m === 'admin' ? null : m))}
                            >
                                <span
                                    onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === 'admin' ? null : 'admin'); }}
                                    className='navlink whitespace-nowrap flex items-center gap-1'
                                >
                                    Admin <FiChevronDown className='text-[14px]' />
                                </span>
                                <ul className={`absolute left-0 top-full ${openMenu === 'admin' ? 'flex' : 'hidden'} flex-col bg-white border shadow-lg min-w-[160px] z-50`}>
                                    <Link to="/dashboard" onClick={() => setOpenMenu(null)} className='px-4 py-3 hover:bg-[#059669] hover:text-white whitespace-nowrap'>Dashboard</Link>
                                    <Link to="/allusers" onClick={() => setOpenMenu(null)} className='px-4 py-3 hover:bg-[#059669] hover:text-white whitespace-nowrap'>Users</Link>
                                    <Link to="/allproducts" onClick={() => setOpenMenu(null)} className='px-4 py-3 hover:bg-[#059669] hover:text-white whitespace-nowrap'>Products</Link>
                                    <Link to="/allorders" onClick={() => setOpenMenu(null)} className='px-4 py-3 hover:bg-[#059669] hover:text-white whitespace-nowrap'>Orders</Link>
                                    <Link to="/contact-messages" onClick={() => setOpenMenu(null)} className='px-4 py-3 hover:bg-[#059669] hover:text-white whitespace-nowrap'>Messages</Link>
                                </ul>
                            </li>
                        )}

                        {token && (
                            <li
                                className='relative list-none'
                                onMouseEnter={() => setOpenMenu('account')}
                                onMouseLeave={() => setOpenMenu((m) => (m === 'account' ? null : m))}
                            >
                                <span
                                    onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === 'account' ? null : 'account'); }}
                                    className='navlink whitespace-nowrap flex items-center gap-1'
                                >
                                    My Account <FiChevronDown className='text-[14px]' />
                                </span>
                                <ul className={`absolute left-0 top-full ${openMenu === 'account' ? 'flex' : 'hidden'} flex-col bg-white border shadow-lg min-w-[160px] z-50`}>
                                    <Link to="/addproduct" onClick={() => setOpenMenu(null)} className='px-4 py-3 hover:bg-[#059669] hover:text-white whitespace-nowrap'>Add Product</Link>
                                    <Link to="/orders" onClick={() => setOpenMenu(null)} className='px-4 py-3 hover:bg-[#059669] hover:text-white whitespace-nowrap'>My Orders</Link>
                                    <Link to="/profile" onClick={() => setOpenMenu(null)} className='px-4 py-3 hover:bg-[#059669] hover:text-white whitespace-nowrap'>Profile</Link>
                                </ul>
                            </li>
                        )}

                        <Link to="/contact" className='navlink whitespace-nowrap'>Contact</Link>
                    </ul>

                    {user && (
                        <Link to="/profile" className='hidden md:block ml-5 flex-shrink-0'>
                            <img
                                src={user?.userimg ? `http://localhost:3000${user.userimg}` : userimg}
                                className='h-[40px] w-[40px] min-w-[40px] object-cover rounded-full transition-all duration-500 cursor-pointer hover:scale-[1.08]'
                                alt="user"
                            />
                        </Link>
                    )}

                    <div className="ml-5 hidden md:block relative flex-shrink-0">
                        <Link to="/cart" className="relative block">
                            <FaBagShopping className='text-[23px] text-[#059669] cursor-pointer transition duration-300 hover:scale-110' />
                            {cartCount > 0 && (
                                <span className='absolute -top-2 -right-2 bg-[#059669] text-white text-[10px] font-semibold rounded-full h-[18px] w-[18px] flex items-center justify-center'>
                                    {cartCount > 99 ? '99+' : cartCount}
                                </span>
                            )}
                        </Link>
                    </div>

                    {!token ? (
                        <div className="ml-5 hidden md:block flex-shrink-0">
                            <button onClick={() => navigate("/auth")} className="btn px-[20px] whitespace-nowrap">Login</button>
                        </div>
                    ) : (
                        <div className="ml-5 hidden md:block flex-shrink-0">
                            <button onClick={handleLogout} className="btn px-[20px] whitespace-nowrap">Logout</button>
                        </div>
                    )}

                    {/* Mobile Profile Image */}
                    {user && (
                        <Link to="/profile" className='block md:hidden absolute top-[20px] right-[70px]'>
                            <img
                                src={user.userimg ? `http://localhost:3000${user.userimg}` : userimg}
                                className='h-[35px] w-[35px] object-cover rounded-full hover:rounded-full transition-all duration-500 cursor-pointer hover:scale-[1.08] '
                                alt="user"
                            />
                        </Link>
                    )}

                    {/* Mobile Toggle Button */}
                    <div className='ml-auto block md:hidden'>
                        <GiHamburgerMenu onClick={() => setToggle(true)} className='text-[29px] text-[#059669] cursor-pointer duration-300 hover:scale-110' />
                    </div>
                </div>
            </section>

            {/* Mobile Menu */}
            <div className={`${toggle ? "translate-x-0" : "translate-x-full"} fixed top-0 right-0 z-40 w-[280px] h-screen bg-[#059669] transition-transform duration-500 block md:hidden`}>
                <HiMiniXMark onClick={() => setToggle(false)} className='text-white text-[45px] absolute top-3 right-3 cursor-pointer duration-300 hover:scale-110 hover:rotate-90' />

                <ul className='flex flex-col text-center mt-20 text-white font-medium overflow-scroll h-full'>
                    <Link to="/" onClick={() => setToggle(false)} className='mobnavlink'>Home</Link>

                    {user?.role == "admin" && (
                        <details>
                            <summary className='mobnavlink cursor-pointer list-none'>Admin ▾</summary>
                            <div className='flex flex-col bg-[#047857]'>
                                <Link to="/dashboard" onClick={() => setToggle(false)} className='mobnavlink'>Dashboard</Link>
                                <Link to="/allusers" onClick={() => setToggle(false)} className='mobnavlink'>Users</Link>
                                <Link to="/allproducts" onClick={() => setToggle(false)} className='mobnavlink'>Products</Link>
                                <Link to="/allorders" onClick={() => setToggle(false)} className='mobnavlink'>Orders</Link>
                                <Link to="/contact-messages" onClick={() => setToggle(false)} className='mobnavlink'>Messages</Link>
                            </div>
                        </details>
                    )}

                    {token && (
                        <details>
                            <summary className='mobnavlink cursor-pointer list-none'>My Account ▾</summary>
                            <div className='flex flex-col bg-[#047857]'>
                                <Link to="/addproduct" onClick={() => setToggle(false)} className='mobnavlink'>Add Product</Link>
                                <Link to="/orders" onClick={() => setToggle(false)} className='mobnavlink'>My Orders</Link>
                                <Link to="/profile" onClick={() => setToggle(false)} className='mobnavlink'>Profile</Link>
                            </div>
                        </details>
                    )}

                    <Link to="/cart" onClick={() => setToggle(false)} className='mobnavlink'>Cart{cartCount > 0 ? ` (${cartCount})` : ''}</Link>
                    <Link to="/contact" onClick={() => setToggle(false)} className='mobnavlink'>Contact</Link>
                    {user ? (
                        <button onClick={handleLogout} className='mobnavlink'>Logout</button>
                    ) : (
                        <Link to="/auth" onClick={() => setToggle(false)} className='mobnavlink '>Login</Link>
                    )}
                </ul>
            </div>
        </div>
    );
}
