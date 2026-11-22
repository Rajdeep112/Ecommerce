import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { setCart } from '../redux/cartSlice';
import { GoX } from "react-icons/go";
import axios from 'axios';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';
import { formatINR } from '../utils/formatCurrency';

export default function Order() {
    const navigate = useNavigate();
    const cart = useSelector((state) => state.cart.items);
    const user = useSelector((state) => state.auth.user);
    const dispatch = useDispatch();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        if (user === null) {
            navigate("/auth");
        }
    }, [user]);

    const [fullName, setFullName] = useState(user?.name || "");
    const [phone, setPhone] = useState("");
    const [line1, setLine1] = useState("");
    const [line2, setLine2] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [pincode, setPincode] = useState("");
    const [paymentMethod] = useState("cod");
    const [placing, setPlacing] = useState(false);

    const token = Cookies.get('token');

    const fetchCart = async () => {
        try {
            const res = await axios.get('http://localhost:3000/cart/', {
                headers: { Authorization: `Bearer ${token}` },
            });
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
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

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

    const getTotalPrice = () => {
        return cart.reduce((total, product) => total + product.price * product.quantity, 0);
    };

    const handleCheckout = async (e) => {
        e.preventDefault();

        if (cart.length === 0) {
            Swal.fire({
                icon: 'warning',
                iconColor: '#059669',
                title: 'Cart is empty',
                text: 'Add some products to your cart before placing an order.',
                confirmButtonColor: '#059669',
            });
            return;
        }

        setPlacing(true);
        try {
            const res = await axios.post(
                'http://localhost:3000/orders/checkout',
                {
                    full_name: fullName,
                    phone,
                    line1,
                    line2,
                    city,
                    state,
                    pincode,
                    paymentMethod,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            dispatch(setCart([]));

            Swal.fire({
                icon: 'success',
                iconColor: '#059669',
                title: 'Order Placed!',
                text: 'Your order has been placed successfully.',
                confirmButtonColor: '#059669',
            }).then(() => {
                navigate('/orders');
            });
        } catch (error) {
            console.error('Error placing order:', error);
            Swal.fire({
                icon: 'error',
                iconColor: '#059669',
                title: 'Checkout Failed',
                text: error?.response?.data?.message || 'Something went wrong while placing the order.',
                confirmButtonColor: '#059669',
            });
        } finally {
            setPlacing(false);
        }
    };

    if (!user) return null;

    return (
        <section className='w-[95%] md:w-[80%] flex flex-col md:flex-row gap-4 mx-auto mt-[100px] animate-fadeInUp'>
            <div className='card w-[100%] md:w-[60%] lg:w-[70%] px-[20px] py-[20px]'>
                <p className='text-[25px] color ml-[10px]'>Billing Address</p>
                <form className='flex flex-col items-center' onSubmit={handleCheckout}>
                    <input value={fullName} onChange={(e) => setFullName(e.target.value)} className='input w-full' type="text" placeholder='Full Name' required />
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} className='input' type="text" placeholder='Phone Number' required />
                    <input value={line1} onChange={(e) => setLine1(e.target.value)} className='input' type="text" placeholder='Address Line 1' required />
                    <input value={line2} onChange={(e) => setLine2(e.target.value)} className='input' type="text" placeholder='Address Line 2 (optional)' />
                    <div className='flex gap-2 w-full'>
                        <input value={city} onChange={(e) => setCity(e.target.value)} className='input' type="text" placeholder='City' required />
                        <input value={state} onChange={(e) => setState(e.target.value)} className='input' type="text" placeholder='State' required />
                    </div>
                    <input value={pincode} onChange={(e) => setPincode(e.target.value)} className='input' type="text" placeholder='Pincode' required />

                    <div className='w-full mt-[10px]'>
                        <p className='color text-[18px] mb-[5px]'>Payment Method</p>
                        <label className='flex items-center gap-2'>
                            <input type="radio" checked readOnly name="paymentMethod" value="cod" />
                            Cash on Delivery
                        </label>
                    </div>

                    <button disabled={placing} className='btn mt-[20px]'>{placing ? 'Placing Order...' : 'Order Now'}</button>
                </form>
            </div>

            <div className='card bg-brand-50 w-full md:w-[40%] lg:w-[30%] p-[20px] h-[500px] md:max-h-[430px]'>
                <p className='color text-[25px]'>Products</p>
                <div className='flex flex-col items-center h-[80%] overflow-y-auto overflow-x-hidden pr-[10px]'>
                    {cart.length === 0 ? (
                        <p className="text-center my-[20px] text-ink-500">Your cart is empty.</p>
                    ) : (
                        cart.map((item) => (
                            <div key={item.id} className='card bg-white w-full h-[100px] mb-3 flex gap-2 p-2'>
                                <Link to={"/cart"} className='w-[100px]'>
                                    <img src={`http://localhost:3000${item.image}`} alt={item.name} className='w-full h-[90px] object-cover rounded-md' />
                                </Link>
                                <div className='flex justify-between w-[80%] over'>
                                    <div>
                                        <p className='font-semibold color '>{item.name}</p>
                                        <p className='text-sm text-ink-500'>Qty: {item.quantity}</p>
                                        <p className='text-sm color'>Price: {formatINR(item.price)}</p>
                                    </div>
                                    <GoX onClick={() => handleRemove(item)} className='self-center text-center  text-[30px] text-brand-600 hover:rotate-90 duration-500 ml-auto'  />
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className='flex justify-between px-2 mt-[10px]'>
                    <p className='text-[25px] font-semibold'>Total </p>
                    <p className='color text-2xl font-bold'>{formatINR(getTotalPrice())}</p>
                </div>
            </div>
        </section>
    );
}
