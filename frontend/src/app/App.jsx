import "./App.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Suspense, useEffect } from "react";
import { RouterProvider } from "react-router";
import { routes } from "./app.routes";
import { useAuth } from "../features/auth/hook/useAuth";
import ErrorBoundary from "../components/ErrorBoundary";

function PageLoader() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-[#f5f5f3]"
      role="status"
      aria-label="Loading"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/20 border-t-black" />
    </div>
  );
}

function App() {
  const { handleGetMe } = useAuth();
  useEffect(() => {
    handleGetMe();
  }, []);
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <RouterProvider router={routes} />
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
