import {createBrowserRouter} from "react-router";
import { useLocation } from "react-router";
import Register from "../features/auth/pages/Register";
import Login from "../features/auth/pages/Login";
import { useSelector } from "react-redux";

const Home = () => <h1>hello</h1>;

const RootPage = () => {
    const user = useSelector((state) => state.auth.user);
    const location = useLocation();
    const googleSuccess = new URLSearchParams(location.search).get("google") === "success";

    if (user || googleSuccess) {
        return <Home />;
    }

    return <Register />;
};

export const routes = createBrowserRouter([
    {
        path:"/",
        element:<RootPage/>
    },
    {
        path:"/register",
        element:<Register/>
    },
    {
        path:"/login",
        element:<Login/>
    }
])
