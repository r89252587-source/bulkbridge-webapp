import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ShoppingCart, Clock, ChevronRight, Loader2, Home, FileText, User } from "lucide-react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../context/AuthContext";

interface Bid {
  id: string;
  category: string;
  items: any[];
  totalEstimatedAmount: number;
  status: string;
  createdAt: any;
  deliveryDate: string;
  title?: string;
}

export function QuotationsList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "bids"),
      where("shopkeeperId", "==", user.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const b: Bid[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        b.push({ 
          id: doc.id, 
          ...data,
          totalEstimatedAmount: data.totalEstimatedAmount || data.total || 0,
          items: data.items || [],
          category: data.category || "Order",
          status: data.status || "active"
        } as Bid);
      });
      
      // Sort in-memory: Active first, then by createdAt desc
      b.sort((a, b) => {
        if (a.status !== b.status) {
          return a.status === "active" ? -1 : 1;
        }
        
        let timeA = 0;
        let timeB = 0;
        
        if (a.createdAt) {
           timeA = a.createdAt.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime();
        }
        if (b.createdAt) {
           timeB = b.createdAt.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime();
        }
        return timeB - timeA;
      });
      
      setBids(b);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching bids:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4 mb-2">
          <button onClick={() => navigate("/dashboard/shopkeeper")}>
            <ArrowLeft className="w-6 h-6 text-[#1A1A1A]" />
          </button>
          <h1 className="text-[20px] font-bold text-[#1A1A1A]">Quotations</h1>
        </div>
        <p className="text-sm text-[#6B6B6B] ml-10">Compare prices for your active requests</p>
      </div>

      <div className="px-4 py-6 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#6B6B6B]">
            <Loader2 className="animate-spin mb-3" size={32} />
            <p className="font-medium">Loading your requests...</p>
          </div>
        ) : bids.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
            <ShoppingCart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-[#1A1A1A] font-bold mb-2">No active requests</h3>
            <p className="text-sm text-[#6B6B6B] mb-6">Create a new order list to start receiving quotations from wholesalers.</p>
            <button 
              onClick={() => navigate("/create-order")}
              className="bg-[#E8453C] text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-[#d43d35] transition-colors"
            >
              Create New Bid
            </button>
          </div>
        ) : (
          bids.map((bid) => (
            <div 
              key={bid.id}
              onClick={() => navigate(`/quotations/${bid.id}`)}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 cursor-pointer active:scale-[0.98] transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-[#E8453C]/10 p-3 rounded-xl">
                    <ShoppingCart className="text-[#E8453C]" size={22} />
                  </div>
                  <div>
                    <h3 className="text-[#1A1A1A] font-bold">{bid.title || `${bid.category} List`}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded ${
                        bid.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {bid.status}
                      </span>
                      <span className="text-[12px] text-[#6B6B6B]">
                        {bid.items?.length || 0} items
                      </span>
                    </div>
                  </div>
                </div>
                 <div className="text-right">
                  <p className="text-[11px] text-[#6B6B6B]">Budget Est.</p>
                  <p className="text-[18px] font-bold text-[#1A1A1A]">₹{(bid.totalEstimatedAmount || 0).toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center gap-1.5 text-[#6B6B6B]">
                  <Clock size={14} />
                  <span className="text-[12px]">Placed {bid.createdAt?.toDate ? bid.createdAt.toDate().toLocaleDateString() : 'recently'}</span>
                </div>
                <div className="flex items-center gap-1 text-[#E8453C] font-bold text-[13px]">
                  View Quotes <ChevronRight size={16} />
                </div>
              </div>
            </div>
          ))
        )}
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
          <button className="flex flex-col items-center gap-1 text-[#E8453C]">
            <ShoppingCart className="w-6 h-6" />
            <span className="text-[11px] font-medium">Quotes</span>
          </button>
          <button 
            onClick={() => navigate("/profile/shopkeeper")}
            className="flex flex-col items-center gap-1 text-[#6B6B6B]"
          >
            <User className="w-6 h-6" />
            <span className="text-[11px]">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
