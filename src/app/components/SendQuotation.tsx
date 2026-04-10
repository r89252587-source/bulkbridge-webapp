import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { ChevronLeft, Package, CheckCircle, Loader2 } from "lucide-react";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../context/AuthContext";

interface QuotationItem {
  id: string;
  productName: string;
  requestedQty: number;
  unit: string;
  pricePerUnit: string;
}

export function SendQuotation() {
  const navigate = useNavigate();
  const { bidId } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bid, setBid] = useState<any>(null);
  const [deliveryDays, setDeliveryDays] = useState("3");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [items, setItems] = useState<QuotationItem[]>([]);

  useEffect(() => {
    const fetchBid = async () => {
      if (!bidId) return;
      setLoading(true);
      try {
        const docRef = doc(db, "bids", bidId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const bidData = docSnap.data();
          setBid(bidData);
          setItems(
            bidData.items.map((item: any) => ({
              id: item.id,
              productName: item.product,
              requestedQty: parseFloat(item.quantity),
              unit: item.unit,
              pricePerUnit: "",
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching bid:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBid();
  }, [bidId]);

  const handlePriceChange = (id: string, price: string) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, pricePerUnit: price } : item
      )
    );
  };

  const calculateItemTotal = (item: QuotationItem) => {
    const price = parseFloat(item.pricePerUnit) || 0;
    return price * item.requestedQty;
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  const isFormValid = () => {
    return (
      items.every((item) => item.pricePerUnit && parseFloat(item.pricePerUnit) > 0) &&
      deliveryDays.trim() !== "" &&
      parseInt(deliveryDays) > 0 &&
      !submitting
    );
  };

  const handleSendQuotation = async () => {
    if (!isFormValid() || !user || !bidId) return;
    
    setSubmitting(true);
    try {
      const total = calculateTotal();
      const quotation = {
        bidId,
        shopkeeperId: bid.shopkeeperId,
        wholesalerId: user.id,
        wholesalerName: user.name,
        wholesalerBusinessName: user.businessName || "",
        items,
        deliveryDays,
        notes,
        total,
        sentAt: new Date().toISOString(),
        status: "pending",
      };
      
      await addDoc(collection(db, "quotations"), quotation);

      // Notify the shopkeeper
      await addDoc(collection(db, "notifications"), {
        userId: bid.shopkeeperId,
        type: "quote",
        title: "New Quotation Received",
        message: `${user.businessName || user.name} sent a quotation of ₹${total.toLocaleString("en-IN")} for your ${bid.category} bid.`,
        createdAt: new Date().toISOString(),
        read: false,
        actionRoute: `/quotations/${bidId}`,
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Error sending quotation:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-[#E8453C] mb-4" size={48} />
        <p className="text-[#6B6B6B] font-medium">Loading bid details...</p>
      </div>
    );
  }

  // Success screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center px-6">
        <div className="bg-white rounded-[20px] p-8 shadow-lg text-center max-w-sm w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-[22px] font-bold text-[#1A1A1A] mb-2">Quotation Sent!</h2>
          <p className="text-gray-600 mb-2">
            Your quotation of{" "}
            <span className="font-bold text-[#E8453C]">
              ₹{calculateTotal().toLocaleString("en-IN")}
            </span>{" "}
            has been sent to the shopkeeper.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Delivery in {deliveryDays} day{parseInt(deliveryDays) !== 1 ? "s" : ""}. You'll be notified when the shopkeeper responds.
          </p>
          <button
            onClick={() => navigate("/wholesaler")}
            className="w-full bg-[#E8453C] text-white py-3.5 rounded-[12px] font-medium text-[16px] hover:bg-[#d63d33] transition-colors"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => navigate("/wholesaler/bids")}
            className="w-full mt-3 border border-gray-300 text-[#1A1A1A] py-3.5 rounded-[12px] font-medium text-[16px] hover:bg-gray-50 transition-colors"
          >
            View All Bids
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24">
      {/* Header */}
      <div className="bg-white px-6 py-4 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)}>
            <ChevronLeft className="w-6 h-6 text-[#1A1A1A]" />
          </button>
          <div>
            <h1 className="text-[20px] font-bold text-[#1A1A1A]">Send Quotation</h1>
            <p className="text-[14px] text-gray-600">
              Bid #{bidId?.slice(-6)} · {bid?.shopkeeperBusinessName || bid?.shopkeeperName}
            </p>
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="px-6 py-6 space-y-4">
        <div className="bg-white rounded-[12px] p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#E8453C] bg-opacity-10 p-2.5 rounded-lg">
              <Package className="w-5 h-5 text-[#E8453C]" />
            </div>
            <div>
              <h3 className="font-bold text-[#1A1A1A]">Bid Details</h3>
              <p className="text-[14px] text-gray-600">{items.length} items requested</p>
            </div>
          </div>
          <div className="space-y-2 text-[14px]">
            <div className="flex justify-between">
              <span className="text-gray-600">Categories</span>
              <span className="text-[#1A1A1A] font-medium">{bid?.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Required Delivery</span>
              <span className="text-[#E8453C] font-medium">{bid?.deliveryDate || "As soon as possible"}</span>
            </div>
          </div>
        </div>

        {/* Items Pricing */}
        <div className="bg-white rounded-[12px] p-5 shadow-sm">
          <h3 className="font-bold text-[#1A1A1A] mb-4">Items &amp; Pricing</h3>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-[12px] p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-[#1A1A1A] font-medium">{item.productName}</h4>
                    <p className="text-[14px] text-gray-600">
                      Requested: {item.requestedQty} {item.unit}
                    </p>
                  </div>
                  {item.pricePerUnit && parseFloat(item.pricePerUnit) > 0 && (
                    <span className="text-[#E8453C] font-bold">
                      ₹{calculateItemTotal(item).toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-[14px] text-gray-600 mb-2">
                    Your price per {item.unit} (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={item.pricePerUnit}
                    onChange={(e) => handlePriceChange(item.id, e.target.value)}
                    placeholder="Enter price"
                    className="w-full px-4 py-3 border border-gray-300 rounded-[12px] text-[16px] focus:outline-none focus:border-[#E8453C] transition-colors"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Time */}
        <div className="bg-white rounded-[12px] p-5 shadow-sm">
          <h3 className="font-bold text-[#1A1A1A] mb-4">Delivery Details</h3>
          <div>
            <label className="block text-[14px] text-gray-600 mb-2">
              Delivery Time (in days)
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={deliveryDays}
              onChange={(e) => setDeliveryDays(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-[12px] text-[16px] focus:outline-none focus:border-[#E8453C] transition-colors"
            />
          </div>
        </div>

        {/* Additional Notes */}
        <div className="bg-white rounded-[12px] p-5 shadow-sm">
          <h3 className="font-bold text-[#1A1A1A] mb-4">Additional Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any special terms, conditions, or notes..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-[12px] text-[16px] focus:outline-none focus:border-[#E8453C] resize-none transition-colors"
          />
        </div>

        {/* Total Summary */}
        <div className="bg-[#E8453C]/5 border border-[#E8453C]/30 rounded-[12px] p-5">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[14px] text-gray-600 mb-1">Total Quotation</p>
              <p className="font-bold text-[#1A1A1A] text-[24px]">
                ₹{calculateTotal().toLocaleString("en-IN")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[14px] text-gray-600">Delivery in</p>
              <p className="font-medium text-[#E8453C]">
                {deliveryDays || "—"} {deliveryDays === "1" ? "day" : "days"}
              </p>
            </div>
          </div>
        </div>
      </div>

    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
        <button
          onClick={handleSendQuotation}
          disabled={!isFormValid()}
          className="w-full bg-[#E8453C] text-white py-4 rounded-[12px] font-medium text-[16px] shadow-lg hover:bg-[#d63d33] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Sending Quotation...
            </>
          ) : (
            "Send Quotation to Shopkeeper"
          )}
        </button>
      </div>
    </div>
  );
}
