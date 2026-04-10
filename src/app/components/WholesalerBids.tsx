import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, Search, Clock, Package, TrendingUp, Home, User, Bell, Loader2 } from "lucide-react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase";

interface Bid {
  id: string;
  shopkeeperName: string;
  shopkeeperBusinessName?: string;
  category: string;
  items: any[];
  total: number;
  status: string;
  createdAt: string;
  deliveryDate?: string;
}

export function WholesalerBids() {
  const navigate = useNavigate();
  const [allBids, setAllBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "completed">("all");
  const [expandedBidId, setExpandedBidId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch all active bids from Firestore — wholesalers see all open bids
    const q = query(
      collection(db, "bids"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bids: Bid[] = [];
      snapshot.forEach((doc) => {
        bids.push({ id: doc.id, ...doc.data() } as Bid);
      });
      setAllBids(bids);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching bids:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredBids = allBids.filter((bid) => {
    const shopDisplay = bid.shopkeeperBusinessName || bid.shopkeeperName;
    const matchesSearch =
      shopDisplay.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bid.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || bid.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    active: allBids.filter((b) => b.status === "active").length,
    completed: allBids.filter((b) => b.status === "completed").length,
    totalValue: allBids
      .filter((b) => b.status === "active")
      .reduce((sum, b) => sum + (b.total || 0), 0),
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      const diffMs = Date.now() - d.getTime();
      const diffH = Math.floor(diffMs / 3600000);
      if (diffH < 1) return "Just now";
      if (diffH < 24) return `${diffH}h ago`;
      const diffD = Math.floor(diffH / 24);
      if (diffD === 1) return "Yesterday";
      return `${diffD} days ago`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20">
      {/* Header */}
      <div className="bg-white px-6 py-4 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => navigate("/wholesaler")}>
            <ChevronLeft className="w-6 h-6 text-[#1A1A1A]" />
          </button>
          <h1 className="text-[20px] font-bold text-[#1A1A1A]">Incoming Bids</h1>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by shop name or category..."
            className="w-full pl-12 pr-4 py-3 bg-[#F5F5F5] border border-gray-300 rounded-[12px] text-[16px] focus:outline-none focus:border-[#E8453C]"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {(
            [
              { key: "all", label: `All (${allBids.length})` },
              { key: "active", label: `Active (${stats.active})` },
              { key: "completed", label: `Completed (${stats.completed})` },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`px-4 py-2 rounded-full text-[14px] font-medium whitespace-nowrap transition-colors ${
                filterStatus === key
                  ? "bg-[#E8453C] text-white"
                  : "bg-white text-gray-700 border border-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-4 grid grid-cols-2 gap-3">
        <div className="bg-white rounded-[12px] p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-[#E8453C]" />
            <p className="text-[14px] text-gray-600">Active Bids</p>
          </div>
          <p className="font-bold text-[#1A1A1A] text-[24px]">{stats.active}</p>
        </div>
        <div className="bg-white rounded-[12px] p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-[#E8453C]" />
            <p className="text-[14px] text-gray-600">Potential Value</p>
          </div>
          <p className="font-bold text-[#1A1A1A] text-[20px]">
            ₹{(stats.totalValue / 1000).toFixed(0)}k
          </p>
        </div>
      </div>

      {/* Bids List */}
      <div className="px-6 space-y-3 pb-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#6B6B6B]">
            <Loader2 className="animate-spin mb-3" size={36} />
            <p className="font-medium">Loading bids...</p>
          </div>
        ) : filteredBids.length === 0 ? (
          <div className="bg-white rounded-[12px] p-8 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No bids found</p>
            <p className="text-sm text-gray-400 mt-1">
              New bid requests from shopkeepers will appear here
            </p>
          </div>
        ) : (
          filteredBids.map((bid) => (
            <div 
              key={bid.id} 
              onClick={() => setExpandedBidId(expandedBidId === bid.id ? null : bid.id)}
              className="bg-white rounded-[12px] p-5 shadow-sm cursor-pointer hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-[#1A1A1A] mb-1">
                    {bid.shopkeeperBusinessName || bid.shopkeeperName}
                  </h3>
                  <p className="text-[14px] text-gray-600 mb-2">
                    {formatDate(bid.createdAt)}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-[#F5F5F5] text-[#6B6B6B] px-3 py-1 rounded-full text-[12px]">
                      {bid.category}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-[12px] font-medium ${
                        bid.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {bid.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[14px] text-gray-600">Est. Value</p>
                  <p className="font-bold text-[#1A1A1A] text-[20px]">
                    ₹{(bid.total || 0).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-[12px] text-gray-600">Items</p>
                    <p className="text-[#1A1A1A] font-medium">{bid.items?.length || 0}</p>
                  </div>
                  {bid.deliveryDate && (
                    <div>
                      <p className="text-[12px] text-gray-600">Delivery By</p>
                      <p className="text-[#E8453C] font-medium">{bid.deliveryDate}</p>
                    </div>
                  )}
                </div>
                {bid.status === "active" ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/wholesaler/send-quotation/${bid.id}`);
                    }}
                    className="bg-[#E8453C] text-white px-6 py-2 rounded-[12px] font-medium hover:bg-[#d63d33] transition-colors"
                  >
                    Submit Quote
                  </button>
                ) : (
                  <button onClick={(e) => e.stopPropagation()} className="bg-gray-200 text-gray-600 px-6 py-2 rounded-[12px] font-medium cursor-not-allowed">
                    Completed
                  </button>
                )}
              </div>

              {/* Inline Items Breakdown */}
              {expandedBidId === bid.id && (
                <div className="mt-4 pt-3 border-t border-gray-100 bg-gray-50 rounded-lg p-3">
                  <h4 className="text-[11px] font-bold text-gray-500 uppercase mb-2">Requested Items</h4>
                  <div className="space-y-2">
                    {bid.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white p-2 rounded shadow-sm border border-gray-100">
                        <p className="text-sm font-medium text-[#1A1A1A]">{item.product || item.productName}</p>
                        <div className="text-right">
                          <p className="text-xs text-gray-600 font-medium">
                            {item.quantity || item.requestedQty} {item.unit}
                          </p>
                          {(item.targetPrice || item.price) && (
                            <p className="text-[11px] font-bold text-[#E8453C] mt-0.5">
                              Asking: ₹{item.targetPrice || item.price}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <button
            onClick={() => navigate("/wholesaler")}
            className="flex flex-col items-center gap-1 text-[#6B6B6B]"
          >
            <Home className="w-6 h-6" />
            <span className="text-[12px]">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-[#E8453C]">
            <Bell className="w-6 h-6" />
            <span className="text-[12px]">Bids</span>
          </button>
          <button
            onClick={() => navigate("/wholesaler/orders")}
            className="flex flex-col items-center gap-1 text-[#6B6B6B]"
          >
            <Package className="w-6 h-6" />
            <span className="text-[12px]">Orders</span>
          </button>
          <button
            onClick={() => navigate("/profile/wholesaler")}
            className="flex flex-col items-center gap-1 text-[#6B6B6B]"
          >
            <User className="w-6 h-6" />
            <span className="text-[12px]">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
