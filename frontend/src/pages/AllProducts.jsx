import { useEffect, useState } from "react";
import { GoX } from "react-icons/go";
import { FiEdit2 } from "react-icons/fi";
import { Link } from "react-router-dom";
import Swal from 'sweetalert2';
import axios from 'axios';
import Cookies from 'js-cookie';
import { formatINR } from '../utils/formatCurrency';

export default function AllProducts() {
    const [products, setProducts] = useState([]);
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        minPrice: '',
        maxPrice: ''
    });
    const [page, setPage] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const limit = 10; // You can change it as needed
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const fetchFilteredProducts = async (overrideFilters = filters, overridePage = page) => {
        const cleanFilters = Object.fromEntries(
            Object.entries(overrideFilters).filter(([, v]) => v !== '')
        );
        const query = new URLSearchParams({
            ...cleanFilters,
            page: overridePage,
            limit
        }).toString();

        try {
            const res = await fetch(`http://localhost:3000/filter-products?${query}`);
            const data = await res.json();
            setProducts(data.products || []);
            setTotalProducts(data.total ?? 0);
        } catch (error) {
            console.error("Error filtering products:", error);
        }

    };


    useEffect(() => {
        fetchFilteredProducts();
    }, [page]);

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This will permanently delete the product.',
            icon: 'warning',
            iconColor: '#059669',
            showCancelButton: true,
            confirmButtonColor: '#059669',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
        });

        if (result.isConfirmed) {
            try {
                const token = Cookies.get('token');
                const res = await fetch(`http://localhost:3000/product/${id}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = await res.json();

                if (res.ok) {
                    Swal.fire({
                        title: 'Deleted!',
                        text: data.message,
                        icon: 'success',
                        confirmButtonColor: '#059669'
                    });
                    fetchFilteredProducts(); // Refresh the list
                } else {
                    Swal.fire({
                        title: 'Error!',
                        text: data.message || "Error deleting product.",
                        icon: 'error',
                        confirmButtonColor: '#059669'
                    });
                }
            } catch (error) {
                console.error("Error deleting product:", error);
                Swal.fire({
                    title: 'Error!',
                    iconColor: '#059669',
                    text: 'Something went wrong while deleting.',
                    icon: 'error',
                    confirmButtonColor: '#059669'
                });
            }
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleToggleStatus = async (product) => {
        const newStatus = product.status === 'sold' ? 'active' : 'sold';
        try {
            const token = Cookies.get('token');
            await axios.put(
                `http://localhost:3000/updateproduct/${product.id}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            Swal.fire({
                title: 'Updated!',
                text: `Product marked as ${newStatus}.`,
                icon: 'success',
                confirmButtonColor: '#059669',
            });
            fetchFilteredProducts();
        } catch (error) {
            console.error("Error updating product status:", error);
            Swal.fire({
                title: 'Error!',
                text: error.response?.data?.error || 'Could not update product status.',
                icon: 'error',
                confirmButtonColor: '#059669',
            });
        }
    };

    return (
        <section className='w-[95%] lg:w-[80%] mx-auto my-[80px] min-h-screen animate-fadeInUp'>

            {/* Filters */}
            <div className="flex gap-4 mb-6 flex-wrap justify-center md:justify-start">
                <input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); fetchFilteredProducts(filters, 1); } }}
                    placeholder="Search by name, category..."
                    className="input w-[220px]"
                />
                <select name="category" value={filters.category} onChange={handleFilterChange} className="border w-[160px] p-2 rounded bg-brand-600 text-white focus:outline-0 hover:cursor-pointer hover:scale-105 duration-500 text-center" >
                    <option value="">All Categories</option>
                    <option value="Clothing" className="bg-white text-brand-600">Clothing </option>
                    <option value="vehicle" className="bg-white text-brand-600">vehicle </option>
                    <option value="Shoes" className="bg-white text-brand-600">Shoes </option>
                    <option value="Accessories" className="bg-white text-brand-600">Accessories </option>
                    <option value="Electronics" className="bg-white text-brand-600">Electronics </option>
                    <option value="mobile" className="bg-white text-brand-600">mobile </option>
                    <option value="Health & Fitness" className="bg-white text-brand-600">Health & Fitness </option>
                    <option value="Groceries" className="bg-white text-brand-600">Groceries </option>
                    <option value="Books & Stationery" className="bg-white text-brand-600">Books & Stationery </option>
                    <option value="Sports & Outdoors" className="bg-white text-brand-600">Sports & Outdoors </option>
                    <option value="Beauty & Personal Care" className="bg-white text-brand-600">Beauty & Personal Care </option>
                </select>
                <input type="number" name="minPrice" value={filters.minPrice} onChange={handleFilterChange} placeholder="Min Price" className="input w-[105px]" />
                <input type="number" name="maxPrice" value={filters.maxPrice} onChange={handleFilterChange} placeholder="Max Price" className="input w-[105px]" />
                <button onClick={() => { setPage(1); fetchFilteredProducts(); }} className="bg-brand-600 text-white px-4 py-2 rounded  md:ml-auto hover:bg-white hover:border hover:border-brand-600 hover:text-brand-600 duration-500">
                    Apply Filters
                </button>
                <button onClick={() => {
                    const empty = { search: '', category: '', minPrice: '', maxPrice: '' };
                    setFilters(empty);
                    setPage(1);
                    fetchFilteredProducts(empty, 1);
                }} className="text-brand-600 border px-4 py-2 rounded hover:cursor-pointer hover:scale-105 duration-500">
                    Clear Filters
                </button>
            </div>

            <p className='text-sm text-ink-500 mb-4'>
                {totalProducts === 0
                    ? 'No products match these filters'
                    : `Showing ${(page - 1) * limit + 1}-${Math.min(page * limit, totalProducts)} of ${totalProducts} products`}
            </p>

            {/* Table */}
            {
                products.length > 0 ? (
                    <div className="overflow-x-auto card p-0">
                        <table className="min-w-[970px] w-full border border-ink-200">
                            <thead className="bg-brand-600 text-white">
                                <tr>
                                    <th className="p-3 border font-semibold">ID</th>
                                    <th className="p-3 border font-semibold">Image</th>
                                    <th className="p-3 border font-semibold">Name</th>
                                    <th className="p-3 border font-semibold">Price</th>
                                    <th className="p-3 border font-semibold">Stock</th>
                                    <th className="p-1 border font-semibold">Category</th>
                                    <th className="p-3 border font-semibold">Seller ID</th>
                                    <th className="p-3 border font-semibold">Created</th>
                                    <th className="p-3 border font-semibold">Status</th>
                                    <th className="p-3 border font-semibold">Edit</th>
                                    <th className="p-3 border font-semibold">Delete</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product.id} className="text-center hover:bg-ink-50 transition-colors">
                                        <td className="p-3 border">{product.id}</td>
                                        <td className="p-3 border">
                                            <Link to={`/product/${product.id}`}
                                            >
                                                <img
                                                    src={`http://localhost:3000${product.image}`}
                                                    alt={product.name}
                                                    className="w-12 h-12 rounded object-cover mx-auto hover:scale-110 duration-500"
                                                />
                                            </Link>

                                        </td>
                                        <td className="p-3 border">
                                            <Link to={`/product/${product.id}`} className="hover:text-brand-600 hover:underline">
                                                {product.name}
                                            </Link>
                                        </td>
                                        <td className="p-3 border">{formatINR(product.price)}</td>
                                        <td className="p-3 border">{product.stock}</td>
                                        <td className="p-1 border">{product.category}</td>
                                        <td className="p-3 border">{product.seller_id}</td>
                                        <td className="p-3 border">{product.created_at ? new Date(product.created_at).toLocaleDateString() : ''}</td>
                                        <td className="p-3 border">
                                            <button
                                                onClick={() => handleToggleStatus(product)}
                                                className={`px-2 py-1 rounded text-white text-xs ${product.status === 'sold' ? 'bg-ink-500' : 'bg-brand-600'}`}
                                            >
                                                {product.status === 'sold' ? 'Mark Active' : 'Mark Sold'}
                                            </button>
                                        </td>
                                        <td className="p-3 border">
                                            <Link to={`/editproduct/${product.id}`}>
                                                <FiEdit2 className="text-center mx-auto text-[20px] text-brand-600 hover:scale-110 duration-300" />
                                            </Link>
                                        </td>
                                        <td className="p-3 border">
                                            <button onClick={() => handleDelete(product.id)}>
                                                <GoX className="text-center mx-auto text-[30px] text-red-600 hover:rotate-90 duration-500" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="flex justify-center mt-6 gap-4">
                            <button
                                onClick={() => {
                                    if (page > 1) setPage(page - 1);
                                    window.scrollTo(0, 0)

                                }}
                                className="px-4 py-2 border rounded text-white bg-brand-600 hover:bg-white hover:text-brand-600 hover:border-brand-600 hover:scale-100 hover:cursor-pointer duration-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-brand-600 disabled:hover:text-white disabled:hover:scale-100"
                                disabled={page === 1}
                            >
                                Prev
                            </button>

                            <span className="px-4 py-2">Page {page}</span>

                            <button
                                onClick={() => {
                                    setPage(page + 1);
                                    window.scrollTo(0, 0)
                                }}
                                className="px-4 py-2 border rounded text-white bg-brand-600 hover:bg-white hover:text-brand-600 hover:border-brand-600 hover:scale-100 hover:cursor-pointer duration-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-brand-600 disabled:hover:text-white disabled:hover:scale-100"
                                disabled={page * limit >= totalProducts}
                            >
                                Next
                            </button>

                        </div>

                    </div>
                ) : (
                    <p className="text-center text-ink-500">No Products Found</p>
                )
            }
        </section>
    );
}
