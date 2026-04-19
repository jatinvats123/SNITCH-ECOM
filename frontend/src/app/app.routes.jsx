import {createBrowserRouter} from "react-router";
import Register from "../features/auth/pages/Register";
import Login from "../features/auth/pages/Login";
import { useSelector } from "react-redux";

const Home = () => <h1>hello</h1>;

const RootPage = () => {
    const user = useSelector((state) => state.auth.user);

    if (user) {
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
