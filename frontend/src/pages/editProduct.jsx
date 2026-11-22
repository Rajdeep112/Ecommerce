import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import img1 from "../assets/edit.png";
import axios from 'axios';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';
import { formatINR } from '../utils/formatCurrency';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const getproducts = useSelector((state) => state.products.products);
  const user = useSelector((state) => state.auth.user);
  const product = getproducts.find((p) => p.id === parseInt(id));
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

useEffect(() => {
  const token = Cookies.get("token");

  if (!token) {
    Swal.fire({
      icon: "error",
      iconColor: '#059669',
      title: 'User not logged in',
      text: 'Dear user please login first',
      confirmButtonColor: '#059669'
    }).then(() => {
      navigate("/auth");
    });
    return;
  }

  const fetchAndSetUserAndProduct = async () => {
    try {
      const userId = JSON.parse(Cookies.get("user"))?.id;
      const userRes = await axios.post(
        "http://localhost:3000/getuser",
        { id: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const fullUser = userRes.data;

      const authorizeAndSetProduct = (data) => {
        if (data.seller_id === fullUser?.id || fullUser?.role === "admin") {
          setName(data.name);
          setCategory(data.category);
          setPrice(data.price);
          setStock(data.stock);
          setDescription(data.description);
          setCurrentImage(data.image);
        } else {
          Swal.fire({
            icon: 'error',
            iconColor: '#059669',
            title: 'Unauthorized Access',
            text: 'You are not allowed to edit this product.',
            confirmButtonColor: '#059669'
          }).then(() => {
            navigate("/");
          });
        }
      };

      if (product) {
        authorizeAndSetProduct(product);
      } else {
        const res = await axios.get(`http://localhost:3000/product/${id}`);
        const data = res.data;
        authorizeAndSetProduct(data);
      }
    } catch (err) {
      console.error("Failed to fetch user or product:", err);
      Swal.fire({
        icon: 'error',
        iconColor: '#059669',
        title: 'Error',
        text: 'Could not load the product or user.',
        confirmButtonColor: '#059669'
      }).then(() => {
        navigate("/");
      });
    }
  };

  fetchAndSetUserAndProduct();
}, [product, id, navigate]);


  const handleEditProduct = async (e) => {
    e.preventDefault();

    // Show loading alert
    Swal.fire({
      icon: "info",
      iconColor: '#059669',
      title: 'Updating Product...',
      text: 'Please wait while we update the product details.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('category', category);
      formData.append('price', price);
      formData.append('stock', stock);
      formData.append('description', description);
      if (image) formData.append('image', image);

      const token = Cookies.get('token');

      const response = await axios.put(
        `http://localhost:3000/updateproduct/${id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Swal.fire({
        icon: 'success',
        iconColor: '#059669',
        title: 'Product Updated!',
        text: 'The product details have been successfully updated.',
        confirmButtonColor: '#059669',
      }).then(() => {
        navigate(`/product/${id}`);
        window.location.reload(); // Reload the page to show updated details
      });

    } catch (error) {
      console.error('Error updating product:', error);
      Swal.fire({
        icon: 'error',
        iconColor: '#059669',
        title: 'Update Failed',
        text: 'Something went wrong while updating the product.',
        confirmButtonColor: '#d33',
      });
    }
  };

  return (
    <div className="w-[90%] lg:w-[80%] mx-auto mt-[50px] md:mt-[110px] flex gap-[40px] animate-fadeInUp">
      <div className='hidden md:block w-[40%] pr-[20px]'>
        <img src={img1} alt="Product Edit" className='w-full' />
      </div>
      <div className='w-full md:w-[60%]'>
        <h1 className="text-3xl text-brand-600 font-bold mb-5">Edit Product</h1>
        <form onSubmit={handleEditProduct}>
          <div className="mb-2">
            <label htmlFor="name" className="block text-sm font-medium text-ink-600">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input mt-1 w-full"
            />
          </div>
          <div className="mb-2">
            <label htmlFor="category" className="block text-sm font-medium text-ink-600">Category</label>
            <input
              type="text"
              id="category"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="input mt-1 w-full"
            />
          </div>
          <div className="mb-2">
            <label htmlFor="price" className="block text-sm font-medium text-ink-600">Price {price !== "" && `(${formatINR(price)})`}</label>
            <input
              type="number"
              id="price"
              name="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="input mt-1 w-full"
            />
          </div>
          <div className="mb-2">
            <label htmlFor="stock" className="block text-sm font-medium text-ink-600">Stock</label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
              className="input mt-1 w-full"
            />
          </div>
          <div className="mb-2">
            <label htmlFor="description" className="block text-sm font-medium text-ink-600">Description</label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="input mt-1 w-full"
            />
          </div>
          <div className="mb-2">
            <label htmlFor="image" className="block text-sm font-medium text-ink-600">Product Image</label>
            {(image || currentImage) && (
              <img
                src={image ? URL.createObjectURL(image) : `http://localhost:3000${currentImage}`}
                alt="Product"
                className="w-32 h-32 object-cover rounded-md border mt-2 mb-2"
              />
            )}
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="input mt-1 w-full"
            />
          </div>
          <button type="submit" className="btn mt-5 w-full">Update Product</button>
        </form>
      </div>
    </div>
  );
}
