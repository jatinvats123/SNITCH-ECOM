import {createBrowserRouter} from "react-router";
import App from "./App";
import Register from "../features/auth/pages/Register";

export const routes = createBrowserRouter([
    {
        path:"/",
        element:<Register/>
    },
    {
        path:"/register",
        element:<Register/>
    }
])
