import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Store, Laptop, ShoppingCart, Pill, ShirtIcon, Wrench, MoreHorizontal, ArrowRight } from "lucide-react";

export function SelectShopType() {
  const navigate = useNavigate();
  const { setShopType, user, updateProfile } = useAuth();
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherDescription, setOtherDescription] = useState("");

  useEffect(() => {
    // If user already has a shop type, redirect to dashboard
    if (user?.shopType) {
      navigate("/dashboard/shopkeeper");
    } else if (user?.userType !== "shopkeeper") {
      // If not a shopkeeper, redirect
      navigate("/select-user-type");
    }
  }, [user?.shopType, user?.userType, navigate]);

  const shopTypes = [
    {
      type: "general" as const,
      icon: Store,
      title: "General Store",
      description: "Daily essentials, snacks, beverages, and household items",
    },
    {
      type: "electronics" as const,
      icon: Laptop,
      title: "Electronics",
      description: "Mobile phones, computers, accessories, and gadgets",
    },
    {
      type: "grocery" as const,
      icon: ShoppingCart,
      title: "Grocery",
      description: "Fresh produce, staples, packaged foods, and dairy products",
    },
    {
      type: "pharmacy" as const,
      icon: Pill,
      title: "Pharmacy",
      description: "Medicines, health supplements, and medical supplies",
    },
    {
      type: "clothing" as const,
      icon: ShirtIcon,
      title: "Clothing & Apparel",
      description: "Fashion, textiles, footwear, and accessories",
    },
    {
      type: "hardware" as const,
      icon: Wrench,
      title: "Hardware",
      description: "Tools, building materials, paint, and equipment",
    },
  ];

  const handleSelectShopType = async (type: typeof shopTypes[number]["type"]) => {
    await setShopType(type);
    navigate("/dashboard/shopkeeper");
  };

  const handleSelectOther = () => {
    setShowOtherInput(true);
  };

  const handleOtherSubmit = async () => {
    if (otherDescription.trim()) {
      await setShopType("other");
      await updateProfile({ shopDescription: otherDescription.trim() });
      navigate("/dashboard/shopkeeper");
    }
  };

  if (showOtherInput) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
        <div className="bg-white px-6 py-4 shadow-sm">
          <h1 className="text-[24px] font-bold text-[#1A1A1A]">BulkBridge</h1>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 py-8">
          <div className="max-w-md mx-auto w-full">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#E8453C] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MoreHorizontal className="w-8 h-8 text-[#E8453C]" />
              </div>
              <h2 className="font-bold text-[#1A1A1A] mb-2">Tell us about your shop</h2>
              <p className="text-[16px] text-gray-600">
                Provide a brief description of the products you sell
              </p>
            </div>

            <div className="bg-white rounded-[12px] p-6 shadow-sm mb-6">
              <label className="block text-sm font-medium text-[#1A1A1A] mb-3">
                Shop Description <span className="text-[#E8453C]">*</span>
              </label>
              <textarea
                value={otherDescription}
                onChange={(e) => setOtherDescription(e.target.value)}
                placeholder="e.g., Pet supplies and accessories, Stationery and books, Sports equipment..."
                rows={4}
                className="w-full px-4 py-3 bg-[#F5F5F5] rounded-lg border-2 border-transparent outline-none focus:border-[#E8453C] transition-colors resize-none"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2">
                This helps wholesalers understand your business better
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleOtherSubmit}
                disabled={!otherDescription.trim()}
                className={`w-full py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  otherDescription.trim()
                    ? "bg-[#E8453C] text-white shadow-lg hover:bg-[#d43d35] active:scale-[0.98]"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                Continue to Dashboard
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => setShowOtherInput(false)}
                className="w-full py-3.5 border-2 border-gray-300 rounded-xl font-medium text-[#1A1A1A] hover:bg-gray-50 transition-colors"
              >
                Back to Shop Types
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      <div className="bg-white px-6 py-4 shadow-sm">
        <h1 className="text-[24px] font-bold text-[#1A1A1A]">BulkBridge</h1>
      </div>

      <div className="flex-1 px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-bold text-[#1A1A1A] mb-2">Select Your Shop Type</h2>
            <p className="text-[16px] text-gray-600">
              This helps us personalize your experience and connect you with relevant wholesalers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shopTypes.map((shop) => {
              const Icon = shop.icon;
              return (
                <button
                  key={shop.type}
                  onClick={() => handleSelectShopType(shop.type)}
                  className="bg-white border-2 border-gray-300 rounded-[12px] p-6 hover:border-[#E8453C] hover:shadow-lg transition-all group text-left"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-[#E8453C] bg-opacity-10 rounded-[12px] flex items-center justify-center flex-shrink-0 group-hover:bg-opacity-20 transition-colors">
                      <Icon className="w-7 h-7 text-[#E8453C]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-[#1A1A1A] mb-1.5">
                        {shop.title}
                      </h3>
                      <p className="text-[14px] text-gray-600 leading-relaxed">
                        {shop.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}

            <button
              onClick={handleSelectOther}
              className="bg-white border-2 border-gray-300 rounded-[12px] p-6 hover:border-[#E8453C] hover:shadow-lg transition-all group text-left"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-[#E8453C] bg-opacity-10 rounded-[12px] flex items-center justify-center flex-shrink-0 group-hover:bg-opacity-20 transition-colors">
                  <MoreHorizontal className="w-7 h-7 text-[#E8453C]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[#1A1A1A] mb-1.5">
                    Other
                  </h3>
                  <p className="text-[14px] text-gray-600 leading-relaxed">
                    My shop type is not listed above
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
