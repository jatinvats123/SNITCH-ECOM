import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useSelector } from "react-redux";
import Navbar from "../../../components/Navbar";
import { useOrders } from "../hooks/useOrders";
import { formatMoney, formatPaise, formatOrderDate, STATUS_STYLES } from "../utils/format";

const Shell = ({ children }) => (
  <div className="min-h-screen bg-[#f5f5f3] text-black">
    <Navbar variant="light" />
    <main className="mx-auto max-w-3xl px-6 py-24 sm:px-10">{children}</main>
  </div>
);

const OrderDetail = () => {
  const { orderId } = useParams();
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const { handleGetOrderById } = useOrders();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    let active = true;
    handleGetOrderById(orderId)
      .then((data) => active && setOrder(data))
      .catch(
        (err) =>
          active &&
          setError(
            err?.response?.status === 404
              ? "Order not found."
              : "We couldn't load this order. Please try again.",
          ),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [user, orderId]);

  const backLink = (
    <Link
      to="/orders"
      className="mb-8 inline-block text-[11px] uppercase tracking-[0.3em] text-black/50 underline underline-offset-4 transition-colors hover:text-black"
    >
      ← Back to orders
    </Link>
  );

  if (loading) {
    return (
      <Shell>
        <div
          className="h-64 animate-pulse rounded-lg border border-black/10 bg-white/60"
          aria-hidden="true"
        />
      </Shell>
    );
  }

  if (error || !order) {
    return (
      <Shell>
        {backLink}
        <p className="text-sm text-red-600">{error || "Order not found."}</p>
      </Shell>
    );
  }

  return (
    <Shell>
      {backLink}

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-light uppercase tracking-[0.28em]">Order</h1>
          <p className="mt-2 font-mono text-xs text-black/60">#{order._id}</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-black/45">
            {formatOrderDate(order.paidAt || order.createdAt)}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] ${
            STATUS_STYLES[order.status] || "bg-black/10 text-black/60"
          }`}
        >
          {order.status}
        </span>
      </div>

      <ul className="divide-y divide-black/10 border-y border-black/10">
        {order.items.map((item, index) => (
          <li key={`${item.product}-${index}`} className="flex gap-4 py-5">
            <div className="h-20 w-16 shrink-0 overflow-hidden rounded bg-[#f0ede7]">
              <img
                src={item.image || "https://placehold.co/120x160/f7f7f7/cccccc"}
                alt={item.title}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-1 items-start justify-between gap-4">
              <div>
                <p className="font-medium">{item.title}</p>
                {item.label && (
                  <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-black/45">
                    {item.label}
                  </p>
                )}
                <p className="mt-1 text-sm text-black/55">Qty {item.quantity}</p>
              </div>
              <p className="whitespace-nowrap font-medium">
                {formatMoney(item.price?.amount * item.quantity, item.price?.currency)}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 space-y-2 text-sm">
        <div className="flex justify-between text-black/70">
          <span>Subtotal</span>
          <span>{formatPaise(order.subtotal, order.currency)}</span>
        </div>
        <div className="flex justify-between text-black/70">
          <span>Tax</span>
          <span>{formatPaise(order.tax, order.currency)}</span>
        </div>
        <div className="flex justify-between border-t border-black/10 pt-3 text-base font-semibold">
          <span>Total</span>
          <span>{formatPaise(order.amount, order.currency)}</span>
        </div>
      </div>
    </Shell>
  );
};

export default OrderDetail;
