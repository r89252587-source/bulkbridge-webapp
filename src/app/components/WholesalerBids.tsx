import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, Search, Clock, Package, TrendingUp, Home, User } from "lucide-react";

interface Bid {
  id: string;
  shopName: string;
  category: string;
  itemCount: number;
  estimatedValue: number;
  timeLeft: string;
  priority: "high" | "medium" | "low";
  status: "new" | "quoted" | "expired";
  postedDate: string;
}

export function WholesalerBids() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "new" | "quoted" | "expired">("all");

  const allBids: Bid[] = [
    {
      id: "1",
      shopName: "Raj General Store",
      category: "Groceries & Staples",
      itemCount: 12,
      estimatedValue: 24500,
      timeLeft: "2h left",
      priority: "high",
      status: "new",
      postedDate: "Today, 10:30 AM",
    },
    {
      id: "2",
      shopName: "Modern Mart",
      category: "Beverages",
      itemCount: 8,
      estimatedValue: 15800,
      timeLeft: "5h left",
      priority: "medium",
      status: "new",
      postedDate: "Today, 9:15 AM",
    },
    {
      id: "3",
      shopName: "Quick Shop",
      category: "Personal Care",
      itemCount: 15,
      estimatedValue: 32000,
      timeLeft: "1h left",
      priority: "high",
      status: "new",
      postedDate: "Today, 11:45 AM",
    },
    {
      id: "4",
      shopName: "City Grocers",
      category: "Groceries & Staples",
      itemCount: 20,
      estimatedValue: 45000,
      timeLeft: "8h left",
      priority: "low",
      status: "new",
      postedDate: "Today, 8:00 AM",
    },
    {
      id: "5",
      shopName: "Super Mart",
      category: "Household Items",
      itemCount: 10,
      estimatedValue: 18500,
      timeLeft: "Quoted",
      priority: "medium",
      status: "quoted",
      postedDate: "Yesterday, 4:30 PM",
    },
    {
      id: "6",
      shopName: "Fresh Store",
      category: "Groceries & Staples",
      itemCount: 25,
      estimatedValue: 52000,
      timeLeft: "Expired",
      priority: "high",
      status: "expired",
      postedDate: "2 days ago",
    },
  ];

  const filteredBids = allBids.filter((bid) => {
    const matchesSearch = bid.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bid.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || bid.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-700";
      case "quoted":
        return "bg-green-100 text-green-700";
      case "expired":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const stats = {
    new: allBids.filter(b => b.status === "new").length,
    quoted: allBids.filter(b => b.status === "quoted").length,
    totalValue: allBids.filter(b => b.status === "new").reduce((sum, b) => sum + b.estimatedValue, 0),
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
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-full text-[14px] font-medium whitespace-nowrap transition-colors ${
              filterStatus === "all"
                ? "bg-[#E8453C] text-white"
                : "bg-white text-gray-700 border border-gray-300"
            }`}
          >
            All ({allBids.length})
          </button>
          <button
            onClick={() => setFilterStatus("new")}
            className={`px-4 py-2 rounded-full text-[14px] font-medium whitespace-nowrap transition-colors ${
              filterStatus === "new"
                ? "bg-[#E8453C] text-white"
                : "bg-white text-gray-700 border border-gray-300"
            }`}
          >
            New ({stats.new})
          </button>
          <button
            onClick={() => setFilterStatus("quoted")}
            className={`px-4 py-2 rounded-full text-[14px] font-medium whitespace-nowrap transition-colors ${
              filterStatus === "quoted"
                ? "bg-[#E8453C] text-white"
                : "bg-white text-gray-700 border border-gray-300"
            }`}
          >
            Quoted ({stats.quoted})
          </button>
          <button
            onClick={() => setFilterStatus("expired")}
            className={`px-4 py-2 rounded-full text-[14px] font-medium whitespace-nowrap transition-colors ${
              filterStatus === "expired"
                ? "bg-[#E8453C] text-white"
                : "bg-white text-gray-700 border border-gray-300"
            }`}
          >
            Expired
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-4 grid grid-cols-2 gap-3">
        <div className="bg-white rounded-[12px] p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-[#E8453C]" />
            <p className="text-[14px] text-gray-600">Active Bids</p>
          </div>
          <p className="font-bold text-[#1A1A1A] text-[24px]">{stats.new}</p>
        </div>
        <div className="bg-white rounded-[12px] p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-[#E8453C]" />
            <p className="text-[14px] text-gray-600">Potential Value</p>
          </div>
          <p className="font-bold text-[#1A1A1A] text-[20px]">₹{(stats.totalValue / 1000).toFixed(0)}k</p>
        </div>
      </div>

      {/* Bids List */}
      <div className="px-6 space-y-3 pb-6">
        {filteredBids.length === 0 ? (
          <div className="bg-white rounded-[12px] p-8 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No bids found</p>
          </div>
        ) : (
          filteredBids.map((bid) => (
            <div
              key={bid.id}
              className="bg-white rounded-[12px] p-5 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-[#1A1A1A] mb-1">{bid.shopName}</h3>
                  <p className="text-[14px] text-gray-600 mb-2">{bid.postedDate}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-[#F5F5F5] text-[#6B6B6B] px-3 py-1 rounded-full text-[12px]">
                      {bid.category}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-[12px] font-medium ${getPriorityColor(bid.priority)}`}>
                      {bid.priority.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-[12px] font-medium ${getStatusColor(bid.status)}`}>
                      {bid.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[14px] text-gray-600">Est. Value</p>
                  <p className="font-bold text-[#1A1A1A] text-[20px]">
                    ₹{bid.estimatedValue.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-[12px] text-gray-600">Items</p>
                    <p className="text-[#1A1A1A] font-medium">{bid.itemCount}</p>
                  </div>
                  <div>
                    <p className="text-[12px] text-gray-600">Time Left</p>
                    <p className={`font-medium ${bid.status === "new" ? "text-[#E8453C]" : "text-gray-600"}`}>
                      {bid.timeLeft}
                    </p>
                  </div>
                </div>
                {bid.status === "new" ? (
                  <button
                    onClick={() => navigate(`/wholesaler/send-quotation/${bid.id}`)}
                    className="bg-[#E8453C] text-white px-6 py-2 rounded-[12px] font-medium hover:bg-[#d63d33] transition-colors"
                  >
                    Submit Quote
                  </button>
                ) : bid.status === "quoted" ? (
                  <button className="bg-gray-200 text-gray-600 px-6 py-2 rounded-[12px] font-medium cursor-not-allowed">
                    Quoted
                  </button>
                ) : (
                  <button className="bg-gray-200 text-gray-600 px-6 py-2 rounded-[12px] font-medium cursor-not-allowed">
                    Expired
                  </button>
                )}
              </div>
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
            <Clock className="w-6 h-6" />
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
