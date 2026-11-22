import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCart } from '../redux/cartSlice'; // Import actions
import { FaBagShopping } from "react-icons/fa6";
import { Link } from 'react-router-dom';
import { GoX } from "react-icons/go";
import axios from 'axios';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';
import { formatINR } from '../utils/formatCurrency';

const Cart = () => {
    const cart = useSelector((state) => state.cart.items); // Get cart items from Redux
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const token = Cookies.get('token');

    const fetchCart = async () => {
        try {
            const res = await axios.get('http://localhost:3000/cart/', {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Normalize backend items to the shape used across the UI
            const items = (res.data?.items || []).map((item) => ({
                id: item.productId ?? item.product_id ?? item.id,
                name: item.name,
                price: item.price,
                image: item.image,
                stock: item.stock,
                quantity: item.quantity,
            }));
            dispatch(setCart(items));
        } catch (error) {
            console.error('Error fetching cart:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const updateQuantity = async (productId, quantity) => {
        const previousCart = cart;
        dispatch(setCart(cart.map((item) => (item.id === productId ? { ...item, quantity } : item))));

        try {
            await axios.put(
                'http://localhost:3000/cart/update',
                { productId, quantity },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (error) {
            console.error('Error updating cart:', error);
            dispatch(setCart(previousCart));
            Swal.fire({
                icon: 'error',
                iconColor: '#059669',
                title: 'Error',
                text: 'Could not update the cart.',
                confirmButtonColor: '#059669',
            });
        }
    };

    const handleRemove = async (product) => {
        const previousCart = cart;
        dispatch(setCart(cart.filter((item) => item.id !== product.id)));

        try {
            await axios.delete(`http://localhost:3000/cart/remove/${product.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (error) {
            console.error('Error removing item:', error);
            dispatch(setCart(previousCart));
        }
    };

    const handleClearCart = async () => {
        const previousCart = cart;
        dispatch(setCart([]));

        try {
            await axios.delete('http://localhost:3000/cart/clear', {
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (error) {
            console.error('Error clearing cart:', error);
            dispatch(setCart(previousCart));
            Swal.fire({
                icon: 'error',
                iconColor: '#059669',
                title: 'Error',
                text: 'Could not clear the cart.',
                confirmButtonColor: '#059669',
            });
        }
    };

    const getTotalPrice = () => {
        return cart.reduce((total, product) => total + product.price * product.quantity, 0);
    };

    const handleIncrement = (product) => {
        updateQuantity(product.id, product.quantity + 1);
    };

    const handleDecrement = (product) => {
        if (product.quantity > 1) {
            updateQuantity(product.id, product.quantity - 1);
        }
    };

    const handleRemoveproduct = (product) => {
        handleRemove(product);
    };

    return (
        <div className="w-[95%] md:w-[80%] mx-auto mt-[100px] animate-fadeInUp">
            <div className='flex justify-center items-center gap-2 my-[40px]'>
                <h2 className="text-2xl p color text-center">My Cart</h2>
                <FaBagShopping className='text-[23px] color cursor-pointer duration-500  hover:scale-[1.08]' />
            </div>
            <div className='flex items-center' >
                <p className='w-[28%] md:w-[52%] pl-[10px] md:pl-[30px] color text-[25px] md:text-[35px]'>Product</p>
                <p className='w-[23%] md:w-[15%] text-center color'>Price</p>
                <p className='w-[23%] md:w-[15%] text-center color'>Quantity</p>
                <p className='w-[23%] md:w-[15%] text-center color'>Total</p>
            </div>
            {loading ? (
                <p className="text-center my-[20px] text-ink-500">Loading cart...</p>
            ) : cart.length === 0 ? (
                <p className="text-center my-[20px] text-ink-500">Your cart is empty.</p>
            ) : (
                <div>
                    {cart.map((item) => (
                        <div key={item.id} className="card p-3 md:p-4 mb-4">
                            <div className='flex  items-center' >
                                <div className='w-[30%] md:w-[55%] flex flex-col sm:flex-row gap-2 sm:gap-5'>
                                    <img src={`http://localhost:3000${item.image}`} alt={item.name} className="w-[150px] md:w-[200px] h-[90px] md:h-[150px] object-contain" />
                                    <div className='flex flex-col items-center sm:items-start justify-center'>
                                        <p className="text-sm sm:text-lg color text-center sm:text-start">{item.name}</p>
                                        <button onClick={() => handleRemove(item)} className="text-red-600 hover:text-red-700">Remove</button>
                                    </div>
                                </div>
                                <div className='w-[23%] md:w-[15%] text-center'>
                                    <p className='text-center'>{formatINR(item.price)}</p>
                                </div>
                                <div className='w-[23%] md:w-[15%] flex items-center justify-center gap-2'>
                                    <button onClick={() => handleDecrement(item)} className=' w-[30px] text-[20px] border color font-bold px-[5px] rounded-[2px] border-brand-600 hover:bg-brand-600 hover:text-white'>-</button>
                                    <p className='color'> {item.quantity}</p>
                                    <button
                                        onClick={() => handleIncrement(item)}
                                        disabled={item.quantity >= item.stock}
                                        className={`w-[30px] text-[20px] border font-bold px-[5px] rounded-[2px]
                                        ${item.quantity >= item.stock ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'color border-brand-600 hover:bg-brand-600 hover:text-white'}`}> +</button>

                                </div>
                                <div className='w-[23%] md:w-[15%] text-center p'>{formatINR(item.quantity * item.price)}</div>
                                <GoX onClick={() => handleRemoveproduct(item)} className='self-center text-center  text-[30px] text-brand-600 hover:rotate-90 duration-500 ml-auto' />
                            </div>
                        </div>
                    ))}
                    <div className="card flex flex-col sm:flex-row sm:items-center mt-5 p-4 md:p-6 bg-brand-50">
                        <button onClick={handleClearCart} className="bg-red-600 hover:bg-white hover:border-red-600  text-white hover:text-red-600 hover:border duration-500 text-[11px] md:text-[15px] px-3 md:px-4 py-1 md:py-2 rounded ">Clear Cart</button>
                        <div className="flex gap-5 items-center sm:ml-auto mt-3 sm:mt-0">
                            <div className='flex items-center gap-2'>
                                <p className="text-lg md:text-xl font-semibold ">Total: </p>
                                <p className="text-xl md:text-2xl font-bold text-brand-600">{formatINR(getTotalPrice())}</p>
                            </div>
                            <Link to={"/order"} className='btn text-[11px] sm:text-[15px] px-3 sm:px-4 py-1 sm:py-2 '>Order Now</Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
