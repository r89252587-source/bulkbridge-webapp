import { useState } from "react";
import { db } from "../../lib/firebase";
import { doc, setDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export function DemoData() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const populateDemoData = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Create Wholesaler User
      await setDoc(doc(db, "users", "Bm0JJrHQa7V5CJhtC6FhHXDbxnL2"), {
        id: "Bm0JJrHQa7V5CJhtC6FhHXDbxnL2",
        name: "Aryan Wholesalers",
        email: "wholesaler@test.com",
        userType: "wholesaler",
        businessName: "Aryan Bulk Supplies Ltd.",
        phone: "9876543210",
        address: "123 Wholesale Lane, Patna, Bihar",
        gstNumber: "10AAAAA0000A1Z5"
      });

      // 2. Create Shopkeeper User
      await setDoc(doc(db, "users", "uqXB8D1FGJcN1Yb4CGTal4To8b02"), {
        id: "uqXB8D1FGJcN1Yb4CGTal4To8b02",
        name: "Sanjay Gupta",
        email: "shopkeeper@test.com",
        userType: "shopkeeper",
        businessName: "Gupta General Store",
        phone: "9123456789",
        address: "45 Market Road, Patna, Bihar",
        gstNumber: "10BBBBB1111B1Z2"
      });

      // 3. Create Demo Bids (Requests from Shopkeeper)
      // We use a fixed ID "1" for the main demo bid
      await setDoc(doc(db, "bids", "1"), {
        shopkeeperId: "uqXB8D1FGJcN1Yb4CGTal4To8b02",
        shopkeeperName: "Sanjay Gupta",
        shopkeeperBusinessName: "Gupta General Store",
        category: "Grocery",
        items: [
          { name: "Basmati Rice (50kg)", quantity: 10, unit: "bags" },
          { name: "Sugar (50kg)", quantity: 5, unit: "bags" },
          { name: "Refined Oil (15L)", quantity: 20, unit: "tins" }
        ],
        total: 85000,
        status: "active",
        createdAt: new Date().toISOString(),
        deliveryDate: "Tomorrow",
        priority: "high"
      });

      // 4. Create Demo Quotations (from Wholesaler)
      const qRef = doc(collection(db, "quotations"));
      await setDoc(qRef, {
        bidId: "1",
        wholesalerId: "Bm0JJrHQa7V5CJhtC6FhHXDbxnL2",
        wholesalerName: "Aryan Wholesalers",
        wholesalerBusinessName: "Aryan Bulk Supplies Ltd.",
        total: 82400,
        deliveryDays: "1",
        items: [
          { name: "Basmati Rice (50kg)", price: 4200 },
          { name: "Sugar (50kg)", price: 2100 }
        ],
        status: "pending",
        sentAt: new Date().toISOString()
      });

      setSuccess(true);
    } catch (err: any) {
      console.error("Populate Error:", err);
      setError(err.message || "Failed to populate data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Firebase Demo Data Setup</h1>
        <button
          onClick={populateDemoData}
          disabled={loading}
          className="w-full bg-[#E8453C] hover:bg-[#d43d35] text-white py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-3"
        >
          {loading ? <Loader2 className="animate-spin" /> : "Fix & Populate Bid #1"}
        </button>
        {success && <p className="text-green-600 mt-4">Done! Visit /quotations/1</p>}
      </div>
    </div>
  );
}
