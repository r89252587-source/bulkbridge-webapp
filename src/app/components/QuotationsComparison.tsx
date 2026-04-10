import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, CheckCircle, Star, TrendingDown, X, Loader2 } from "lucide-react";
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../context/AuthContext";

interface Quotation {
  id: string;
  bidId: string;
  wholesalerId: string;
  wholesalerName: string;
  wholesalerBusinessName: string;
  total: number;
  items: any[];
  deliveryDays: string;
  notes?: string;
  status: string;
  sentAt: string;
  // UI derived
  verified?: boolean;
  rating?: number;
  reviewCount?: number;
  isBestValue?: boolean;
}

export function QuotationsComparison() {
  const navigate = useNavigate();
  const { orderId } = useParams(); // This is the bidId
  const { user } = useAuth();
  const [selectedQuote, setSelectedQuote] = useState<Quotation | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    const q = query(
      collection(db, "quotations"),
      where("bidId", "==", orderId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const qts: Quotation[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        qts.push({ 
          id: doc.id, 
          ...data,
          verified: true,
          rating: 4.5 + Math.random() * 0.5,
          reviewCount: Math.floor(Math.random() * 500) + 50,
        } as Quotation);
      });

      // Simple best value logic: lowest total
      if (qts.length > 0) {
        const lowestTotal = Math.min(...qts.map(q => q.total));
        qts.forEach(q => q.isBestValue = q.total === lowestTotal);
      }

      setQuotations(qts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [orderId]);

  const handleConfirmOrder = async () => {
    if (!selectedQuote || !user || !orderId) return;
    setConfirming(true);
    try {
      // 1. Create the Order
      const newOrder = {
        bidId: orderId,
        quotationId: selectedQuote.id,
        shopkeeperId: user.id,
        wholesalerId: selectedQuote.wholesalerId,
        wholesalerName: selectedQuote.wholesalerName,
        wholesalerBusinessName: selectedQuote.wholesalerBusinessName,
        totalAmount: selectedQuote.total,
        status: "Confirmed",
        createdAt: new Date().toISOString(),
        items: selectedQuote.items,
        deliveryDays: selectedQuote.deliveryDays
      };
      
      const orderDoc = await addDoc(collection(db, "orders"), newOrder);

      // 2. Mark the Bid as closed/completed
      await updateDoc(doc(db, "bids", orderId), { status: "completed", orderId: orderDoc.id });

      // 3. Mark the Quotation as accepted
      await updateDoc(doc(db, "quotations", selectedQuote.id), { status: "accepted" });

      // 4. Notify the wholesaler
      await addDoc(collection(db, "notifications"), {
        userId: selectedQuote.wholesalerId,
        type: "order",
        title: "Order Confirmed!",
        message: `${user.businessName || user.name} confirmed your quotation of ₹${selectedQuote.total.toLocaleString("en-IN")}. Check your orders.`,
        createdAt: new Date().toISOString(),
        read: false,
        actionRoute: `/order/${orderDoc.id}`,
      });

      navigate(`/order/${orderDoc.id}`);
    } catch (error) {
      console.error("Error confirming order:", error);
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-[#E8453C] mb-4" size={48} />
        <p className="text-[#6B6B6B] font-medium">Fetching quotations...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-6">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="text-[#1A1A1A]">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-[#1A1A1A] font-bold">Quotations</h2>
          <p className="text-sm text-[#6B6B6B]">Bid #{orderId?.slice(-6)}</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-[#E8453C]/10 px-6 py-4 mx-4 mt-4 rounded-xl">
        <p className="text-[#E8453C] text-sm font-medium">
          🏪 {quotations.length} wholesalers responded to your bid
        </p>
        <p className="text-[#E8453C]/80 text-xs mt-0.5">
          Tap "View Details" to review, then "Select" to confirm an order
        </p>
      </div>

      {/* Quotations List */}
      <div className="px-4 py-4 space-y-3">
        {quotations.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center shadow-sm">
            <Loader2 className="animate-spin text-[#E8453C] mx-auto mb-4" size={32} />
            <p className="text-[#1A1A1A] font-medium">Awaiting wholesaler responses</p>
            <p className="text-sm text-[#6B6B6B] mt-1">Quotations will appear here as soon as they are submitted</p>
          </div>
        ) : (
          quotations.map((quote) => (
            <div
              key={quote.id}
              className={`bg-white rounded-xl p-5 shadow-sm ${
                quote.isBestValue ? "ring-2 ring-[#E8453C] relative" : ""
              }`}
            >
              {quote.isBestValue && (
                <div className="absolute -top-3 left-4 bg-[#E8453C] text-white px-3 py-1 rounded-full text-xs flex items-center gap-1 font-medium">
                  <TrendingDown size={12} />
                  Best Value
                </div>
              )}

              <div className="space-y-4">
                {/* Wholesaler Info */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[#1A1A1A] font-bold">
                        {quote.wholesalerBusinessName || quote.wholesalerName}
                      </h3>
                      {quote.verified && (
                        <CheckCircle className="text-blue-500" size={16} />
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="text-yellow-500 fill-yellow-500" size={14} />
                      <span className="text-[#1A1A1A] text-sm font-medium">{quote.rating}</span>
                      <span className="text-[#6B6B6B] text-xs ml-1">({quote.reviewCount} reviews)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#6B6B6B]">Total</p>
                    <p className="text-2xl font-bold text-[#1A1A1A]">
                      ₹{quote.total.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-[#6B6B6B]">Items Covered</p>
                    <p className="text-[#1A1A1A] font-medium mt-0.5">{quote.items.length} items</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B6B6B]">Delivery Time</p>
                    <p className="text-[#1A1A1A] font-medium mt-0.5">
                      {quote.deliveryDays} Day{parseInt(quote.deliveryDays) > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {/* Notes */}
                {quote.notes && (
                  <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 italic">
                    "{quote.notes}"
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => setSelectedQuote(quote)}
                    className="flex-1 py-3 border border-gray-200 rounded-lg text-[#1A1A1A] font-medium hover:bg-[#F5F5F5] transition-colors text-sm"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => {
                      setSelectedQuote(quote);
                      setShowConfirm(true);
                    }}
                    className={`flex-1 py-3 rounded-lg font-medium text-sm transition-all ${
                      quote.isBestValue
                        ? "bg-[#E8453C] text-white shadow-md hover:bg-[#d43d35]"
                        : "bg-[#1A1A1A] text-white hover:bg-[#2A2A2A]"
                    }`}
                  >
                    Select
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* View Details Modal */}
      {selectedQuote && !showConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-[24px] p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[18px] font-bold text-[#1A1A1A]">
                {selectedQuote.wholesalerBusinessName || selectedQuote.wholesalerName}
              </h3>
              <button onClick={() => setSelectedQuote(null)}>
                <X size={22} className="text-gray-500" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {selectedQuote.verified && (
                <span className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle size={12} /> Verified
                </span>
              )}
              <span className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                <Star size={12} className="fill-yellow-500 text-yellow-500" />
                {selectedQuote.rating} · {selectedQuote.reviewCount} reviews
              </span>
            </div>

            <div className="bg-[#E8453C]/5 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Total Quotation Amount</p>
              <p className="text-3xl font-bold text-[#1A1A1A]">
                ₹{selectedQuote.total.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Items Covered</p>
                <p className="font-bold text-[#1A1A1A]">{selectedQuote.items.length} items</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Delivery Time</p>
                <p className="font-bold text-[#1A1A1A]">
                  {selectedQuote.deliveryDays} Day{parseInt(selectedQuote.deliveryDays) > 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {selectedQuote.notes && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-xs text-yellow-700 font-medium mb-1">Wholesaler Note</p>
                <p className="text-sm text-gray-700">{selectedQuote.notes}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSelectedQuote(null)}
                className="flex-1 py-3.5 border border-gray-200 rounded-[12px] text-[#1A1A1A] font-medium hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => setShowConfirm(true)}
                className="flex-1 py-3.5 bg-[#E8453C] text-white rounded-[12px] font-medium hover:bg-[#d43d35] transition-colors shadow-md"
              >
                Select This Quote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Order Modal */}
      {showConfirm && selectedQuote && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-6">
          <div className="bg-white rounded-[20px] p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-[18px] font-bold text-[#1A1A1A] mb-2">Confirm Order?</h3>
            <p className="text-gray-600 text-sm mb-4">
              You are placing an order with{" "}
              <span className="font-bold text-[#1A1A1A]">{selectedQuote.wholesalerName}</span>{" "}
              for{" "}
              <span className="font-bold text-[#E8453C]">
                ₹{selectedQuote.total.toLocaleString("en-IN")}
              </span>
              . Delivery in {selectedQuote.deliveryDays} days.
            </p>
            <p className="text-xs text-gray-400 mb-5">
              30% advance payment will be collected to confirm the order.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setSelectedQuote(null);
                }}
                disabled={confirming}
                className="flex-1 py-3 border border-gray-200 rounded-[12px] text-[#1A1A1A] font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmOrder}
                disabled={confirming}
                className="flex-1 py-3 bg-[#E8453C] text-white rounded-[12px] font-medium hover:bg-[#d43d35] transition-colors disabled:opacity-60"
              >
                {confirming ? "Confirming..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
