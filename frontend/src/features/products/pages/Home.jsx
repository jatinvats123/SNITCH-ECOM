import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { useProduct } from '../hooks/useProduct';
import Navbar from '../../../components/Navbar';

const Home = () => {
    const products = useSelector((state) => state.product.products);
    const navigate = useNavigate();
    const { handleGetAllProducts } = useProduct();
    const [liveTime, setLiveTime] = useState(() => new Date());

    const dateFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    const timeFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: 'numeric',
        minute: '2-digit',
        hour12: false,
    });

    useEffect(() => {
        handleGetAllProducts();
    }, []);

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            setLiveTime(new Date());
        }, 1000);
        return () => window.clearInterval(intervalId);
    }, []);

    return (
        <div className="min-h-screen bg-white text-black selection:bg-black/10">
            <Navbar variant="light" animatedBrand />

            {/* ── Hero: Video ── */}
            <section className="relative h-[99.6vh] min-h-[560px] overflow-hidden bg-[#f7f7f5]">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster="/register-bg.png"
                    className="absolute inset-0 h-full w-full object-cover object-top opacity-80"
                >
                    <source src="/avnique%20video%20for%20login%20page.mp4" type="video/mp4" />
                </video>

                {/* Soft dark overlay — just enough depth */}
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-white/75" />

                {/* Live clock — top centre */}
                <div className="absolute left-1/2 top-20 -translate-x-1/2 text-center sm:top-24">
                    <div className="inline-flex flex-wrap items-center justify-center gap-2 text-[9px] uppercase tracking-[0.3em] text-black/50 sm:text-[10px]">
                        <span>India, Delhi</span>
                        <span className="text-black/20">|</span>
                        <span>{dateFormatter.format(liveTime)}</span>
                        <span className="text-black/20">|</span>
                        <span>{timeFormatter.format(liveTime)}</span>
                        <span>IST</span>
                    </div>
                </div>

                {/* Hero copy — bottom left */}
                <div className="absolute left-6 right-6 bottom-14 sm:left-10 sm:right-10 sm:bottom-20 lg:left-16 lg:right-16">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl font-light leading-tight text-black/90 sm:text-5xl md:text-6xl lg:text-7xl">
                            Presence,<br />
                            <span className="italic">tailored.</span>
                        </h1>
                    </div>
                </div>
            </section>

            {/* ── Products Section ── */}
            <main className="max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-16 pt-24 pb-36">

                {/* Section header */}
                <div className="mb-20">
                    <p className="text-[10px] uppercase tracking-[0.4em] text-black/30 mb-6">
                        New Arrivals
                    </p>
                    <div className="flex items-end justify-between gap-6">
                        <h2 className="text-3xl sm:text-4xl font-light text-black leading-snug">
                            Discover the<br />
                            <span className="italic">collection.</span>
                        </h2>
                        <p className="hidden sm:block text-sm text-black/35 leading-relaxed max-w-xs text-right">
                            Premium pieces designed for the modern individual who moves with quiet confidence.
                        </p>
                    </div>
                </div>

                {/* Rule */}
                <div className="w-full h-px bg-black/8 mb-16" />

                {/* Grid */}
                {products && products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-20">
                        {products.map((product) => (
                            <div
                                key={product._id}
                                onClick={() => navigate(`/product/${product._id}`)}
                                className="group cursor-pointer"
                            >
                                {/* Image */}
                                <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#f7f7f5] mb-6">
                                    <img
                                        src={
                                            product.images?.length > 0
                                                ? product.images[0].url
                                                : 'https://placehold.co/400x533/f7f7f5/cccccc/webp?text='
                                        }
                                        alt={product.title}
                                        className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                                    />

                                    {/* Hover CTA */}
                                    <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
                                        <div className="py-3.5 bg-black text-white text-[10px] uppercase tracking-[0.35em] text-center">
                                            View Product
                                        </div>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex flex-col gap-2 px-0.5">
                                    <h3 className="text-sm font-light text-black/80 leading-snug group-hover:text-black transition-colors duration-200">
                                        {product.title}
                                    </h3>
                                    <p className="text-xs text-black/35 leading-relaxed line-clamp-2">
                                        {product.description}
                                    </p>
                                    <p className="mt-2 text-sm font-light text-black tracking-wide">
                                        {product.price?.currency === 'INR' ? '₹' : '$'}
                                        {product.price?.amount?.toLocaleString('en-IN')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-40 gap-6">
                        <div className="w-8 h-8 rounded-full border border-black/15 border-t-black/50 animate-spin" />
                        <p className="text-[10px] uppercase tracking-[0.35em] text-black/30">
                            Loading collection…
                        </p>
                    </div>
                )}
            </main>

            {/* Footer strip */}
            <footer className="border-t border-black/8 py-10 px-6 sm:px-10 lg:px-16 max-w-screen-xl mx-auto">
                <div className="flex items-center justify-between">
                    <p className="text-[10px] uppercase tracking-[0.35em] text-black/25">Aveniq</p>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-black/20">
                        © {new Date().getFullYear()}
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
