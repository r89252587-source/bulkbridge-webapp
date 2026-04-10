import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Bell, TrendingUp, Package, CheckCircle, Clock, Truck, User, Home, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { db } from "../../lib/firebase";

interface Bid {
  id: string;
  shopkeeperName: string;
  shopkeeperBusinessName: string;
  category: string;
  items: any[];
  total: number;
  status: string;
  createdAt: string;
  deliveryDate: string;
}

interface Order {
  id: string;
  orderNumber?: string;
  shopkeeperId: string;
  totalAmount: number;
  status: "Pending" | "Confirmed" | "Delivered";
  createdAt: string;
  items: any[];
}

export function WholesalerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bids, setBids] = useState<Bid[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loadingBids, setLoadingBids] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [completedOrdersCount, setCompletedOrdersCount] = useState(0);
  const [expandedBidId, setExpandedBidId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch active bids from Firestore
    const bidsQ = query(
      collection(db, "bids"),
      where("status", "==", "active")
    );

    const unsubBids = onSnapshot(bidsQ, (snapshot) => {
      const b: Bid[] = [];
      snapshot.forEach((doc) => {
        b.push({ id: doc.id, ...doc.data() } as Bid);
      });
      // Sort in-memory to avoid composite index requirement
      b.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setBids(b);
      setLoadingBids(false);
    }, (error) => {
      console.error("Error fetching bids:", error);
      setLoadingBids(false);
    });

    return () => {
      unsubBids();
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    // Fetch recent orders for this wholesaler
    const ordersQ = query(
      collection(db, "orders"),
      where("wholesalerId", "==", user.id)
    );

    const unsubOrders = onSnapshot(ordersQ, (snapshot) => {
      const orders: Order[] = [];
      let earnings = 0;
      let completed = 0;
      snapshot.forEach((doc) => {
        const data = doc.data() as Order;
        orders.push({ id: doc.id, ...data });
      });
      
      // Sort in-memory and update states
      orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      orders.forEach(order => {
        if (order.status === "Delivered") {
          earnings += order.totalAmount || 0;
          completed++;
        }
      });

      setRecentOrders(orders.slice(0, 5));
      setMonthlyEarnings(earnings);
      setCompletedOrdersCount(completed);
      setLoadingOrders(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setLoadingOrders(false);
    });

    return () => {
      unsubOrders();
    };
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-blue-100 text-blue-700";
      case "Delivered":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Confirmed":
        return <CheckCircle size={16} />;
      case "Delivered":
        return <Truck size={16} />;
      case "Pending":
        return <Clock size={16} />;
      default:
        return null;
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      const diffMs = Date.now() - d.getTime();
      const diffH = Math.floor(diffMs / 3600000);
      if (diffH < 24) return "Today";
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
      <div className="bg-white px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[#1A1A1A]">{user?.name || "Wholesaler"}</h1>
          <button className="relative text-[#1A1A1A]" onClick={() => navigate("/notifications")}>
            <Bell size={24} />
            {bids.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#E8453C] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {bids.length > 9 ? "9+" : bids.length}
              </span>
            )}
          </button>
        </div>
        <h2 className="text-[#1A1A1A] text-[18px]">Wholesaler Dashboard</h2>
        <p className="text-[#6B6B6B] mt-1">{user?.businessName || "Your Business"}</p>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Earnings Summary Card */}
        <div className="bg-gradient-to-br from-[#E8453C] to-[#d43d35] rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={20} />
            <p className="text-white/90 text-sm">Total Earnings (Delivered)</p>
          </div>
          <p className="text-4xl mb-4">
            {loadingOrders ? (
              <Loader2 className="animate-spin inline" size={32} />
            ) : (
              `₹${monthlyEarnings.toLocaleString("en-IN")}`
            )}
          </p>
          <div className="flex items-center justify-between pt-3 border-t border-white/20">
            <div>
              <p className="text-white/80 text-sm">Orders Completed</p>
              <p className="text-xl mt-1">{completedOrdersCount}</p>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm">Active Bids Available</p>
              <p className="text-xl mt-1">{bids.length}</p>
            </div>
          </div>
        </div>

        {/* Incoming Bids Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[#1A1A1A]">Incoming Bid Requests</h2>
            <button
              onClick={() => navigate("/wholesaler/bids")}
              className="text-[#E8453C] text-sm font-medium"
            >
              View All →
            </button>
          </div>

          <div className="space-y-3">
            {loadingBids ? (
              <div className="flex flex-col items-center justify-center py-10 text-[#6B6B6B]">
                <Loader2 className="animate-spin mb-2" size={32} />
                <p>Loading bids...</p>
              </div>
            ) : bids.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center shadow-sm">
                <p className="text-[#6B6B6B]">No active bids at the moment</p>
              </div>
            ) : (
              bids.slice(0, 3).map((bid) => (
                <div
                  key={bid.id}
                  className="bg-white rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setExpandedBidId(expandedBidId === bid.id ? null : bid.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-[#1A1A1A] mb-1">
                        {bid.shopkeeperBusinessName || bid.shopkeeperName}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="bg-[#F5F5F5] text-[#6B6B6B] px-3 py-1 rounded-full text-sm">
                          {bid.category}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs bg-orange-100 text-orange-700`}>
                          NEW
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[#6B6B6B]">Est. Value</p>
                      <p className="text-xl text-[#1A1A1A]">
                        ₹{(bid.total || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-xs text-[#6B6B6B]">Items</p>
                        <p className="text-[#1A1A1A]">{bid.items?.length || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#6B6B6B]">Delivery</p>
                        <p className="text-[#E8453C]">{bid.deliveryDate || "Asap"}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/wholesaler/send-quotation/${bid.id}`);
                      }}
                      className="bg-[#E8453C] text-white px-6 py-2 rounded-lg hover:bg-[#d43d35] transition-colors"
                    >
                      Submit Quote
                    </button>
                  </div>

                  {/* Inline Items Breakdown */}
                  {expandedBidId === bid.id && (
                    <div className="mt-4 pt-3 border-t border-gray-100 bg-gray-50 rounded-lg p-3">
                      <h4 className="text-[11px] font-bold text-gray-500 uppercase mb-2">Requested Items</h4>
                      <div className="space-y-2">
                        {bid.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border border-gray-100">
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
        </div>

        {/* Active Orders Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[#1A1A1A]">My Recent Orders</h2>
            <button
              onClick={() => navigate("/wholesaler/orders")}
              className="text-[#E8453C] text-sm font-medium"
            >
              View All →
            </button>
          </div>

          <div className="space-y-3">
            {loadingOrders ? (
              <div className="flex flex-col items-center justify-center py-10 text-[#6B6B6B]">
                <Loader2 className="animate-spin mb-2" size={32} />
                <p>Loading orders...</p>
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center shadow-sm">
                <Package className="mx-auto mb-3 text-gray-300" size={40} />
                <p className="text-[#6B6B6B]">No orders yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Orders appear here when shopkeepers confirm your quotations
                </p>
              </div>
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/order/${order.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="text-[#6B6B6B]" size={18} />
                        <h3 className="text-[#1A1A1A]">
                          #{order.orderNumber || order.id.slice(-6).toUpperCase()}
                        </h3>
                      </div>
                      <p className="text-[#6B6B6B] text-sm">{order.items?.length || 0} items</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl text-[#1A1A1A]">
                        ₹{(order.totalAmount || 0).toLocaleString("en-IN")}
                      </p>
                      <p className="text-xs text-[#6B6B6B] mt-1">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status === "Shipped" ? "Out for Delivery" : order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <button className="flex flex-col items-center gap-1 text-[#E8453C]">
            <Home size={24} />
            <span className="text-xs">Home</span>
          </button>
          <button
            className="flex flex-col items-center gap-1 text-[#6B6B6B]"
            onClick={() => navigate("/wholesaler/bids")}
          >
            <Bell size={24} />
            <span className="text-xs">Bids</span>
          </button>
          <button
            className="flex flex-col items-center gap-1 text-[#6B6B6B]"
            onClick={() => navigate("/wholesaler/orders")}
          >
            <Package size={24} />
            <span className="text-xs">Orders</span>
          </button>
          <button
            className="flex flex-col items-center gap-1 text-[#6B6B6B]"
            onClick={() => navigate("/profile/wholesaler")}
          >
            <User size={24} />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
