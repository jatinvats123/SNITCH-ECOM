import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useProduct } from '../hooks/useProduct';
import Navbar from '../../../components/Navbar';

const Home = () => {
    const products = useSelector((state) => state.product.products);
    const { handleGetAllProducts } = useProduct();

    useEffect(() => {
        handleGetAllProducts();
    }, []);

    return (
        <div className="min-h-screen bg-[#f5f5f3] text-black selection:bg-yellow-500/30">
            <Navbar variant="light" />
            
            <main className="pt-24 pb-16 sm:pt-32 sm:pb-24 lg:pb-32 px-5 sm:px-8 lg:px-10 max-w-[1400px] mx-auto">
                {/* Header Section */}
                <div className="mb-12 sm:mb-16 md:mb-20">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight mb-4">
                        Discover collection
                        <span className="block text-yellow-500 font-medium italic mt-2">New Arrivals.</span>
                    </h1>
                    <p className="text-black/60 max-w-xl text-sm sm:text-base leading-relaxed">
                        Explore our latest premium arrivals designed for the modern individual. Elevate your aesthetic with cutting-edge fashion that pushes boundaries.
                    </p>
                </div>

                {/* Products Grid */}
                {products && products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12 sm:gap-x-8 sm:gap-y-16">
                        {products.map((product) => (
                            <div key={product._id} className="group relative flex flex-col">
                                {/* Image Container */}
                                <div className="relative aspect-[3/4] w-full overflow-hidden bg-black/5 rounded-2xl mb-5">
                                    <img
                                        src={product.images && product.images.length > 0 ? product.images[0].url : 'https://placehold.co/400x533/f5f5f3/000000/webp?text=No+Image'}
                                        alt={product.title}
                                        className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                                    />
                                    
                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    
                                    {/* Add to Cart Button */}
                                    <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 flex gap-2">
                                        <button className="w-full rounded-xl bg-white/70 backdrop-blur-md border border-black/10 py-3 text-sm font-medium text-black hover:bg-yellow-500 hover:border-yellow-500 hover:text-black transition-colors duration-300 shadow-sm">
                                            Quick Add
                                        </button>
                                    </div>
                                </div>

                                {/* Product Info */}
                                <div className="flex flex-col gap-1.5 px-1">
                                    <h3 className="text-base font-medium text-black/90 line-clamp-1 group-hover:text-yellow-600 transition-colors">
                                        {product.title}
                                    </h3>
                                    <p className="text-sm text-black/50 line-clamp-2 leading-relaxed">
                                        {product.description}
                                    </p>
                                    <div className="mt-2 flex items-center justify-between">
                                        <p className="text-lg font-medium text-black">
                                            {product.price?.currency === 'INR' ? '₹' : '$'}
                                            {product.price?.amount?.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="w-16 h-16 border-t-2 border-r-2 border-yellow-500 rounded-full animate-spin mb-6"></div>
                        <p className="text-black/50 tracking-wider uppercase text-sm">Loading collection...</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Home;
