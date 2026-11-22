import React from 'react'
import { Link } from 'react-router-dom'
import { FaEye } from "react-icons/fa";
import { formatINR } from '../utils/formatCurrency';


export default function Products(props) {
    const capitalize = (str) => {
  if (!str) return str; // Check if the string is empty
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
    const available = props.product.stock > 0 && props.product.status === 'active';
    return (
        <Link to={`/product/${props.product.id}`} key={props.product.id} className="group w-[100%] h-[440px] card overflow-hidden relative hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
            <div className="w-full h-[55%] overflow-hidden">
                <img
                    src={`http://localhost:3000${props.product.image}`}
                    alt={props.product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
            </div>
            <div className="p-4 h-[45%] flex flex-col">
                <h3 className="text-xl font-semibold text-brand-600">{capitalize(props.product.name)}</h3>
                <p className="text-sm text-ink-500 mt-2 ">{props.product.category}</p>
                <div className='mt-auto'>
                    <div className="flex justify-between items-center mt-auto">
                        <span className="text-lg font-semibold text-brand-600">{formatINR(props.product.price)}</span>
                        <span className={`text-sm ${available ? 'text-brand-600' : 'text-red-500'}`}>
                            {available ? 'In Stock' : 'Sold Out'}
                        </span>
                    </div>
                    <button
                        className="flex justify-center items-center gap-[5px] mt-4 w-[100%] py-2 btn ">View<FaEye />
                    </button>
                </div>
            </div>
        </Link>
    )
}
