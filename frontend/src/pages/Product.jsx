import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { FaBagShopping } from "react-icons/fa6";
import { FiEdit3 } from "react-icons/fi";
import { MdDelete } from "react-icons/md";
import Swal from 'sweetalert2';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { formatINR } from '../utils/formatCurrency';
import { setCart } from '../redux/cartSlice';



export default function Product() {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const navigate = useNavigate();
    const { id } = useParams();
    const products = useSelector((state) => state.products.products);
    const cartItems = useSelector((state) => state.cart.items);
    const productFromRedux = products.find((p) => p.id.toString() === id);
    const [product, setProduct] = useState(productFromRedux || null);
    const [loading, setLoading] = useState(!productFromRedux);
    const [error, setError] = useState(null);
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        if (!productFromRedux) {
            const fetchProduct = async () => {
                try {
                    const res = await fetch(`http://localhost:3000/product/${id}`);
                    if (!res.ok) throw new Error('Product not found');
                    const data = await res.json();
                    setProduct(data);
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };

            fetchProduct();
        }
    }, [id, productFromRedux]);

    const cartItem = product
        ? cartItems.find((item) => (item.product_id ?? item.id) === product.id)
        : null;
    const quantityInCart = cartItem?.quantity || 0;

    const capitalize = (str) => {
        if (!str) return str; // Check if the string is empty
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    const handleDelete = async () => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This product will be deleted!',
            icon: 'warning',
            iconColor: '#059669',
            showCancelButton: true,
            confirmButtonColor: '#059669',
            cancelButtonColor: 'black',
            confirmButtonText: 'Yes, delete it!',
        });

        if (!result.isConfirmed) return;

        try {
            const token = Cookies.get('token');
            const res = await fetch(`http://localhost:3000/product/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error('Failed to delete product');

            // Show success message
            await Swal.fire(
                'Deleted!',
                '#059669',
                'Your product has been deleted.',
                'success'
            );
            navigate('/');
        } catch (err) {
            // Show error message
            await Swal.fire(
                'Error!',
                err.message,
                'error',
                '#059669'
            );
        }
    };
    const handleAddToCart = async () => {
        const token = Cookies.get('token');

        if (!token) {
            Swal.fire({
                icon: 'info',
                iconColor: '#059669',
                title: 'Please Login',
                text: 'You need to be logged in to add items to your cart.',
                showCancelButton: true,
                confirmButtonText: 'Login',
                confirmButtonColor: '#059669',
                cancelButtonText: 'Cancel',
            }).then((result) => {
                if (result.isConfirmed) navigate('/auth');
            });
            return;
        }

        try {
            await axios.post(
                'http://localhost:3000/cart/add',
                { productId: product.id, quantity: 1 },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const cartRes = await axios.get('http://localhost:3000/cart/', {
                headers: { Authorization: `Bearer ${token}` },
            });
            dispatch(setCart(cartRes.data?.items || []));

            Swal.fire({
                icon: 'success',
                iconColor: '#059669',
                title: 'Added to Cart!',
                text: 'Your product has been added to the cart.',
                confirmButtonText: 'OK',
            });
        } catch (error) {
            console.error('Error adding to cart:', error);

            if (error.response?.status === 401) {
                Swal.fire({
                    icon: 'info',
                    iconColor: '#059669',
                    title: 'Please Login',
                    text: 'Your session has expired. Please log in again.',
                    showCancelButton: true,
                    confirmButtonText: 'Login',
                    confirmButtonColor: '#059669',
                    cancelButtonText: 'Cancel',
                }).then((result) => {
                    if (result.isConfirmed) navigate('/auth');
                });
                return;
            }

            Swal.fire({
                icon: 'error',
                iconColor: '#059669',
                title: 'Error',
                text: error.response?.data?.message || 'Could not add the product to the cart.',
                confirmButtonColor: '#059669',
            });
        }
    };
    const handleQuantityChange = async (newQuantity) => {
        const token = Cookies.get('token');
        const previousCartItems = cartItems;

        if (newQuantity <= 0) {
            dispatch(setCart(cartItems.filter((item) => (item.product_id ?? item.id) !== product.id)));
            try {
                await axios.delete(`http://localhost:3000/cart/remove/${product.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } catch (error) {
                console.error('Error removing from cart:', error);
                dispatch(setCart(previousCartItems));
            }
            return;
        }

        dispatch(setCart(cartItems.map((item) =>
            (item.product_id ?? item.id) === product.id ? { ...item, quantity: newQuantity } : item
        )));

        try {
            await axios.put(
                'http://localhost:3000/cart/update',
                { productId: product.id, quantity: newQuantity },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (error) {
            console.error('Error updating cart quantity:', error);
            dispatch(setCart(previousCartItems));
            Swal.fire({
                icon: 'error',
                iconColor: '#059669',
                title: 'Error',
                text: error.response?.data?.message || 'Could not update quantity.',
                confirmButtonColor: '#059669',
            });
        }
    };

    if (loading) return <div className="text-center mt-10">Loading product...</div>;
    if (error || !product) return <div className="text-center mt-10 text-red-500">{error || 'Product not found.'}</div>;
    return (
        <>
            <section className="hero3 text-brand-600 w-[100%] h-[850px] relative ">
                <div className="w-[95%] lg:w-[80%] mx-auto  min-h-[600px] px-4 py-24 md:py-32">
                    <div className="max-w-lg mt-[80px] animate-fadeInUp">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Ecommerce Products
                        </h1>
                        <p className="text-lg text-white mb-8">
                            Discover high-quality products crafted with precision — from durable materials to fine finishes, built to last through everyday use.
                        </p>
                        <p className="text-lg text-white mb-8">
                            Whether you're looking for top-rated gadgets, stylish apparel, or home essentials — shop trusted brands, fast delivery, and seamless returns.
                        </p>


                        <div className="flex  flex-col md:flex-row justify-start flex-wrap gap-4">
                            <Link
                                to={"/cart"}
                                className="py-3 px-6 bg-primary text-white font-medium hover:underline w-[150px]" > Shop Now
                            </Link>
                            <a href='#products'
                                className="py-3 px-6 bg-brand-600 text-white font-medium rounded-button border-brand-600 hover:bg-transparent hover:text-brand-600 hover:border hover:border-brand-600 rounded-[2px] w-[180px]" >Explore Products
                            </a>
                        </div>
                    </div>
                </div>
            </section>
            <div className="w-[90%] lg:w-[80%] mx-auto  mt-[50px] md:mt-[80px]" id='products'>
                <div className="card animate-scaleIn flex flex-col w-full md:flex-row gap-5 lg:gap-8 p-5 lg:p-8">
                    <img
                        src={`http://localhost:3000${product.image}`}
                        alt={product.name}
                        className="w-full md:w-[35%] object-cover rounded-xl2"
                    />
                    <div className="w-full md:w-[65%] flex flex-col min-h-[400px] ">
                        <div className='w-full flex flex-col'>
                            <h1 className="text-3xl text-brand-600 font-bold">{capitalize(product.name)}</h1>
                            <div className='flex items-center gap-1'>
                                <p className="text-ink-700 mt-2 font-[500]">Category :</p>
                                <p className="text-ink-500 mt-2">{product.category}</p>
                            </div>
                            <div className='flex items-center gap-1'>
                                <p className="text-ink-700 mt-2 font-[500]">Stock : </p>
                                <p className="text-ink-500 mt-2">
                                    {user?.role === 'admin' || product.status === 'active' ? product.stock : 0}
                                </p>
                            </div>
                            <div className='flex items-center gap-1 mt-5'>
                                <p className="text-ink-700 text-xl  font-[500]">Price: </p>
                                <p className="text-brand-600 text-xl font-semibold ">{formatINR(product.price)}</p>
                            </div>
                            <p className="mt-4 text-ink-600">{product.description}</p>
                            <div className='flex items-center gap-1 '>
                                <p className="text-ink-700 mt-2 font-[500]">Created at : </p>
                                <p className="text-ink-500 mt-2 italic"> {product.created_at ? new Date(product.created_at).toLocaleDateString() : ''}</p>
                            </div>
                        </div>
                        <div className='mt-auto pt-5'>
                            {(user?.id === product.seller_id || user?.role === 'admin') && (
                                <div className='flex items-center mb-[10px] gap-2 '>
                                    <button className='w-[50%] border-2 border-brand-600 text-brand-600 hover:text-white py-[6px] lg:py-[10px] rounded-[3px] hover:bg-brand-600 duration-500'>
                                        <Link to={`/editproduct/${product.id}`}>
                                            <FiEdit3 className='text-[30px] mx-auto hover:text-white' />
                                        </Link>
                                    </button>
                                    <button onClick={handleDelete} className='w-[49%] border-2 border-red-600 text-red-600 hover:text-white py-[6px] lg:py-[10px] rounded-[3px] hover:bg-red-700 duration-500'>
                                        <MdDelete className='text-[30px] mx-auto' />
                                    </button>
                                </div>
                            )}
                            {product.stock <= 0 || product.status !== 'active' ? (
                                <p className='text-brand-600 text-lg font-semibold '>Sorry this item is currently Out of Stock / Sold</p>
                            ) : (
                                <>
                                    {quantityInCart > 0 ? (
                                        <div className='flex items-center gap-3'>
                                            <p className='text-ink-600'>In your cart:</p>
                                            <div className='flex items-center gap-2'>
                                                <button
                                                    onClick={() => handleQuantityChange(quantityInCart - 1)}
                                                    className='w-[36px] h-[36px] text-[20px] border font-bold rounded-full border-brand-600 text-brand-600 hover:bg-brand-600 hover:text-white duration-300'
                                                >
                                                    -
                                                </button>
                                                <p className='text-[18px] font-semibold color w-[20px] text-center'>{quantityInCart}</p>
                                                <button
                                                    onClick={() => handleQuantityChange(quantityInCart + 1)}
                                                    disabled={quantityInCart >= product.stock}
                                                    className={`w-[36px] h-[36px] text-[20px] border font-bold rounded-full duration-300
                                                        ${quantityInCart >= product.stock ? 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed' : 'border-brand-600 text-brand-600 hover:bg-brand-600 hover:text-white'}`}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button onClick={handleAddToCart} className='btn text-lg flex justify-center items-center mt-auto gap-[8px] shadow-soft'>
                                            Add to Cart <FaBagShopping />
                                        </button>
                                    )}
                                </>
                            )}

                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}
