import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useProduct } from "../hooks/useProduct";
import { useSelector } from "react-redux";

const Dashboard = () => {
    const { handleGetProducts, handleDeleteProduct } = useProduct();
    const navigate = useNavigate();
    const sellerProducts = useSelector((state) => state.product.sellerProducts);
    const user = useSelector((state) => state.auth.user);
    const [activeTab, setActiveTab] = useState('Overview');

    useEffect(() => {
        handleGetProducts();
    }, []);

    const handleDeleteListing = async (productId, title) => {
        const confirmed = window.confirm(`Delete ${title}? This will remove the listing from your store.`);
        if (!confirmed) return;

        try {
            await handleDeleteProduct(productId);
            await handleGetProducts();
        } catch (error) {
            console.error(error);
        }
    };

    const stats = [
        { label: 'Total Products', value: sellerProducts?.length || 0, icon: '📦' },
        { label: 'Active Listings', value: sellerProducts?.length || 0, icon: '✨' },
        { label: 'Total Sales', value: '₹0', icon: '💰' },
    ];

    const navigationItems = ['Overview', 'Products', 'Orders', 'Analytics', 'Settings'];

    const recentProducts = (sellerProducts || []).slice(0, 4);

    return (
        <div className="min-h-screen bg-[#f5f1ea] text-[#1f1b17] font-['Manrope'] selection:bg-[#1f1b17] selection:text-[#f5f1ea]">
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-[#d8c39a]/25 blur-3xl" />
                <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-[#efe5d1] blur-3xl" />
            </div>

            <aside className="fixed left-0 top-0 z-10 hidden h-full w-72 border-r border-black/5 bg-[#f7f3ec]/90 backdrop-blur-xl md:block">
                <div className="flex h-full flex-col justify-between p-8">
                    <div>
                        <div className="mb-14">
                            <p className="text-[0.7rem] uppercase tracking-[0.35em] text-[#8a7a64]">Aveniq</p>
                            <h2 className="mt-3 text-2xl font-semibold tracking-tight">Seller Studio</h2>
                        </div>

                        <nav className="space-y-1">
                            {navigationItems.map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => setActiveTab(item)}
                                    className={`flex w-full items-center justify-between rounded-full px-4 py-3 text-left text-sm transition-colors ${item === activeTab
                                        ? 'bg-[#1f1b17] text-[#f7f3ec]'
                                        : 'text-[#6d6357] hover:bg-black/5 hover:text-[#1f1b17]'
                                        }`}
                                >
                                    <span>{item}</span>
                                    {item === activeTab ? <span className="h-2 w-2 rounded-full bg-[#d8c39a]" /> : null}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="rounded-3xl border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(31,27,23,0.06)]">
                        <p className="text-xs uppercase tracking-[0.25em] text-[#8a7a64]">Workspace</p>
                        <p className="mt-3 text-sm leading-6 text-[#5d5448]">
                            Keep product updates calm, clear, and easy to scan.
                        </p>
                    </div>
                </div>
            </aside>

            <main className="relative md:ml-72">
                <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 md:px-10 md:py-10 lg:px-12 lg:py-12">
                    <nav className="mb-6 flex gap-2 overflow-x-auto pb-1 md:hidden">
                        {navigationItems.map((item) => (
                            <button
                                key={item}
                                type="button"
                                onClick={() => setActiveTab(item)}
                                className={`shrink-0 rounded-full px-4 py-2 text-sm transition-colors ${item === activeTab
                                    ? 'bg-[#1f1b17] text-[#f7f3ec]'
                                    : 'bg-white/75 text-[#6d6357] hover:text-[#1f1b17]'
                                    }`}
                            >
                                {item}
                            </button>
                        ))}
                    </nav>

                    <header className="mb-10 flex flex-col gap-6 rounded-4xl border border-black/5 bg-white/75 p-6 shadow-[0_24px_80px_rgba(31,27,23,0.06)] backdrop-blur-xl sm:p-8 lg:flex-row lg:items-end lg:justify-between lg:p-10">
                        <div className="max-w-2xl">
                            <p className="text-[0.7rem] uppercase tracking-[0.35em] text-[#8a7a64]">Seller dashboard</p>
                            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#1f1b17] sm:text-5xl lg:text-6xl">
                                A quiet command center for your catalog.
                            </h1>
                            <p className="mt-4 max-w-xl text-base leading-7 text-[#6d6357] sm:text-lg">
                                Track products, review listings, and manage the store with more space and less noise.
                            </p>
                        </div>

                        {(activeTab === 'Overview' || activeTab === 'Products') && (
                            <button
                                type="button"
                                onClick={() => navigate('/seller/create-product')}
                                className="inline-flex items-center justify-center rounded-full bg-[#1f1b17] px-6 py-3 text-sm font-medium text-[#f7f3ec] transition-transform hover:-translate-y-0.5 hover:bg-[#2b251f]"
                            >
                                + Add Product
                            </button>
                        )}
                    </header>

                    {(activeTab === 'Overview' || activeTab === 'Analytics') && (
                        <section className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {stats.map((stat) => (
                                <div
                                    key={stat.label}
                                    className="rounded-[1.75rem] border border-black/5 bg-white/75 p-6 shadow-[0_18px_60px_rgba(31,27,23,0.05)] backdrop-blur-xl"
                                >
                                    <div className="mb-8 flex items-center justify-between">
                                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f3eadb] text-lg">
                                            {stat.icon}
                                        </span>
                                        <span className="text-xs uppercase tracking-[0.25em] text-[#8a7a64]">{activeTab}</span>
                                    </div>
                                    <p className="text-sm uppercase tracking-[0.24em] text-[#8a7a64]">{stat.label}</p>
                                    <h3 className="mt-3 text-4xl font-semibold tracking-tight text-[#1f1b17]">{stat.value}</h3>
                                </div>
                            ))}
                        </section>
                    )}

                    {activeTab === 'Overview' && (
                        <section className="rounded-4xl border border-black/5 bg-white/75 p-6 shadow-[0_24px_80px_rgba(31,27,23,0.06)] backdrop-blur-xl sm:p-8 lg:p-10">
                            <div className="mb-8 flex flex-col gap-3 border-b border-black/5 pb-6 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <p className="text-[0.7rem] uppercase tracking-[0.35em] text-[#8a7a64]">Inventory</p>
                                    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#1f1b17] sm:text-3xl">Recently added</h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('Products')}
                                    className="text-sm text-[#6d6357] underline-offset-4 hover:text-[#1f1b17] hover:underline"
                                >
                                    View all products →
                                </button>
                            </div>
                            {recentProducts.length > 0 ? (
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                    {recentProducts.map((product) => (
                                        <article
                                            key={product._id}
                                            onClick={() => navigate(`/seller/product/${product._id}`)}
                                            className="group cursor-pointer overflow-hidden rounded-[1.75rem] border border-black/5 bg-[#fbf8f3] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(31,27,23,0.08)]"
                                        >
                                            <div className="relative aspect-4/5 overflow-hidden bg-[#efe8de]">
                                                <img
                                                    src={product.images[0]?.url || 'https://via.placeholder.com/300x400?text=No+Image'}
                                                    alt={product.title}
                                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                            </div>
                                            <div className="p-4">
                                                <h3 className="truncate text-sm font-medium text-[#1f1b17]">{product.title}</h3>
                                                <p className="mt-1 text-xs text-[#6d6357]">
                                                    {product.price.currency === 'INR' ? '₹' : product.price.currency === 'USD' ? '$' : ''}
                                                    {product.price.amount.toLocaleString()}
                                                </p>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-[1.75rem] border border-dashed border-black/10 bg-[#fbf8f3] px-6 py-16 text-center sm:px-10">
                                    <p className="text-sm uppercase tracking-[0.3em] text-[#8a7a64]">No products yet</p>
                                    <h3 className="mt-4 text-2xl font-semibold tracking-tight text-[#1f1b17]">Create your first listing</h3>
                                    <p className="mx-auto mt-3 max-w-md text-base leading-7 text-[#6d6357]">
                                        Add a product to start building out the catalog and make this dashboard come alive.
                                    </p>
                                </div>
                            )}
                        </section>
                    )}

                    {activeTab === 'Products' && (
                        <section className="rounded-4xl border border-black/5 bg-white/75 p-6 shadow-[0_24px_80px_rgba(31,27,23,0.06)] backdrop-blur-xl sm:p-8 lg:p-10">
                            <div className="mb-8 flex flex-col gap-3 border-b border-black/5 pb-6 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <p className="text-[0.7rem] uppercase tracking-[0.35em] text-[#8a7a64]">Inventory</p>
                                    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#1f1b17] sm:text-3xl">Your products</h2>
                                </div>
                                <span className="text-sm text-[#6d6357]">{sellerProducts?.length || 0} items</span>
                            </div>
                            {sellerProducts && sellerProducts.length > 0 ? (
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {sellerProducts.map((product) => (
                                        <article
                                            key={product._id}
                                            className="group overflow-hidden rounded-[1.75rem] border border-black/5 bg-[#fbf8f3] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(31,27,23,0.08)]"
                                        >
                                            <div
                                                onClick={() => navigate(`/seller/product/${product._id}`)}
                                                className="relative aspect-4/5 overflow-hidden bg-[#efe8de] cursor-pointer"
                                            >
                                                <img
                                                    src={product.images[0]?.url || 'https://via.placeholder.com/300x400?text=No+Image'}
                                                    alt={product.title}
                                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                                <div className="absolute left-4 top-4 rounded-full border border-white/40 bg-white/80 px-3 py-1 text-[0.65rem] uppercase tracking-[0.25em] text-[#5d5448] backdrop-blur-md">
                                                    Active
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        handleDeleteListing(product._id, product.title);
                                                    }}
                                                    className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[0.65rem] uppercase tracking-[0.25em] text-[#8b3c2b] shadow-sm transition-colors hover:bg-white hover:text-[#5f1f14]"
                                                >
                                                    Remove
                                                </button>
                                            </div>

                                            <div className="space-y-4 p-5 sm:p-6">
                                                <div className="space-y-1">
                                                    <h3 className="truncate text-lg font-medium text-[#1f1b17]">{product.title}</h3>
                                                    <p className="text-sm text-[#6d6357]">
                                                        {product.price.currency === 'INR' ? '₹' : product.price.currency === 'USD' ? '$' : ''}
                                                        {product.price.amount.toLocaleString()}
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between border-t border-black/5 pt-4 text-xs uppercase tracking-[0.2em] text-[#8a7a64]">
                                                    <span>Listed</span>
                                                    <span>{new Date(product.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-[1.75rem] border border-dashed border-black/10 bg-[#fbf8f3] px-6 py-16 text-center sm:px-10">
                                    <p className="text-sm uppercase tracking-[0.3em] text-[#8a7a64]">No products yet</p>
                                    <h3 className="mt-4 text-2xl font-semibold tracking-tight text-[#1f1b17]">Create your first listing</h3>
                                    <p className="mx-auto mt-3 max-w-md text-base leading-7 text-[#6d6357]">
                                        Add a product to start building out the catalog and make this dashboard come alive.
                                    </p>
                                </div>
                            )}
                        </section>
                    )}

                    {activeTab === 'Orders' && (
                        <section className="rounded-4xl border border-black/5 bg-white/75 p-6 shadow-[0_24px_80px_rgba(31,27,23,0.06)] backdrop-blur-xl sm:p-8 lg:p-10">
                            <div className="mb-8 border-b border-black/5 pb-6">
                                <p className="text-[0.7rem] uppercase tracking-[0.35em] text-[#8a7a64]">Fulfillment</p>
                                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#1f1b17] sm:text-3xl">Orders</h2>
                            </div>
                            <div className="rounded-[1.75rem] border border-dashed border-black/10 bg-[#fbf8f3] px-6 py-16 text-center sm:px-10">
                                <p className="text-sm uppercase tracking-[0.3em] text-[#8a7a64]">No orders yet</p>
                                <h3 className="mt-4 text-2xl font-semibold tracking-tight text-[#1f1b17]">Orders will show up here</h3>
                                <p className="mx-auto mt-3 max-w-md text-base leading-7 text-[#6d6357]">
                                    Once a customer checks out with one of your products, it'll appear in this list for you to track and fulfill.
                                </p>
                            </div>
                        </section>
                    )}

                    {activeTab === 'Analytics' && (
                        <section className="rounded-4xl border border-black/5 bg-white/75 p-6 shadow-[0_24px_80px_rgba(31,27,23,0.06)] backdrop-blur-xl sm:p-8 lg:p-10">
                            <div className="mb-8 border-b border-black/5 pb-6">
                                <p className="text-[0.7rem] uppercase tracking-[0.35em] text-[#8a7a64]">Insights</p>
                                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#1f1b17] sm:text-3xl">Analytics</h2>
                            </div>
                            <div className="rounded-[1.75rem] border border-dashed border-black/10 bg-[#fbf8f3] px-6 py-16 text-center sm:px-10">
                                <p className="text-sm uppercase tracking-[0.3em] text-[#8a7a64]">Not enough data yet</p>
                                <h3 className="mt-4 text-2xl font-semibold tracking-tight text-[#1f1b17]">Trends will appear once you have sales</h3>
                                <p className="mx-auto mt-3 max-w-md text-base leading-7 text-[#6d6357]">
                                    Revenue, top products, and traffic trends will show up here once orders start coming in. Your current catalog snapshot is above.
                                </p>
                            </div>
                        </section>
                    )}

                    {activeTab === 'Settings' && (
                        <section className="rounded-4xl border border-black/5 bg-white/75 p-6 shadow-[0_24px_80px_rgba(31,27,23,0.06)] backdrop-blur-xl sm:p-8 lg:p-10">
                            <div className="mb-8 border-b border-black/5 pb-6">
                                <p className="text-[0.7rem] uppercase tracking-[0.35em] text-[#8a7a64]">Account</p>
                                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#1f1b17] sm:text-3xl">Settings</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="rounded-[1.75rem] border border-black/5 bg-[#fbf8f3] p-6">
                                    <p className="text-xs uppercase tracking-[0.25em] text-[#8a7a64]">Full Name</p>
                                    <p className="mt-2 text-lg text-[#1f1b17]">{user?.fullName || '—'}</p>
                                </div>
                                <div className="rounded-[1.75rem] border border-black/5 bg-[#fbf8f3] p-6">
                                    <p className="text-xs uppercase tracking-[0.25em] text-[#8a7a64]">Email</p>
                                    <p className="mt-2 text-lg text-[#1f1b17]">{user?.email || '—'}</p>
                                </div>
                                <div className="rounded-[1.75rem] border border-black/5 bg-[#fbf8f3] p-6">
                                    <p className="text-xs uppercase tracking-[0.25em] text-[#8a7a64]">Contact</p>
                                    <p className="mt-2 text-lg text-[#1f1b17]">{user?.contact || '—'}</p>
                                </div>
                                <div className="rounded-[1.75rem] border border-black/5 bg-[#fbf8f3] p-6">
                                    <p className="text-xs uppercase tracking-[0.25em] text-[#8a7a64]">Role</p>
                                    <p className="mt-2 text-lg capitalize text-[#1f1b17]">{user?.role || '—'}</p>
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
