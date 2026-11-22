import React, { useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setProducts } from '../redux/productsSlice';
import Products from '../components/Products';
import { BiAbacus } from "react-icons/bi";
import Swal from 'sweetalert2';
import user1 from "../assets/user1.jfif"
import user2 from "../assets/user2.jfif"
import user3 from "../assets/user3.jfif"

export default function Home() {

  const dispatch = useDispatch();
  const products = useSelector((state) => state.products.products); 
  const [toggle, setToggle] = useState(true)
  const [category, setCategory] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 12; // Items per page
  const [loading, setLoading] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0); // total products count (optional for better pagination)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Debounce search input before it triggers a fetch
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  // Fetch filtered products from backend with pagination
  const fetchFilteredProducts = useCallback(async () => {
    const token = Cookies.get('token');
    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (category && category !== 'all') params.append('category', category);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (search) params.append('search', search);
      params.append('page', page);
      params.append('limit', limit);

      const response = await fetch(`http://localhost:3000/filter-products?${params.toString()}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch products');

      // Assuming your backend also returns total count for pagination, adjust accordingly
      // For example: { products: [...], total: 100 }
      const data = await response.json();
      dispatch(setProducts(data.products || []));
      setTotalProducts(data.total ?? 0);
      window.scrollTo(0, 0)
    } catch (error) {
      console.error('Error fetching filtered products:', error);
      Swal.fire({
        icon: 'error',
        iconColor: '#059669',
        title: 'Error',
        text: 'Failed to load products. Please try again.',
        confirmButtonColor: '#d33'
      });
    } finally {
      setLoading(false);
    }
  }, [category, minPrice, maxPrice, search, page, limit, dispatch]);

  useEffect(() => {
    fetchFilteredProducts();
  }, [fetchFilteredProducts]);

  const handleMinPriceChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setMinPrice(value);
      setPage(1); // reset page on filter change
    }
  };

  const handleMaxPriceChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setMaxPrice(value);
      setPage(1);
    }
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setPage(1); // reset page when category changes
  };

  // Calculate if Next button should be disabled
  const isNextDisabled = () => {
    return page * limit >= totalProducts;
  };

  return (
    <>

      <section className="hero2 text-brand-600 w-[100%] h-[850px] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent pointer-events-none"></div>
        <div className="w-[95%] lg:w-[80%] mx-auto  min-h-[600px] px-4 py-24 md:py-32 relative z-[1]">
          <div className="max-w-lg mt-[80px] animate-fadeInUp">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Ecommerce Store
            </h1>
            <p className="text-lg text-white mb-8">
              Step into a world of modern fashion made for everyday confidence. Our handpicked collection blends comfort with timeless style.
            </p>
            <p className="text-lg text-white mb-8">
              From casual essentials to standout pieces — explore premium quality that speaks for itself. Style up your wardrobe with ease.
            </p>

            <div className="flex  flex-col md:flex-row justify-start flex-wrap gap-4">
              <Link
                to={"/cart"}
                className="btn py-3 px-6 font-medium w-[150px] text-center" > Shop Now
              </Link>
              <a href='#products'
                className="py-3 px-6 bg-white text-ink-700 font-medium rounded-button border border-gray-200 hover:bg-transparent hover:text-white hover:border hover:border-white rounded-[2px] w-[180px] transition-colors duration-300" >Explore Products
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="w-[95%] lg:w-[80%] mx-auto my-[80px] min-h-screen animate-fadeInUp">
        <div className='flex justify-between items-center w-full md:w-[75%] my-[50px] ml-auto px-4 relative top-[30px]' id='products'>
          <div>
            <p className='text-[28px] font-bold ' >Products</p>
            {!loading && (
              <p className='text-sm text-ink-500'>
                {totalProducts === 0
                  ? 'No products match these filters'
                  : `Showing ${(page - 1) * limit + 1}-${Math.min(page * limit, totalProducts)} of ${totalProducts} products`}
              </p>
            )}
          </div>
          <Link to={"/addproduct"} className='text-[20px] text-brand-600 hover:text-ink-500 hover:cursor-pointer hover:scale-[1.04] transition-all duration-300'>New</Link>
        </div>

        <div className='flex flex-col md:flex-row gap-[20px]'>


          {/* Filter Sidebar */}
          <div className='w-full md:w-[24%] rounded-[5px] max-h-[520px] z-[10] mb-[30px] sticky top-[90px]'>
            <div className={`card ${toggle == true ? "h-[57px] md:h-[530px]" : "h-auto"} overflow-hidden top-[0px] flex flex-col gap-[10px] p-[10px]`}>
              <div className='flex justify-between items-center cursor-pointer'>
                <p className='text-[23px] text-brand-600'>Filter</p>
                <BiAbacus className='text-brand-600 text-[25px]' onClick={() => setToggle(!toggle)} />
              </div>
              <hr />
              <div>
                {/* Search */}
                <div className="mt-6">
                  <p className="text-brand-600 font-semibold mb-2">Search</p>
                  <input
                    type="text"
                    placeholder="Search by name, category..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full p-1 border border-brand-600 rounded focus:ring-0"
                  />
                </div>
                {/* Price Range Filters */}
                <div className="mt-6">
                  <p className="text-brand-600 font-semibold mb-2">Price Range</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Min Price"
                      value={minPrice}
                      onChange={handleMinPriceChange}
                      className="w-1/2 p-1 border border-brand-600 rounded focus:ring-0"
                    />
                    <input
                      type="text"
                      placeholder="Max Price"
                      value={maxPrice}
                      onChange={handleMaxPriceChange}
                      className="w-1/2 p-1 border border-brand-600 rounded focus:ring-0"
                    />
                  </div>
                </div>
                {/* Category Filter */}
                <div className='h-[350px] overflow-auto my-[20px]'>
                  {["All", "Clothing", "vehicle", "Shoes", "Accessories", "Electronics", "mobile", "Health & Fitness", "Groceries", "Books & Stationery", "Sports & Outdoors", "Beauty & Personal Care"].map(cat => (
                    <p
                      key={cat}
                      onClick={() => handleCategoryChange(cat === "All" ? "all" : cat)}
                      className={`options cursor-pointer hover:text-brand-600 ${category === (cat === "All" ? "all" : cat) ? 'text-brand-600 font-semibold' : ''}`}
                    >
                      {cat}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>


          {/* Products Section */}
          <div className="w-full md:w-[74%] flex flex-col">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 gap-y-9 mb-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="skeleton h-[280px] rounded-xl2"></div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <p className="text-ink-500">No products available.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 gap-y-9 mb-4">
                {products.map((product, i) => (
                  <div key={product.id} className="animate-fadeInUp" style={i < 6 ? { animationDelay: `${i * 80}ms` } : undefined}>
                    <Products product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Pagination */}
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={() => {
              if (page > 1) setPage(page - 1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-4 py-2 border rounded text-white bg-brand-600 hover:bg-white hover:text-brand-600 hover:border-brand-600 hover:cursor-pointer duration-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-brand-600 disabled:hover:text-white"
            disabled={page === 1}
          >
            Prev
          </button>

          <span className="px-4 py-2">Page {page}</span>

          <button
            onClick={() => {
              if (!isNextDisabled()) setPage(page + 1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-4 py-2 border rounded text-white bg-brand-600 hover:bg-white hover:text-brand-600 hover:border-brand-600 hover:cursor-pointer duration-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-brand-600 disabled:hover:text-white"
            disabled={isNextDisabled()}
          >
            Next
          </button>
        </div>

        {/* What Our Customers Say */}
        <section className="py-16 mt-[20px]">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-brand-600">
              What Our Customers Say
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card bg-white p-6 flex flex-col justify-between">
                <p className="text-ink-600 ">
                  "The quality of the clothes is exceptional. I've ordered multiple
                  times and have never been disappointed. The customer service is
                  also top-notch!"
                </p>
                <div className="flex items-center">
                  <div className="flex items-center justify-center mr-[10px]">
                    <img src={user1} className='w-[50px] h-[50px] object-cover rounded-full' />
                  </div>
                  <div>
                    <h4 className="font-medium text-brand-600">Emily Richardson</h4>
                    <p className="text-sm text-ink-500">Loyal Customer</p>
                  </div>
                </div>
              </div>

              <div className="card bg-white p-6 flex flex-col justify-between">
                <p className="text-ink-600 ">
                  "Fast shipping and the products look exactly like the pictures.
                  The sizing guide was very helpful. Will definitely shop here
                  again!"
                </p>
                <div className="flex items-center">
                  <div className="flex items-center justify-center mr-[10px]">
                    <img src={user2} className='w-[50px] h-[50px] object-cover rounded-full' />
                  </div>
                  <div>
                    <h4 className="font-medium text-brand-600">Michael Thompson</h4>
                    <p className="text-sm text-ink-500">Verified Buyer</p>
                  </div>
                </div>
              </div>

              <div className="card bg-white p-6 flex flex-col justify-between">
                <p className="text-ink-600 ">
                  "I love the sustainable approach this brand takes. The packaging
                  is eco-friendly and the clothes are made from high-quality,
                  sustainable materials."
                </p>
                <div className="flex items-center">
                  <div className="flex items-center justify-center mr-[10px]">
                    <img src={user3} className='w-[50px] h-[50px] object-cover rounded-full' />
                  </div>
                  <div>
                    <h4 className="font-medium text-brand-600">Sophia Martinez</h4>
                    <p className="text-sm text-ink-500">Repeat Customer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
