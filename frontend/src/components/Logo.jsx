import React from 'react';
import { FaBagShopping } from "react-icons/fa6";

const sizeMap = {
    sm: { box: 'h-[28px] w-[28px]', icon: 'text-[14px]', text: 'text-[18px]' },
    md: { box: 'h-[36px] w-[36px]', icon: 'text-[18px]', text: 'text-[24px]' },
    lg: { box: 'h-[46px] w-[46px]', icon: 'text-[22px]', text: 'text-[32px]' },
};

export default function Logo({ size = 'md', variant = 'light' }) {
    const s = sizeMap[size] || sizeMap.md;
    const inverted = variant === 'dark' || variant === 'inverted';

    return (
        <span className='flex items-center gap-2 select-none'>
            <span
                className={`${s.box} flex items-center justify-center rounded-lg shadow-soft flex-shrink-0 ${
                    inverted
                        ? 'bg-white/10 border border-white/30'
                        : 'bg-gradient-to-br from-brand-500 to-brand-700'
                }`}
            >
                <FaBagShopping className={`${s.icon} ${inverted ? 'text-white' : 'text-white'}`} />
            </span>
            <span className={`${s.text} font-extrabold tracking-tight whitespace-nowrap`}>
                <span className={inverted ? 'text-white' : 'text-ink-800'}>Shop</span>
                <span className={inverted ? 'text-brand-200' : 'text-brand-600'}>Ease</span>
            </span>
        </span>
    );
}
