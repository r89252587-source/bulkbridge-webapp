import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Bell, TrendingUp, Package, CheckCircle, Clock, Truck, User, Home, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
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
  orderNumber: string;
  shopName: string;
  amount: number;
  status: "Pending" | "Confirmed" | "Delivered";
  date: string;
}

export function WholesalerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch active bids from Firestore
    const q = query(
      collection(db, "bids"),
      where("status", "==", "active"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const b: Bid[] = [];
      snapshot.forEach((doc) => {
        b.push({ id: doc.id, ...doc.data() } as Bid);
      });
      setBids(b);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const orders: Order[] = [
    {
      id: "1",
      orderNumber: "ORD-2024-045",
      shopName: "Raj General Store",
      amount: 23450,
      status: "Confirmed",
      date: "Today",
    },
    {
      id: "2",
      orderNumber: "ORD-2024-044",
      shopName: "City Supermarket",
      amount: 18900,
      status: "Delivered",
      date: "Yesterday",
    },
    {
      id: "3",
      orderNumber: "ORD-2024-043",
      shopName: "Quick Shop",
      amount: 31200,
      status: "Pending",
      date: "2 days ago",
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-[#E8453C] text-white";
      case "medium":
        return "bg-orange-100 text-orange-700";
      case "low":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

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

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[#1A1A1A]">{user?.name || "Wholesaler"}</h1>
          <button className="relative text-[#1A1A1A]" onClick={() => navigate("/notifications")}>
            <Bell size={24} />
            <span className="absolute -top-1 -right-1 bg-[#E8453C] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              7
            </span>
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
            <p className="text-white/90 text-sm">This Month's Earnings</p>
          </div>
          <p className="text-4xl mb-4">₹2,45,800</p>
          <div className="flex items-center justify-between pt-3 border-t border-white/20">
            <div>
              <p className="text-white/80 text-sm">Orders Completed</p>
              <p className="text-xl mt-1">38</p>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm">Avg. Order Value</p>
              <p className="text-xl mt-1">₹6,468</p>
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
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 text-[#6B6B6B]">
                <Loader2 className="animate-spin mb-2" size={32} />
                <p>Loading bids...</p>
              </div>
            ) : bids.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center shadow-sm">
                <p className="text-[#6B6B6B]">No active bids at the moment</p>
              </div>
            ) : (
              bids.map((bid) => (
                <div
                  key={bid.id}
                  className="bg-white rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
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
                          MEDIUM
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[#6B6B6B]">Est. Value</p>
                      <p className="text-xl text-[#1A1A1A]">
                        ₹{bid.total.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-xs text-[#6B6B6B]">Items</p>
                        <p className="text-[#1A1A1A]">{bid.items.length}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#6B6B6B]">Delivery</p>
                        <p className="text-[#E8453C]">{bid.deliveryDate || "Asap"}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/wholesaler/send-quotation/${bid.id}`)}
                      className="bg-[#E8453C] text-white px-6 py-2 rounded-lg hover:bg-[#d43d35] transition-colors"
                    >
                      Submit Quote
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Orders Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[#1A1A1A]">Active Orders</h2>
            <button
              onClick={() => navigate("/wholesaler/orders")}
              className="text-[#E8453C] text-sm font-medium"
            >
              View All →
            </button>
          </div>

          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/order/${order.orderNumber}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="text-[#6B6B6B]" size={18} />
                      <h3 className="text-[#1A1A1A]">{order.orderNumber}</h3>
                    </div>
                    <p className="text-[#6B6B6B] text-sm">{order.shopName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl text-[#1A1A1A]">
                      ₹{order.amount.toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-[#6B6B6B] mt-1">{order.date}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
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
