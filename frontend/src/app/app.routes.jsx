/* eslint-disable react-refresh/only-export-components -- route config exports the router, not components */
import { lazy } from "react";
import { createBrowserRouter } from "react-router";
import Protected from "../features/auth/components/Protected";

// Route-level code splitting: each page becomes its own chunk, loaded on demand.
// The Suspense fallback lives at the app root (App.jsx).
const Home = lazy(() => import("../features/products/pages/Home"));
const Register = lazy(() => import("../features/auth/pages/Register"));
const Login = lazy(() => import("../features/auth/pages/Login"));
const ForgotPassword = lazy(() => import("../features/auth/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("../features/auth/pages/ResetPassword"));
const ProductDetail = lazy(() => import("../features/products/pages/ProductDetail"));
const CreateProduct = lazy(() => import("../features/products/pages/CreateProduct"));
const Dashboard = lazy(() => import("../features/products/pages/Dashboard"));
const SellerProductDetail = lazy(() => import("../features/products/pages/SellerProductDetail"));
const Cart = lazy(() => import("../features/cart/pages/Cart"));
const Orders = lazy(() => import("../features/orders/pages/Orders"));
const OrderDetail = lazy(() => import("../features/orders/pages/OrderDetail"));

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password/:token",
    element: <ResetPassword />,
  },
  {
    path: "/product/:productId",
    element: <ProductDetail />,
  },
  {
    path: "/seller",
    children: [
      {
        path: "/seller/create-product",
        element: (
          <Protected role="seller">
            <CreateProduct />
          </Protected>
        ),
      },
      {
        path: "/seller/dashboard",
        element: (
          <Protected role="seller">
            <Dashboard />
          </Protected>
        ),
      },
      {
        path: "/seller/product/:productId",
        element: (
          <Protected role="seller">
            <SellerProductDetail />
          </Protected>
        ),
      },
    ],
  },
  {
    path: "/cart",
    element: (
      <Protected>
        <Cart />
      </Protected>
    ),
  },
  {
    path: "/orders",
    element: (
      <Protected>
        <Orders />
      </Protected>
    ),
  },
  {
    path: "/orders/:orderId",
    element: (
      <Protected>
        <OrderDetail />
      </Protected>
    ),
  },
]);
