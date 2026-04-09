import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, Search, Package, CheckCircle, Clock, Truck, Eye, Home, User, Bell } from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  shopName: string;
  shopAddress: string;
  amount: number;
  status: "Pending" | "Confirmed" | "Packed" | "Shipped" | "Delivered";
  date: string;
  itemCount: number;
  paymentStatus: "Advance Paid" | "Fully Paid" | "Pending";
}

export function WholesalerOrders() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "confirmed" | "shipped" | "delivered">("all");

  const allOrders: Order[] = [
    {
      id: "1",
      orderNumber: "ORD-2024-1234",
      shopName: "Raj General Store",
      shopAddress: "MG Road, Bangalore",
      amount: 24850,
      status: "Confirmed",
      date: "Apr 5, 2026",
      itemCount: 12,
      paymentStatus: "Advance Paid",
    },
    {
      id: "2",
      orderNumber: "ORD-2024-1235",
      shopName: "Modern Mart",
      shopAddress: "HSR Layout, Bangalore",
      amount: 15600,
      status: "Shipped",
      date: "Apr 4, 2026",
      itemCount: 8,
      paymentStatus: "Advance Paid",
    },
    {
      id: "3",
      orderNumber: "ORD-2024-1236",
      shopName: "Quick Shop",
      shopAddress: "Indiranagar, Bangalore",
      amount: 31200,
      status: "Pending",
      date: "Apr 5, 2026",
      itemCount: 15,
      paymentStatus: "Pending",
    },
    {
      id: "4",
      orderNumber: "ORD-2024-1237",
      shopName: "City Grocers",
      shopAddress: "Koramangala, Bangalore",
      amount: 42800,
      status: "Delivered",
      date: "Apr 3, 2026",
      itemCount: 20,
      paymentStatus: "Fully Paid",
    },
    {
      id: "5",
      orderNumber: "ORD-2024-1238",
      shopName: "Super Mart",
      shopAddress: "Whitefield, Bangalore",
      amount: 18900,
      status: "Packed",
      date: "Apr 5, 2026",
      itemCount: 10,
      paymentStatus: "Advance Paid",
    },
    {
      id: "6",
      orderNumber: "ORD-2024-1239",
      shopName: "Fresh Store",
      shopAddress: "JP Nagar, Bangalore",
      amount: 52400,
      status: "Confirmed",
      date: "Apr 4, 2026",
      itemCount: 25,
      paymentStatus: "Advance Paid",
    },
  ];

  const filteredOrders = allOrders.filter((order) => {
    const matchesSearch = order.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || order.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-700";
      case "Shipped":
        return "bg-blue-100 text-blue-700";
      case "Packed":
        return "bg-purple-100 text-purple-700";
      case "Confirmed":
        return "bg-blue-100 text-blue-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "Shipped":
        return <Truck className="w-4 h-4" />;
      case "Packed":
        return <Package className="w-4 h-4" />;
      case "Confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "Pending":
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getPaymentColor = (status: string) => {
    switch (status) {
      case "Fully Paid":
        return "text-green-600";
      case "Advance Paid":
        return "text-blue-600";
      case "Pending":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  const stats = {
    total: allOrders.length,
    pending: allOrders.filter(o => o.status === "Pending").length,
    active: allOrders.filter(o => ["Confirmed", "Packed", "Shipped"].includes(o.status)).length,
    delivered: allOrders.filter(o => o.status === "Delivered").length,
    totalRevenue: allOrders.filter(o => o.status === "Delivered").reduce((sum, o) => sum + o.amount, 0),
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20">
      {/* Header */}
      <div className="bg-white px-6 py-4 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => navigate("/wholesaler")}>
            <ChevronLeft className="w-6 h-6 text-[#1A1A1A]" />
          </button>
          <h1 className="text-[20px] font-bold text-[#1A1A1A]">My Orders</h1>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by shop name or order ID..."
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
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilterStatus("pending")}
            className={`px-4 py-2 rounded-full text-[14px] font-medium whitespace-nowrap transition-colors ${
              filterStatus === "pending"
                ? "bg-[#E8453C] text-white"
                : "bg-white text-gray-700 border border-gray-300"
            }`}
          >
            Pending ({stats.pending})
          </button>
          <button
            onClick={() => setFilterStatus("confirmed")}
            className={`px-4 py-2 rounded-full text-[14px] font-medium whitespace-nowrap transition-colors ${
              filterStatus === "confirmed"
                ? "bg-[#E8453C] text-white"
                : "bg-white text-gray-700 border border-gray-300"
            }`}
          >
            Confirmed
          </button>
          <button
            onClick={() => setFilterStatus("shipped")}
            className={`px-4 py-2 rounded-full text-[14px] font-medium whitespace-nowrap transition-colors ${
              filterStatus === "shipped"
                ? "bg-[#E8453C] text-white"
                : "bg-white text-gray-700 border border-gray-300"
            }`}
          >
            Shipped
          </button>
          <button
            onClick={() => setFilterStatus("delivered")}
            className={`px-4 py-2 rounded-full text-[14px] font-medium whitespace-nowrap transition-colors ${
              filterStatus === "delivered"
                ? "bg-[#E8453C] text-white"
                : "bg-white text-gray-700 border border-gray-300"
            }`}
          >
            Delivered ({stats.delivered})
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-4 grid grid-cols-3 gap-3">
        <div className="bg-white rounded-[12px] p-4 shadow-sm">
          <p className="text-[12px] text-gray-600 mb-1">Active</p>
          <p className="font-bold text-[#1A1A1A] text-[20px]">{stats.active}</p>
        </div>
        <div className="bg-white rounded-[12px] p-4 shadow-sm">
          <p className="text-[12px] text-gray-600 mb-1">Delivered</p>
          <p className="font-bold text-[#1A1A1A] text-[20px]">{stats.delivered}</p>
        </div>
        <div className="bg-white rounded-[12px] p-4 shadow-sm">
          <p className="text-[12px] text-gray-600 mb-1">Revenue</p>
          <p className="font-bold text-[#1A1A1A] text-[16px]">₹{(stats.totalRevenue / 1000).toFixed(0)}k</p>
        </div>
      </div>

      {/* Orders List */}
      <div className="px-6 space-y-3 pb-6">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-[12px] p-8 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No orders found</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-[12px] p-5 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-[#1A1A1A]">{order.shopName}</h3>
                    <span className={`px-2.5 py-1 rounded-full text-[12px] font-medium flex items-center gap-1 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </div>
                  <p className="text-[14px] text-gray-600 mb-1">{order.orderNumber}</p>
                  <p className="text-[12px] text-gray-500">{order.shopAddress}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#1A1A1A] text-[20px]">
                    ₹{order.amount.toLocaleString("en-IN")}
                  </p>
                  <p className={`text-[12px] font-medium ${getPaymentColor(order.paymentStatus)}`}>
                    {order.paymentStatus}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-[12px] text-gray-600">Items</p>
                    <p className="text-[#1A1A1A] font-medium">{order.itemCount}</p>
                  </div>
                  <div>
                    <p className="text-[12px] text-gray-600">Date</p>
                    <p className="text-[#1A1A1A] font-medium">{order.date}</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/order/${order.id}`)}
                  className="flex items-center gap-2 text-[#E8453C] font-medium text-[14px]"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
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
          <button
            onClick={() => navigate("/wholesaler/bids")}
            className="flex flex-col items-center gap-1 text-[#6B6B6B]"
          >
            <Bell className="w-6 h-6" />
            <span className="text-[12px]">Bids</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-[#E8453C]">
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
