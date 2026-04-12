import { useNavigate, Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Store, Warehouse, CheckCircle } from "lucide-react";

export function SelectUserType() {
  const navigate = useNavigate();
  const { setUserType, user } = useAuth();

  // If user already has a type, redirect to appropriate dashboard
  if (user?.userType === "shopkeeper") {
    if (!user.shopType) {
      return <Navigate to="/select-shop-type" replace />;
    }
    return <Navigate to="/dashboard/shopkeeper" replace />;
  } else if (user?.userType === "wholesaler") {
    return <Navigate to="/wholesaler" replace />;
  }

  const handleSelectType = async (type: "shopkeeper" | "wholesaler") => {
    await setUserType(type);
    if (type === "shopkeeper") {
      navigate("/select-shop-type");
    } else {
      navigate("/wholesaler");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      {/* Header */}
      <div className="bg-white px-6 py-4 shadow-sm">
        <h1 className="text-[24px] font-bold text-[#1A1A1A]">BulkBridge</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <div className="max-w-md mx-auto w-full">
          <div className="text-center mb-10">
            <h2 className="font-bold text-[#1A1A1A] mb-2">Welcome, {user?.name}!</h2>
            <p className="text-[16px] text-gray-600">
              Please select your account type to continue
            </p>
          </div>

          <div className="space-y-4">
            {/* Shopkeeper Option */}
            <button
              onClick={() => handleSelectType("shopkeeper")}
              className="w-full bg-white border-2 border-gray-300 rounded-[12px] p-6 hover:border-[#E8453C] hover:shadow-lg transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-[#E8453C] bg-opacity-10 rounded-[12px] flex items-center justify-center flex-shrink-0 group-hover:bg-opacity-20 transition-colors">
                  <Store className="w-8 h-8 text-[#E8453C]" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-bold text-[#1A1A1A] mb-1.5">
                    I'm a Shopkeeper
                  </h3>
                  <p className="text-[14px] text-gray-600 leading-relaxed">
                    Create order lists, post bids, compare quotations from wholesalers,
                    and manage your inventory purchases
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-[#E8453C]">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-[14px] font-medium">
                      Buy products in bulk
                    </span>
                  </div>
                </div>
              </div>
            </button>

            {/* Wholesaler Option */}
            <button
              onClick={() => handleSelectType("wholesaler")}
              className="w-full bg-white border-2 border-gray-300 rounded-[12px] p-6 hover:border-[#E8453C] hover:shadow-lg transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-[#E8453C] bg-opacity-10 rounded-[12px] flex items-center justify-center flex-shrink-0 group-hover:bg-opacity-20 transition-colors">
                  <Warehouse className="w-8 h-8 text-[#E8453C]" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-bold text-[#1A1A1A] mb-1.5">
                    I'm a Wholesaler
                  </h3>
                  <p className="text-[14px] text-gray-600 leading-relaxed">
                    View incoming bids, send competitive quotations, manage orders,
                    and grow your wholesale business
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-[#E8453C]">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-[14px] font-medium">
                      Sell products in bulk
                    </span>
                  </div>
                </div>
              </div>
            </button>
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-[12px]">
            <p className="text-[14px] text-blue-800 text-center">
              💡 You can change your account type later in settings
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
