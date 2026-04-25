import {createBrowserRouter} from "react-router";
import { useLocation } from "react-router";
import Register from "../features/auth/pages/Register";
import Login from "../features/auth/pages/Login";
import CreateProduct from "../features/products/pages/CreateProduct";
import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import Dashboard from "../features/products/pages/Dashboard";
import Protected from "../features/auth/components/Protected";
import Home from "../features/products/pages/Home";

const LandingPage = () => {
    return (
        <div className="min-h-screen relative overflow-hidden bg-black text-white">
            <Navbar />
            <video
                autoPlay
                loop
                muted
                playsInline
                poster="/register-bg.png"
                className="absolute inset-0 h-full w-full object-cover object-top opacity-70"
            >
                <source src="/avnique%20video%20for%20login%20page.mp4" type="video/mp4" />
            </video>

            <div className="absolute inset-0 bg-black/45" />
            <div className="absolute inset-0 bg-linear-to-b from-black/30 via-transparent to-black/70" />

            <div className="relative z-10 min-h-screen" />
        </div>
    );
};

const RootPage = () => {
    const user = useSelector((state) => state.auth.user);
    const location = useLocation();
    const googleSuccess = new URLSearchParams(location.search).get("google") === "success";

    if (user || googleSuccess) {
        return <Home />;
    }

    return <LandingPage />;
};

export const routes = createBrowserRouter([
    {
        path:"/",
        element:<Home/>
    },
    {
        path:"/register",
        element:<Register/>
    },
    {
        path:"/login",
        element:<Login/>
    },
    {
        path:"/seller",
        children:[
            {
                path:"/seller/create-product",
                element:<Protected role="seller"><CreateProduct/></Protected>
               
            },
            {
                path:"/seller/dashboard",
                element:<Protected role="seller">
                    <Dashboard/>
                </Protected>

            }
        ]
    }
])
