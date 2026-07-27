import { useNavigate } from "react-router";

const NAV = ["Overview", "Products", "Orders", "Analytics", "Settings"];

function SellerSidebar() {
  const navigate = useNavigate();
  return (
    <aside className="fixed left-0 top-0 z-10 hidden h-full w-72 border-r border-black/5 bg-[#f7f3ec]/90 backdrop-blur-xl md:block">
      <div className="flex h-full flex-col justify-between p-8">
        <div>
          <div className="mb-14">
            <p className="text-[0.7rem] uppercase tracking-[0.35em] text-[#8a7a64]">Aveniq</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">Seller Studio</h2>
          </div>
          <nav className="space-y-1" aria-label="Seller sections">
            {NAV.map((item) => (
              <button
                key={item}
                onClick={() => navigate(`/seller/dashboard?tab=${item}`)}
                className={`flex w-full items-center justify-between rounded-full px-4 py-3 text-left text-sm transition-colors ${
                  item === "Products"
                    ? "bg-[#1f1b17] text-[#f7f3ec]"
                    : "text-[#6d6357] hover:bg-black/5 hover:text-[#1f1b17]"
                }`}
              >
                <span>{item}</span>
                {item === "Products" && <span className="h-2 w-2 rounded-full bg-[#d8c39a]" />}
              </button>
            ))}
          </nav>
        </div>

        <div>
          <button
            onClick={() => navigate("/seller/dashboard")}
            className="group mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#8a7a64] transition-colors hover:text-[#1f1b17]"
          >
            <span className="block h-px w-4 bg-current transition-all duration-300 group-hover:w-7" />
            All Products
          </button>
          <div className="rounded-3xl border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(31,27,23,0.06)]">
            <p className="text-xs uppercase tracking-[0.25em] text-[#8a7a64]">Workspace</p>
            <p className="mt-3 text-sm leading-6 text-[#5d5448]">
              Manage variants, control stock, and keep listings sharp.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default SellerSidebar;
