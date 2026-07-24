import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import Navbar from "../../../components/Navbar";
import { useOrders } from "../hooks/useOrders";
import { formatPaise, formatOrderDate, STATUS_STYLES } from "../utils/format";

const Shell = ({ children }) => (
  <div className="min-h-screen bg-[#f5f5f3] text-black">
    <Navbar variant="light" />
    <main className="mx-auto max-w-5xl px-6 py-24 sm:px-10">{children}</main>
  </div>
);

const Orders = () => {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const { handleGetMyOrders } = useOrders();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    let active = true;
    handleGetMyOrders()
      .then((data) => active && setOrders(data || []))
      .catch(() => active && setError("We couldn't load your orders. Please try again."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [user]);

  const heading = (
    <div className="mb-12">
      <h1 className="mb-2 text-3xl font-light uppercase tracking-[0.28em] sm:text-4xl">Orders</h1>
      <p className="text-sm text-black/60">Your order history</p>
    </div>
  );

  if (loading) {
    return (
      <Shell>
        {heading}
        <div className="space-y-4" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-lg border border-black/10 bg-white/60"
            />
          ))}
        </div>
      </Shell>
    );
  }

  if (error) {
    return (
      <Shell>
        {heading}
        <p className="text-sm text-red-600">{error}</p>
      </Shell>
    );
  }

  if (orders.length === 0) {
    return (
      <Shell>
        {heading}
        <div className="flex flex-col items-center gap-6 py-16 text-center">
          <p className="text-sm text-black/60">You haven't placed any orders yet.</p>
          <button
            onClick={() => navigate("/")}
            className="border border-black bg-black px-8 py-3 text-[11px] font-medium uppercase tracking-[0.35em] text-white transition-all duration-300 hover:bg-white hover:text-black"
          >
            Start Shopping
          </button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      {heading}
      <ul className="space-y-4">
        {orders.map((order) => (
          <li key={order._id}>
            <Link
              to={`/orders/${order._id}`}
              className="block rounded-lg border border-black/10 bg-white/60 p-6 transition-all duration-300 hover:border-black/25"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-black/45">
                    {formatOrderDate(order.paidAt || order.createdAt)}
                  </p>
                  <p className="mt-1 font-mono text-xs text-black/70">#{order._id.slice(-8)}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] ${
                    STATUS_STYLES[order.status] || "bg-black/10 text-black/60"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between gap-4">
                <p className="text-sm text-black/60">
                  {order.items.length} {order.items.length === 1 ? "item" : "items"}
                  {order.items[0] ? ` · ${order.items[0].title}` : ""}
                  {order.items.length > 1 ? ` +${order.items.length - 1} more` : ""}
                </p>
                <p className="text-lg font-semibold">{formatPaise(order.amount, order.currency)}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Shell>
  );
};

export default Orders;
