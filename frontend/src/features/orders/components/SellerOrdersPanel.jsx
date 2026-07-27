import { formatMoney, formatOrderDate, sellerOrderTotal, STATUS_STYLES } from "../utils/format";

const EmptyState = () => (
  <div className="rounded-[1.75rem] border border-dashed border-black/10 bg-[#fbf8f3] px-6 py-16 text-center sm:px-10">
    <p className="text-sm uppercase tracking-[0.3em] text-[#8a7a64]">No orders yet</p>
    <h3 className="mt-4 text-2xl font-semibold tracking-tight text-[#1f1b17]">
      Orders will show up here
    </h3>
    <p className="mx-auto mt-3 max-w-md text-base leading-7 text-[#6d6357]">
      Once a customer checks out with one of your products, it'll appear in this list for you to
      track and fulfill.
    </p>
  </div>
);

function SellerOrdersPanel({ orders, loading, error }) {
  if (loading) {
    return (
      <div className="space-y-4" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-36 animate-pulse rounded-[1.75rem] border border-black/5 bg-[#fbf8f3]"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-[#8b3c2b]">{error}</p>;
  }

  if (!orders || orders.length === 0) {
    return <EmptyState />;
  }

  return (
    <ul className="space-y-5">
      {orders.map((order) => {
        const currency = order.items[0]?.price?.currency || order.currency || "INR";
        const units = order.items.reduce((n, item) => n + (item.quantity || 0), 0);
        return (
          <li
            key={order._id}
            className="rounded-[1.75rem] border border-black/5 bg-[#fbf8f3] p-6 sm:p-7"
          >
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-black/5 pb-4">
              <div>
                <p className="text-[0.7rem] uppercase tracking-[0.3em] text-[#8a7a64]">
                  {formatOrderDate(order.paidAt || order.createdAt)}
                </p>
                <p className="mt-1 font-mono text-xs text-[#6d6357]">#{order._id.slice(-8)}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] ${
                  STATUS_STYLES[order.status] || "bg-black/10 text-black/60"
                }`}
              >
                {order.status}
              </span>
            </div>

            <ul className="mt-4 space-y-3">
              {order.items.map((item, index) => (
                <li key={`${order._id}-${index}`} className="flex items-center gap-4">
                  <div className="h-14 w-12 shrink-0 overflow-hidden rounded-lg bg-[#efe8de]">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#1f1b17]">{item.title}</p>
                    {item.label ? (
                      <p className="truncate text-xs text-[#8a7a64]">{item.label}</p>
                    ) : null}
                  </div>
                  <p className="shrink-0 text-sm text-[#6d6357]">
                    {item.quantity} × {formatMoney(item.price?.amount, item.price?.currency)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-4">
              <span className="text-xs uppercase tracking-[0.24em] text-[#8a7a64]">
                {units} {units === 1 ? "unit" : "units"} · your total
              </span>
              <span className="text-lg font-semibold text-[#1f1b17]">
                {formatMoney(sellerOrderTotal(order), currency)}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default SellerOrdersPanel;
