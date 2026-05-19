import React, { useEffect } from 'react'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import Navbar from '../../../components/Navbar';

const SellerCart = () => {
    const user = useSelector((state) => state.auth.user);
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect if not logged in
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#f5f5f3] text-black">
            <Navbar variant="light" />
            <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-24">
                <div className="flex flex-col items-center justify-center gap-8 py-24">
                    <div className="text-center">
                        <h1 className="text-3xl sm:text-4xl font-light uppercase tracking-[0.28em] text-black mb-4">
                            Seller Cart
                        </h1>
                        <p className="text-sm text-black/60 mb-8">
                            Manage your seller inventory and orders
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="px-8 py-3 border border-black bg-black text-white text-[11px] font-medium uppercase tracking-[0.35em] hover:bg-white hover:text-black transition-all duration-300"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SellerCart;
