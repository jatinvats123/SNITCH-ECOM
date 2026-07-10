import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useProduct } from '../hooks/useProduct';
import { useCart } from '../../cart/hooks/useCart';
import Navbar from '../../../components/Navbar';

const ProductDetail = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const { handleGetProductById } = useProduct();
    const { handleAddToCart } = useCart();
 console.log(product)
    useEffect(() => {
        async function fetchProductDetail() {
            setLoading(true);
            const data = await handleGetProductById(productId);
            setProduct(data);
            setSelectedVariant(null);
            setLoading(false);
        }
        fetchProductDetail();
    }, [productId]);


      const formatPrice = (amount, currency) => {
        const symbol = currency === 'INR' ? '₹' : '$';
        return `${symbol}${amount?.toLocaleString('en-IN')}`;
    };

    // Get display values from variant or product
    const getDisplayValue = (key) => {
        if (selectedVariant) {
            if (key === 'price') return selectedVariant.price || product.price;
            if (key === 'images') return selectedVariant.images?.length > 0 ? selectedVariant.images : product.images;
            if (key === 'stock') return selectedVariant.stock;
            if (key === 'attributes') return selectedVariant.attributes;
        }
        if (key === 'price') return product.price;
        if (key === 'images') return product.images;
        if (key === 'attributes') return null;
        return null;
    };

    // Get all unique attributes from all variants
    const getAllAttributes = () => {
        const attrSet = new Map();
        if (product?.variants) {
            product.variants.forEach(variant => {
                const attributes = variant.attributes instanceof Map
                    ? Object.fromEntries(variant.attributes.entries())
                    : variant.attributes;

                if (attributes) {
                    Object.entries(attributes).forEach(([key, value]) => {
                        if (!attrSet.has(key)) {
                            attrSet.set(key, []);
                        }
                        if (!attrSet.get(key).includes(value)) {
                            attrSet.get(key).push(value);
                        }
                    });
                }
            });
        }
        return attrSet;
    };

    /* ── Loading ── */
    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border border-black/20 border-t-black animate-spin" />
            </div>
        );
    }

    /* ── Not found ── */
    if (!product) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-8">
                <p className="text-[10px] uppercase tracking-[0.35em] text-black/30">Product not found</p>
                <button
                    onClick={() => navigate('/')}
                    className="text-[11px] uppercase tracking-[0.3em] underline underline-offset-4 text-black/40 hover:text-black transition-colors"
                >
                    Return to collection
                </button>
            </div>
        );
    }

    const images = getDisplayValue('images')?.length > 0 ? getDisplayValue('images') : [];
    const currentImage = images[selectedImage]?.url
        || 'https://placehold.co/800x1000/f7f7f7/cccccc/webp?text=';
    const displayPrice = getDisplayValue('price');
    const displayStock = getDisplayValue('stock');
    const displayAttributes = getDisplayValue('attributes');

    return (
        <div className="min-h-screen bg-white text-black selection:bg-black/10">
            <style>{`
                @keyframes wavePass {
                    0% {
                        transform: translateX(0);
                        opacity: 0;
                    }
                    18% {
                        opacity: 1;
                    }
                    72% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateX(320%);
                        opacity: 0;
                    }
                }
            `}</style>
            <Navbar variant="light" />

            {/* ── Page wrapper ── */}
            <div className="max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-16">

                {/* Back */}
                <div className="pt-28 pb-12">
                    <button
                        onClick={() => navigate(-1)}
                        className="group inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.35em] text-black/30 hover:text-black transition-colors duration-300"
                    >
                        <span className="block w-6 h-px bg-current transition-all duration-300 group-hover:w-10" />
                        Collection
                    </button>
                </div>

                {/* ── Two-column layout ── */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-16 xl:gap-28 pb-32">

                    {/* ── Left: Image ── */}
                    <div className="flex flex-col gap-5">
                        {/* Primary image */}
                        <div className="relative w-full aspect-[3/4] bg-[#f7f7f5] overflow-hidden">
                            <img
                                src={currentImage}
                                alt={product.title}
                                className="w-full h-full object-cover object-center transition-opacity duration-500"
                            />
                        </div>

                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="flex gap-3">
                                {images.map((img, idx) => (
                                    <button
                                        key={img._id || idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`w-16 h-20 overflow-hidden transition-all duration-200 ${
                                            selectedImage === idx
                                                ? 'opacity-100 ring-1 ring-black/70 ring-offset-2'
                                                : 'opacity-35 hover:opacity-65'
                                        }`}
                                    >
                                        <img
                                            src={img.url}
                                            alt=""
                                            className="w-full h-full object-cover object-center"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Right: Info ── */}
                    <div className="flex flex-col lg:sticky lg:top-24 lg:self-start">

                        {/* Category label */}
                        <p className="text-[10px] uppercase tracking-[0.4em] text-black/30 mb-10">
                            New Arrival
                        </p>

                        {/* Title */}
                        <h1 className="text-3xl sm:text-4xl font-light leading-snug text-black mb-8">
                            {product.title}
                        </h1>

                        {/* Price */}
                        <p className="text-2xl font-light tracking-wide text-black mb-4">
                            {formatPrice(displayPrice?.amount, displayPrice?.currency)}
                        </p>

                        {/* Stock info */}
                        {displayStock !== null && (
                            <p className="text-sm text-black/50 mb-16">
                                {displayStock > 0 ? `${displayStock} in stock` : 'Out of stock'}
                            </p>
                        )}

                        {/* Rule */}
                        <div className="w-full h-px bg-black/8 mb-12" />

                        {/* Description */}
                        <p className="text-sm leading-8 text-black/45 mb-16 max-w-md">
                            {product.description}
                        </p>

                        {/* Rule */}
                        <div className="w-full h-px bg-black/8 mb-14" />

                        {/* Variants selector */}
                        {product.variants && product.variants.length > 0 && (
                            <div className="mb-14">
                                <div className="mb-6">
                                    <p className="text-[10px] uppercase tracking-[0.35em] text-black/50 mb-4">
                                        Available Variants
                                    </p>
                                    <div className="flex flex-wrap gap-4">
                                        {product.variants.map((variant, idx) => {
                                            const isSelected = selectedVariant?._id === variant._id;
                                            const variantImage = variant.images?.[0]?.url || product.images?.[0]?.url || 'https://placehold.co/100x100/f7f7f7/cccccc';
                                            const variantAttributes = variant.attributes instanceof Map
                                                ? Object.fromEntries(variant.attributes.entries())
                                                : variant.attributes;
                                            const variantAttrs = variantAttributes
                                                ? Object.entries(variantAttributes).map(([k, v]) => `${k}: ${v}`).join(' / ')
                                                : `Variant ${idx + 1}`;
                                            
                                            return (
                                                <button
                                                    key={variant._id}
                                                    onClick={() => {
                                                        setSelectedVariant(variant);
                                                        setSelectedImage(0);
                                                    }}
                                                    className={`relative w-24 h-28 overflow-hidden transition-all duration-200 ${
                                                        isSelected
                                                            ? 'ring-2 ring-black ring-offset-2'
                                                            : 'ring-1 ring-black/20 hover:ring-black/50'
                                                    }`}
                                                    title={variantAttrs}
                                                >
                                                    <img
                                                        src={variantImage}
                                                        alt={variantAttrs}
                                                        className="w-full h-full object-cover object-center"
                                                    />
                                                    {isSelected && (
                                                        <div className="absolute inset-0 bg-black/10" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {selectedVariant && (
                                        <button
                                            onClick={() => {
                                                setSelectedVariant(null);
                                                setSelectedImage(0);
                                            }}
                                            className="mt-3 text-[10px] uppercase tracking-[0.3em] text-black/50 hover:text-black underline underline-offset-2 transition-colors"
                                        >
                                            Clear selection
                                        </button>
                                    )}
                                </div>
                                <div className="w-full h-px bg-black/8" />
                            </div>
                        )}

                        {/* Rule */}
                        <div className="w-full h-px bg-black/8 mb-14" />
                        <div className="flex flex-col gap-4 mb-16">
                            {/* Buy Now — primary */}
                            <button
                                id="buy-now-btn"
                                type="button"
                                className="group relative w-full overflow-hidden py-4 bg-black text-white text-[11px] uppercase tracking-[0.35em] hover:bg-black/85 active:scale-[0.99] transition-all duration-200"
                            >
                                <span className="pointer-events-none absolute -left-1/3 top-0 h-full w-2/5 rounded-r-full bg-white opacity-0 group-hover:animate-[wavePass_700ms_ease-out_1]" />
                                <span className="relative z-10">Buy Now</span>
                            </button>

                            {/* Add to Cart — secondary */}
                            <button
                                onClick={() => handleAddToCart(product._id, selectedVariant?.variantId || selectedVariant?._id)}
                                id="add-to-cart-btn"
                                type="button"
                                className="group relative w-full overflow-hidden py-4 border border-black/15 text-black text-[11px] uppercase tracking-[0.35em] hover:border-black/50 hover:bg-black/3 active:scale-[0.99] transition-all duration-200"
                            >
                                <span className="pointer-events-none absolute -left-1/3 top-0 h-full w-2/5 rounded-r-full bg-black opacity-0 group-hover:animate-[wavePass_700ms_ease-out_1]" />
                                <span className="relative z-10">Add to Cart</span>
                            </button>
                        </div>

                        {/* Fine details */}
                        <div className="flex flex-col gap-3.5">
                            {[
                                ['Free shipping on all orders'],
                                ['Hassle-free 30-day returns'],
                                ['Secure, encrypted checkout'],
                            ].map(([text]) => (
                                <div key={text} className="flex items-center gap-3">
                                    <span className="block w-3 h-px bg-black/25" />
                                    <span className="text-[11px] uppercase tracking-[0.25em] text-black/30">
                                        {text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
