import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Store, Warehouse, TrendingUp, Shield, Zap } from "lucide-react";
import { useEffect } from "react";

export function Welcome() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    // Auto-redirect if already authenticated
    if (isAuthenticated && user?.userType) {
      if (user.userType === "shopkeeper") {
        navigate("/dashboard/shopkeeper");
      } else {
        navigate("/wholesaler");
      }
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      {/* Header */}
      <div className="bg-white px-6 py-6 shadow-sm">
        <h1 className="text-[28px] font-bold text-[#1A1A1A]">BulkBridge</h1>
        <p className="text-[14px] text-gray-600 mt-1">
          Connecting Shopkeepers with Wholesalers
        </p>
      </div>

      {/* Hero Section */}
      <div className="flex-1 px-6 py-8">
        <div className="max-w-md mx-auto">
          {/* Main Visual */}
          <div className="bg-gradient-to-br from-[#E8453C] to-[#d63d33] rounded-[20px] p-8 text-white mb-8 shadow-xl">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-6">
                <TrendingUp className="w-16 h-16" />
              </div>
            </div>
            <h2 className="text-center font-bold mb-3 text-[24px]">
              Simplify Your Bulk Trading
            </h2>
            <p className="text-center text-white/90 text-[16px]">
              Get the best wholesale prices, compare quotations, and manage orders
              seamlessly
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4 mb-8">
            <div className="bg-white rounded-[12px] p-5 shadow-sm flex items-start gap-4">
              <div className="bg-[#E8453C] bg-opacity-10 p-3 rounded-lg">
                <Shield className="w-6 h-6 text-[#E8453C]" />
              </div>
              <div>
                <h3 className="font-bold text-[#1A1A1A] mb-1">Verified Sellers</h3>
                <p className="text-[14px] text-gray-600">
                  All wholesalers are verified for your security
                </p>
              </div>
            </div>

            <div className="bg-white rounded-[12px] p-5 shadow-sm flex items-start gap-4">
              <div className="bg-[#E8453C] bg-opacity-10 p-3 rounded-lg">
                <Zap className="w-6 h-6 text-[#E8453C]" />
              </div>
              <div>
                <h3 className="font-bold text-[#1A1A1A] mb-1">Fast & Easy</h3>
                <p className="text-[14px] text-gray-600">
                  Create bids and get multiple quotes in minutes
                </p>
              </div>
            </div>

            <div className="bg-white rounded-[12px] p-5 shadow-sm flex items-start gap-4">
              <div className="bg-[#E8453C] bg-opacity-10 p-3 rounded-lg">
                <Store className="w-6 h-6 text-[#E8453C]" />
              </div>
              <div>
                <h3 className="font-bold text-[#1A1A1A] mb-1">For Everyone</h3>
                <p className="text-[14px] text-gray-600">
                  Whether you're buying or selling in bulk
                </p>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => navigate("/signup")}
              className="w-full bg-[#E8453C] text-white py-4 rounded-[12px] font-medium text-[16px] shadow-lg hover:bg-[#d63d33] transition-all active:scale-[0.98]"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-white border-2 border-[#E8453C] text-[#E8453C] py-4 rounded-[12px] font-medium text-[16px] hover:bg-red-50 transition-all active:scale-[0.98]"
            >
              Sign In
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-200">
            <div className="text-center">
              <p className="font-bold text-[#1A1A1A] text-[24px]">500+</p>
              <p className="text-[12px] text-gray-600">Shopkeepers</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-[#1A1A1A] text-[24px]">200+</p>
              <p className="text-[12px] text-gray-600">Wholesalers</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-[#1A1A1A] text-[24px]">₹10L+</p>
              <p className="text-[12px] text-gray-600">Daily Trading</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
