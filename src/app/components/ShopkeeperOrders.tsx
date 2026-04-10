import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Package,
  CheckCircle,
  Clock,
  Truck,
  Search,
  Plus,
  Home,
  FileText,
  ShoppingCart,
  User,
  Loader2,
} from "lucide-react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../context/AuthContext";

interface Order {
  id: string;
  orderNumber?: string;
  wholesalerName: string;
  wholesalerBusinessName?: string;
  totalAmount: number;
  status: "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";
  createdAt: string;
  items: any[];
  bidId?: string;
}

export function ShopkeeperOrders() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "confirmed" | "shipped" | "delivered"
  >("all");

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "orders"),
      where("shopkeeperId", "==", user.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders: Order[] = [];
      snapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() } as Order);
      });
      // Sort in-memory
      orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAllOrders(orders);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredOrders = allOrders.filter((order) => {
    const wholesalerDisplay = order.wholesalerBusinessName || order.wholesalerName;
    const matchesSearch =
      (order.orderNumber || order.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
      wholesalerDisplay.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || order.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: allOrders.length,
    active: allOrders.filter((o) =>
      ["Confirmed", "Shipped"].includes(o.status)
    ).length,
    delivered: allOrders.filter((o) => o.status === "Delivered").length,
    totalSpent: allOrders
      .filter((o) => o.status === "Delivered")
      .reduce((s, o) => s + (o.totalAmount || 0), 0),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-700";
      case "Shipped":
        return "bg-blue-100 text-blue-700";
      case "Confirmed":
        return "bg-purple-100 text-purple-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Cancelled":
        return "bg-red-100 text-red-700";
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
      case "Confirmed":
        return <Package className="w-4 h-4" />;
      case "Pending":
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => navigate("/dashboard/shopkeeper")}>
            <ArrowLeft className="w-6 h-6 text-[#1A1A1A]" />
          </button>
          <h1 className="text-[20px] font-bold text-[#1A1A1A]">My Orders</h1>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order ID, wholesaler..."
            className="w-full pl-12 pr-4 py-3 bg-[#F5F5F5] border border-gray-300 rounded-[12px] text-[14px] focus:outline-none focus:border-[#E8453C] transition-colors"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {(
            [
              { key: "all", label: `All (${stats.total})` },
              { key: "pending", label: "Pending" },
              { key: "confirmed", label: "Confirmed" },
              { key: "shipped", label: "Out for Delivery" },
              { key: "delivered", label: `Delivered (${stats.delivered})` },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors ${
                filterStatus === key
                  ? "bg-[#E8453C] text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:border-[#E8453C]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 py-4 grid grid-cols-3 gap-3">
        <div className="bg-white rounded-[12px] p-4 shadow-sm text-center">
          <p className="text-[11px] text-gray-500 mb-1">Active</p>
          <p className="font-bold text-[#1A1A1A] text-[20px]">{stats.active}</p>
        </div>
        <div className="bg-white rounded-[12px] p-4 shadow-sm text-center">
          <p className="text-[11px] text-gray-500 mb-1">Delivered</p>
          <p className="font-bold text-[#1A1A1A] text-[20px]">{stats.delivered}</p>
        </div>
        <div className="bg-white rounded-[12px] p-4 shadow-sm text-center">
          <p className="text-[11px] text-gray-500 mb-1">Total Spent</p>
          <p className="font-bold text-[#1A1A1A] text-[15px]">
            ₹{(stats.totalSpent / 1000).toFixed(0)}k
          </p>
        </div>
      </div>

      {/* Orders List */}
      <div className="px-4 space-y-3 pb-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#6B6B6B]">
            <Loader2 className="animate-spin mb-3" size={36} />
            <p className="font-medium">Loading your orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-[12px] p-10 text-center shadow-sm">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No orders found</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchQuery ? "Try a different search term" : "Create your first order list"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => navigate("/create-order")}
                className="mt-4 bg-[#E8453C] text-white px-6 py-2.5 rounded-[10px] text-sm font-medium hover:bg-[#d43d35] transition-colors"
              >
                Create Order
              </button>
            )}
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-[12px] p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]"
              onClick={() => navigate(`/order/${order.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-[#1A1A1A]">
                      {order.orderNumber || `#${order.id.slice(-6).toUpperCase()}`}
                    </h3>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1 ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      {order.status === "Shipped" ? "Out for Delivery" : order.status}
                    </span>
                  </div>
                  <p className="text-[13px] text-gray-600">
                    {order.wholesalerBusinessName || order.wholesalerName}
                  </p>
                  <p className="text-[12px] text-gray-400 mt-0.5">
                    {order.items?.length || 0} items
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#1A1A1A] text-[18px]">
                    ₹{(order.totalAmount || 0).toLocaleString("en-IN")}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-[12px] text-gray-500">
                  {order.items?.length || 0} items
                </span>
                <span className="text-[#E8453C] text-[13px] font-medium">
                  View Details →
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate("/create-order")}
        className="fixed bottom-24 right-5 w-14 h-14 bg-[#E8453C] text-white rounded-full shadow-xl flex items-center justify-center hover:bg-[#d43d35] transition-colors active:scale-95"
      >
        <Plus size={26} />
      </button>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <button
            onClick={() => navigate("/dashboard/shopkeeper")}
            className="flex flex-col items-center gap-1 text-[#6B6B6B]"
          >
            <Home className="w-6 h-6" />
            <span className="text-[11px]">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-[#E8453C]">
            <FileText className="w-6 h-6" />
            <span className="text-[11px]">Orders</span>
          </button>
          <button
            onClick={() => navigate("/quotations")}
            className="flex flex-col items-center gap-1 text-[#6B6B6B]"
          >
            <ShoppingCart className="w-6 h-6" />
            <span className="text-[11px]">Quotes</span>
          </button>
          <button
            onClick={() => navigate("/profile/shopkeeper")}
            className="flex flex-col items-center gap-1 text-[#6B6B6B]"
          >
            <User className="w-6 h-6" />
            <span className="text-[11px]">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
