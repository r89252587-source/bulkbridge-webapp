import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  FileText,
  ChevronLeft,
  Edit2,
  Save,
  LogOut,
  Store,
  Home,
  ShoppingCart,
} from "lucide-react";

export function ShopkeeperProfile() {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    businessName: user?.businessName || "",
    address: user?.address || "",
    gstNumber: user?.gstNumber || "",
  });

  const handleSave = () => {
    updateProfile(formData);
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20">
      {/* Header */}
      <div className="bg-white px-6 py-4 shadow-sm flex items-center gap-4">
        <button onClick={() => navigate("/dashboard/shopkeeper")} className="p-1">
          <ChevronLeft className="w-6 h-6 text-[#1A1A1A]" />
        </button>
        <h1 className="text-[20px] font-bold text-[#1A1A1A]">My Profile</h1>
        <button
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          className="ml-auto p-2 text-[#E8453C]"
        >
          {isEditing ? <Save className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Profile Content */}
      <div className="px-6 py-6 space-y-4">
        {/* Profile Picture Section */}
        <div className="bg-white rounded-[12px] p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-[#E8453C] bg-opacity-10 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-[#E8453C]" />
            </div>
            <div>
              <h2 className="font-bold text-[#1A1A1A]">{user?.name}</h2>
              <p className="text-[14px] text-gray-600">Shopkeeper</p>
              <div className="mt-1 inline-block px-3 py-1 bg-green-100 text-green-700 text-[12px] font-medium rounded-full">
                Verified
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-[12px] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-bold text-[#1A1A1A]">Personal Information</h3>
          </div>

          <div className="p-6 space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-[14px] text-gray-600 mb-1.5">
                Full Name
              </label>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="flex-1 text-[16px] text-[#1A1A1A] border border-gray-300 rounded-[8px] px-3 py-2 focus:outline-none focus:border-[#E8453C]"
                  />
                ) : (
                  <span className="text-[16px] text-[#1A1A1A]">{formData.name}</span>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[14px] text-gray-600 mb-1.5">Email</label>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-[16px] text-[#1A1A1A]">{formData.email}</span>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[14px] text-gray-600 mb-1.5">Phone</label>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="Enter phone number"
                    className="flex-1 text-[16px] text-[#1A1A1A] border border-gray-300 rounded-[8px] px-3 py-2 focus:outline-none focus:border-[#E8453C]"
                  />
                ) : (
                  <span className="text-[16px] text-[#1A1A1A]">
                    {formData.phone || "Not provided"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="bg-white rounded-[12px] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-bold text-[#1A1A1A]">Business Information</h3>
          </div>

          <div className="p-6 space-y-4">
            {/* Business Name */}
            <div>
              <label className="block text-[14px] text-gray-600 mb-1.5">
                Business Name
              </label>
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-gray-400" />
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) =>
                      setFormData({ ...formData, businessName: e.target.value })
                    }
                    placeholder="Enter business name"
                    className="flex-1 text-[16px] text-[#1A1A1A] border border-gray-300 rounded-[8px] px-3 py-2 focus:outline-none focus:border-[#E8453C]"
                  />
                ) : (
                  <span className="text-[16px] text-[#1A1A1A]">
                    {formData.businessName || "Not provided"}
                  </span>
                )}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-[14px] text-gray-600 mb-1.5">
                Address
              </label>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                {isEditing ? (
                  <textarea
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="Enter business address"
                    rows={3}
                    className="flex-1 text-[16px] text-[#1A1A1A] border border-gray-300 rounded-[8px] px-3 py-2 focus:outline-none focus:border-[#E8453C] resize-none"
                  />
                ) : (
                  <span className="text-[16px] text-[#1A1A1A]">
                    {formData.address || "Not provided"}
                  </span>
                )}
              </div>
            </div>

            {/* GST Number */}
            <div>
              <label className="block text-[14px] text-gray-600 mb-1.5">
                GST Number
              </label>
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-400" />
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.gstNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, gstNumber: e.target.value })
                    }
                    placeholder="Enter GST number"
                    className="flex-1 text-[16px] text-[#1A1A1A] border border-gray-300 rounded-[8px] px-3 py-2 focus:outline-none focus:border-[#E8453C]"
                  />
                ) : (
                  <span className="text-[16px] text-[#1A1A1A]">
                    {formData.gstNumber || "Not provided"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-white border border-[#E8453C] text-[#E8453C] py-3.5 rounded-[12px] font-medium text-[16px] flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>

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
          <button
            onClick={() => navigate("/orders/shopkeeper")}
            className="flex flex-col items-center gap-1 text-[#6B6B6B]"
          >
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
          <button className="flex flex-col items-center gap-1 text-[#E8453C]">
            <User className="w-6 h-6" />
            <span className="text-[11px] font-medium">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
