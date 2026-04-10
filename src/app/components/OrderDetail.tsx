import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, MapPin, Building2, CheckCircle2, Package, Truck, Home, Loader2, KeyRound } from "lucide-react";
import { doc, getDoc, updateDoc, addDoc, collection } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../context/AuthContext";


interface OrderItem {
  id?: string;
  name: string;
  quantity: string;
  price: number;
}

export function OrderDetail() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery");
  const { user } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpError, setOtpError] = useState("");

  const isWholesaler = user?.userType === "wholesaler" || (order && user?.id === order.wholesalerId);
  const isShopkeeper = user?.userType === "shopkeeper" || (order && user?.id === order.shopkeeperId);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      setLoading(true);
      try {
        const docRef = doc(db, "orders", orderId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setOrder(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-[#E8453C] mb-4" size={48} />
        <p className="text-[#6B6B6B] font-medium">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center p-6 text-center">
        <Package className="text-gray-300 mb-4" size={64} />
        <h2 className="text-xl font-bold text-[#1A1A1A]">Order Not Found</h2>
        <p className="text-[#6B6B6B] mt-2">The order you are looking for does not exist or has been removed.</p>
        <button onClick={() => navigate(-1)} className="mt-6 text-[#E8453C] font-medium">Go Back</button>
      </div>
    );
  }

  const orderItems: OrderItem[] = order.items.map((item: any) => ({
    name: item.productName || item.product,
    quantity: `${item.requestedQty || item.quantity} ${item.unit}`,
    price: item.pricePerUnit ? parseFloat(item.pricePerUnit) * parseFloat(item.requestedQty) : item.price || 0,
  }));

  const subtotal = order.totalAmount || order.totalPrice || orderItems.reduce((sum, item) => sum + item.price, 0);
  const gst = subtotal * 0.05;
  const deliveryFee = deliveryMethod === "delivery" ? 200 : 0;
  const total = subtotal + gst + deliveryFee;

  const advancePaid = total * 0.3;
  const balanceDue = total - advancePaid;

  const statusSteps = [
    { label: "Order Placed", date: new Date(order.createdAt).toLocaleDateString(), completed: true, icon: Package },
    { label: "Order Confirmed", date: new Date(order.createdAt).toLocaleDateString(), completed: order.status !== "Pending", icon: CheckCircle2 },
    { label: "Out for Delivery", date: order.status === "Shipped" || order.status === "Delivered" ? new Date().toLocaleDateString() : "Scheduled", completed: order.status === "Shipped" || order.status === "Delivered", icon: Truck },
    { label: "Delivered", date: order.status === "Delivered" ? new Date().toLocaleDateString() : "Pending", completed: order.status === "Delivered", icon: Home },
  ];

  const handleUpdateStatus = async (newStatus: string) => {
    if (!orderId || !user) return;
    setUpdating(true);
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      setOrder({ ...order, status: newStatus });
      
      // Notify shopkeeper
      if (newStatus === "Shipped") {
         await addDoc(collection(db, "notifications"), {
          userId: order.shopkeeperId,
          type: "order",
          title: "Order Shipped!",
          message: `Your order #${orderId.slice(-6).toUpperCase()} is out for delivery.`,
          createdAt: new Date().toISOString(),
          read: false,
          actionRoute: `/order/${orderId}`,
        });     
      } else if (newStatus === "Cancelled") {
         await addDoc(collection(db, "notifications"), {
          userId: order.shopkeeperId,
          type: "order",
          title: "Order Cancelled",
          message: `Your order #${orderId.slice(-6).toUpperCase()} was cancelled by the wholesaler.`,
          createdAt: new Date().toISOString(),
          read: false,
          actionRoute: `/order/${orderId}`,
        });   
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!enteredOtp) {
      setOtpError("Please enter OTP");
      return;
    }
    if (enteredOtp !== order.deliveryOtp) {
      setOtpError("Invalid OTP. Please check with shopkeeper.");
      return;
    }

    setOtpError("");
    setUpdating(true);
    try {
      await updateDoc(doc(db, "orders", orderId), { status: "Delivered" });
      setOrder({ ...order, status: "Delivered" });
      
      // Notify shopkeeper
      await addDoc(collection(db, "notifications"), {
        userId: order.shopkeeperId,
        type: "order",
        title: "Order Delivered",
        message: `Your order #${orderId.slice(-6).toUpperCase()} has been successfully delivered.`,
        createdAt: new Date().toISOString(),
        read: false,
        actionRoute: `/order/${orderId}`,
      });
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setOtpError("Failed to update order");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-6">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="text-[#1A1A1A]">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-[#1A1A1A]">Order Details</h2>
          <p className="text-sm text-[#6B6B6B]">#{orderId}</p>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-[#E8453C]/10 p-3 rounded-full">
              <Building2 className="text-[#E8453C]" size={24} />
            </div>
            <div>
              <h3 className="text-[#1A1A1A]">{order.wholesalerBusinessName || order.wholesalerName}</h3>
              <p className="text-sm text-[#6B6B6B]">Verified Wholesaler</p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="text-[#1A1A1A] mb-4">Order Summary</h3>
          <div className="space-y-3">
            {orderItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="text-[#1A1A1A]">{item.name}</p>
                  <p className="text-sm text-[#6B6B6B]">{item.quantity}</p>
                </div>
                <p className="text-[#1A1A1A]">₹{item.price.toLocaleString("en-IN")}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Breakdown */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="text-[#1A1A1A] mb-4">Payment Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[#6B6B6B]">Subtotal</span>
              <span className="text-[#1A1A1A]">₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B6B6B]">GST (5%)</span>
              <span className="text-[#1A1A1A]">₹{gst.toLocaleString("en-IN")}</span>
            </div>
            {deliveryMethod === "delivery" && (
              <div className="flex justify-between">
                <span className="text-[#6B6B6B]">Delivery Fee</span>
                <span className="text-[#1A1A1A]">₹{deliveryFee}</span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t border-gray-200">
              <span className="text-[#1A1A1A]">Total Amount</span>
              <span className="text-xl text-[#1A1A1A]">
                ₹{total.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
            <div className="flex justify-between">
              <span className="text-[#6B6B6B]">Advance Paid (30%)</span>
              <span className="text-green-600">₹{advancePaid.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#1A1A1A]">Balance Due</span>
              <span className="text-[#E8453C] text-xl">
                ₹{balanceDue.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Delivery Method Toggle */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="text-[#1A1A1A] mb-4">Fulfillment Method</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setDeliveryMethod("delivery")}
              className={`py-3 px-4 rounded-lg border-2 transition-all ${
                deliveryMethod === "delivery"
                  ? "border-[#E8453C] bg-[#E8453C]/5 text-[#E8453C]"
                  : "border-gray-200 text-[#6B6B6B]"
              }`}
            >
              <Truck className="mx-auto mb-2" size={24} />
              <p className="text-sm">Delivery</p>
            </button>
            <button
              onClick={() => setDeliveryMethod("pickup")}
              className={`py-3 px-4 rounded-lg border-2 transition-all ${
                deliveryMethod === "pickup"
                  ? "border-[#E8453C] bg-[#E8453C]/5 text-[#E8453C]"
                  : "border-gray-200 text-[#6B6B6B]"
              }`}
            >
              <MapPin className="mx-auto mb-2" size={24} />
              <p className="text-sm">Self Pickup</p>
            </button>
          </div>

          {deliveryMethod === "delivery" && (
            <div className="mt-4 p-4 bg-[#F5F5F5] rounded-lg">
              <p className="text-sm text-[#6B6B6B] mb-1">Delivery Address</p>
              <p className="text-[#1A1A1A]">
                Raj General Store<br />
                Shop 23, Gandhi Market<br />
                Delhi - 110006
              </p>
            </div>
          )}

          {deliveryMethod === "pickup" && (
            <div className="mt-4 p-4 bg-[#F5F5F5] rounded-lg">
              <p className="text-sm text-[#6B6B6B] mb-1">Pickup Location</p>
              <p className="text-[#1A1A1A]">
                Shree Traders<br />
                Warehouse 5, Azadpur Mandi<br />
                Delhi - 110033
              </p>
            </div>
          )}
        </div>

        {/* Status Timeline */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="text-[#1A1A1A] mb-4">Order Status</h3>
          <div className="space-y-6">
            {statusSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="flex gap-4">
                  <div className="relative flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        step.completed
                          ? "bg-[#E8453C] text-white"
                          : "bg-gray-200 text-[#6B6B6B]"
                      }`}
                    >
                      <Icon size={20} />
                    </div>
                    {index < statusSteps.length - 1 && (
                      <div
                        className={`w-0.5 h-12 ${
                          step.completed ? "bg-[#E8453C]" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className={`${step.completed ? "text-[#1A1A1A]" : "text-[#6B6B6B]"}`}>
                      {step.label}
                    </p>
                    <p className="text-sm text-[#6B6B6B] mt-1">{step.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Actions based on User Type and Status */}
        {order.status !== "Delivered" && order.status !== "Cancelled" && (
          <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
            
            {/* ====== WHOLESALER CONTROLS ====== */}
            {isWholesaler && (
              <div>
                <h3 className="text-[#1A1A1A] mb-4 font-bold border-b pb-2">Wholesaler Actions</h3>
                
                {order.status === "Confirmed" && (
                  <div className="flex gap-3 mt-4">
                    <button 
                      onClick={() => handleUpdateStatus("Cancelled")}
                      disabled={updating}
                      className="flex-1 py-3 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      Cancel Order
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus("Shipped")}
                      disabled={updating}
                      className="flex-1 py-3 bg-[#E8453C] text-white rounded-xl hover:bg-[#d43d35] transition-colors disabled:opacity-50"
                    >
                      {updating ? "Updating..." : "Mark as Shipped"}
                    </button>
                  </div>
                )}
                
                {order.status === "Shipped" && (
                  <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                    <p className="text-sm text-gray-700 mb-3">
                      To complete delivery, ask the shopkeeper for the 6-digit Delivery OTP.
                    </p>
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        maxLength={6}
                        placeholder="Enter 6-digit OTP"
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#E8453C]"
                      />
                      <button 
                        onClick={handleVerifyOtp}
                        disabled={updating || enteredOtp.length !== 6}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium"
                      >
                        {updating ? "Verifying..." : "Verify & Deliver"}
                      </button>
                    </div>
                    {otpError && <p className="text-red-500 text-xs mt-2">{otpError}</p>}
                  </div>
                )}
              </div>
            )}

            {/* ====== SHOPKEEPER CONTROLS ====== */}
            {isShopkeeper && order.status === "Shipped" && order.deliveryOtp && (
              <div>
                 <h3 className="text-[#1A1A1A] mb-3 font-bold border-b pb-2">Delivery OTP</h3>
                 <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
                    <KeyRound className="mx-auto text-green-600 mb-2" size={32} />
                    <p className="text-sm text-gray-600 mb-2">Share this PIN with the delivery executive</p>
                    <p className="text-4xl font-mono font-bold tracking-[0.25em] text-green-700">{order.deliveryOtp}</p>
                 </div>
              </div>
            )}
          </div>
        )}

        {order.status === "Cancelled" && (
           <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-center">
             <p className="text-red-700 font-medium">This order was cancelled.</p>
           </div>
        )}


        {/* Action Buttons */}
        <div className="flex gap-3">
          <button className="flex-1 py-4 border border-gray-200 rounded-xl text-[#1A1A1A] bg-white hover:bg-[#F5F5F5] transition-colors">
            Contact Wholesaler
          </button>
          <button className="flex-1 py-4 bg-[#E8453C] text-white rounded-xl hover:bg-[#d43d35] transition-colors">
            Get Help
          </button>
        </div>
      </div>
    </div>
  );
}
