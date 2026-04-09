import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Home,
  FileText,
  ShoppingCart,
  User,
  AlertCircle,
  TrendingUp,
  Clock,
  Package,
  Bell,
  Plus,
  Loader2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";

export function ShopkeeperDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeBidsCount, setActiveBidsCount] = useState(0);
  const [pendingQuotesCount, setPendingQuotesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Fetch active bids count for this shopkeeper
    const q = query(
      collection(db, "bids"),
      where("shopkeeperId", "==", user.id),
      where("status", "==", "active")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setActiveBidsCount(snapshot.size);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning,";
    if (hour < 17) return "Good Afternoon,";
    return "Good Evening,";
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      {/* Header */}
      <div className="bg-white px-6 py-5 shadow-sm flex items-start justify-between">
        <div>
          <p className="text-[14px] text-[#6B6B6B]">{getGreeting()}</p>
          <h1 className="text-[22px] font-bold text-[#1A1A1A] mt-0.5">
            {user?.name || "Shopkeeper"}
          </h1>
          {user?.businessName && (
            <p className="text-[13px] text-[#6B6B6B] mt-0.5">{user.businessName}</p>
          )}
        </div>
        <button
          onClick={() => navigate("/notifications")}
          className="relative p-2 mt-1"
        >
          <Bell className="w-6 h-6 text-[#1A1A1A]" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#E8453C] rounded-full border-2 border-white" />
        </button>
      </div>

      {/* Alert Banner */}
      <div
        className="bg-[#E8453C] px-6 py-3.5 flex items-center gap-3 cursor-pointer"
        onClick={() => navigate("/orders/shopkeeper")}
      >
        <AlertCircle className="text-white flex-shrink-0" size={18} />
        <div className="flex-1">
          <p className="text-white text-[14px]">3 items are running low on stock</p>
        </div>
        <span className="text-white/80 text-[13px]">View →</span>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 py-5 space-y-4 pb-28">
        {/* Active Bids Card */}
        <div
          className="bg-white rounded-xl p-5 shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
          onClick={() => navigate("/quotations")}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#E8453C]/10 p-3 rounded-xl">
                <TrendingUp className="text-[#E8453C]" size={22} />
              </div>
              <div>
                <h3 className="text-[#1A1A1A] font-semibold">Active Bids</h3>
                <p className="text-[#6B6B6B] text-[13px] mt-0.5">Running quotations</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[#E8453C] text-[32px] font-bold">
                {loading ? <Loader2 className="animate-spin inline" size={24} /> : activeBidsCount}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <span className="text-[13px] text-[#6B6B6B]">
              {activeBidsCount === 0 ? "No active bids" : `${activeBidsCount} active requests`}
            </span>
            <span className="text-[#E8453C] text-[13px] font-medium">View All →</span>
          </div>
        </div>

        {/* Pending Quotations Card */}
        <div
          className="bg-white rounded-xl p-5 shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
          onClick={() => navigate("/quotations")}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 p-3 rounded-xl">
                <Clock className="text-[#1A1A1A]" size={22} />
              </div>
              <div>
                <h3 className="text-[#1A1A1A] font-semibold">Pending Quotes</h3>
                <p className="text-[#6B6B6B] text-[13px] mt-0.5">Awaiting your review</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[#1A1A1A] text-[32px] font-bold">0</div>
            </div>
          </div>
          <div className="pt-3 border-t border-gray-100">
            <span className="text-[13px] text-[#6B6B6B]">Compare quotes to finalize order</span>
          </div>
        </div>

        {/* Last Order Card */}
        <div
          className="bg-white rounded-xl p-5 shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
          onClick={() => navigate("/order/ORD-2024-001")}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-3 rounded-xl">
              <Package className="text-green-600" size={22} />
            </div>
            <div>
              <h3 className="text-[#1A1A1A] font-semibold">Last Order Status</h3>
              <p className="text-[#6B6B6B] text-[13px] mt-0.5">Order #ORD-2024-001</p>
            </div>
          </div>
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-[13px] text-[#6B6B6B]">Status</span>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[13px] font-medium">
                Out for Delivery
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[13px] text-[#6B6B6B]">Amount</span>
              <span className="text-[#1A1A1A] font-semibold">₹24,850</span>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <span className="text-[#E8453C] text-[13px] font-medium">Track Order →</span>
            </div>
          </div>
        </div>

        {/* My Orders Quick Access */}
        <div
          className="bg-white rounded-xl p-5 shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
          onClick={() => navigate("/orders/shopkeeper")}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-xl">
                <FileText className="text-blue-600" size={22} />
              </div>
              <div>
                <h3 className="text-[#1A1A1A] font-semibold">My Orders</h3>
                <p className="text-[#6B6B6B] text-[13px] mt-0.5">View all order history</p>
              </div>
            </div>
            <span className="text-[#E8453C] text-[13px] font-medium">View →</span>
          </div>
        </div>

        {/* Create New Order Button */}
        <button
          onClick={() => navigate("/create-order")}
          className="w-full bg-[#E8453C] text-white py-4 rounded-xl shadow-lg hover:bg-[#d43d35] active:scale-[0.98] transition-all font-medium text-[16px] flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Create New Order List
        </button>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <button className="flex flex-col items-center gap-1 text-[#E8453C]">
            <Home size={24} />
            <span className="text-[11px] font-medium">Home</span>
          </button>
          <button
            className="flex flex-col items-center gap-1 text-[#6B6B6B]"
            onClick={() => navigate("/orders/shopkeeper")}
          >
            <FileText size={24} />
            <span className="text-[11px]">Orders</span>
          </button>
          <button
            className="flex flex-col items-center gap-1 text-[#6B6B6B]"
            onClick={() => navigate("/quotations")}
          >
            <ShoppingCart size={24} />
            <span className="text-[11px]">Quotes</span>
          </button>
          <button
            className="flex flex-col items-center gap-1 text-[#6B6B6B]"
            onClick={() => navigate("/profile/shopkeeper")}
          >
            <User size={24} />
            <span className="text-[11px]">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
