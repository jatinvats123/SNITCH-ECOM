import React, { useEffect } from 'react';
import { useProduct } from "../hooks/useProduct";
import { useSelector } from "react-redux";

const Dashboard = () => {
    const { handleGetProducts } = useProduct();
    const sellerProducts = useSelector((state) => state.product.sellerProducts);

    useEffect(() => {
        handleGetProducts();
    }, []);

    const stats = [
        { label: 'Total Products', value: sellerProducts?.length || 0, icon: '📦' },
        { label: 'Active Listings', value: sellerProducts?.length || 0, icon: '✨' },
        { label: 'Total Sales', value: '₹0', icon: '💰' },
    ];

    return (
        <div className="min-h-screen bg-[#131313] text-[#E5E2E1] font-['Manrope'] selection:bg-[#FFD700] selection:text-[#131313]">
            {/* Sidebar Overlay for Glass effect */}
            <div className="fixed left-0 top-0 h-full w-64 bg-[#1C1B1B] border-r border-[#4D4732]/20 z-10 hidden md:block">
                <div className="p-8">
                    <h2 className="text-[#FFD700] text-2xl font-bold tracking-tighter mb-12">SNITCH.</h2>
                    <nav className="space-y-6">
                        {['Overview', 'Products', 'Orders', 'Analytics', 'Settings'].map((item) => (
                            <div key={item} className={`cursor-pointer transition-all duration-300 hover:text-[#FFD700] ${item === 'Products' ? 'text-[#FFD700]' : 'text-[#D0C6AB]'}`}>
                                <span className="text-sm uppercase tracking-widest font-semibold">{item}</span>
                            </div>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="md:ml-64 p-8 md:p-12">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-2">Seller Dashboard</h1>
                        <p className="text-[#D0C6AB] text-lg font-light">Managing your premium collection with precision.</p>
                    </div>
                    <button className="bg-[#FFD700] text-[#3a3000] px-8 py-4 rounded-md font-bold text-sm uppercase tracking-widest transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,215,0,0.2)]">
                        + Add Product
                    </button>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="bg-[#1C1B1B] p-8 rounded-xl border border-[#4D4732]/10 relative overflow-hidden group hover:border-[#FFD700]/30 transition-colors">
                            <div className="absolute top-0 right-0 p-4 text-4xl opacity-10 group-hover:opacity-20 transition-opacity">
                                {stat.icon}
                            </div>
                            <p className="text-[#D0C6AB] text-xs uppercase tracking-[0.2em] mb-2 font-semibold">{stat.label}</p>
                            <h3 className="text-4xl font-bold">{stat.value}</h3>
                        </div>
                    ))}
                </div>

                {/* Product Section */}
                <section>
                    <div className="flex justify-between items-center mb-12 border-b border-[#4D4732]/10 pb-6">
                        <h2 className="text-2xl font-bold tracking-tight">Your Products</h2>
                        <span className="text-[#D0C6AB] text-sm uppercase tracking-[0.15em] font-medium">{sellerProducts?.length || 0} Items</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
                        {sellerProducts?.map((product) => (
                            <div key={product._id} className="group cursor-pointer">
                                <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-[#1C1B1B] mb-6 relative">
                                    <img 
                                        src={product.images[0]?.url || 'https://via.placeholder.com/300x400?text=No+Image'} 
                                        alt={product.title} 
                                        className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                    />
                                    {/* Hover Actions Overlay */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4 backdrop-blur-sm">
                                        <button title="Edit" className="bg-[#E5E2E1] text-[#131313] p-4 rounded-full hover:bg-[#FFD700] transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                        </button>
                                        <button title="Delete" className="bg-[#E5E2E1] text-[#131313] p-4 rounded-full hover:bg-[#ffb4ab] hover:text-[#690005] transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-[#131313]/90 backdrop-blur-md px-4 py-1.5 rounded text-[9px] uppercase tracking-[0.2em] font-bold border border-[#FFD700]/20 text-[#FFD700]">
                                            Active
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold truncate group-hover:text-[#FFD700] transition-colors duration-300">{product.title}</h3>
                                    <div className="flex justify-between items-center">
                                        <p className="text-[#E5E2E1] text-lg font-light tracking-wide">
                                            {product.price.currency === 'INR' ? '₹' : product.price.currency === 'USD' ? '$' : ''}{product.price.amount.toLocaleString()}
                                        </p>
                                        <span className="text-[#D0C6AB] text-[10px] uppercase tracking-widest">{new Date(product.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Dashboard;
