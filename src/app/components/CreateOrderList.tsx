import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../context/AuthContext";

interface OrderItem {
  id: string;
  product: string;
  quantity: string;
  unit: string;
  price: number;
}

export function CreateOrderList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orderTitle, setOrderTitle] = useState("");
  const [category, setCategory] = useState("Groceries & Staples");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<OrderItem[]>([
    { id: "1", product: "", quantity: "", unit: "kg", price: 0 },
  ]);

  const addItem = () => {
    const newItem: OrderItem = {
      id: Date.now().toString(),
      product: "",
      quantity: "",
      unit: "kg",
      price: 0,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof OrderItem, value: string) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const total = items.reduce((sum, item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.price.toString()) || 0;
    return sum + quantity * price;
  }, 0);

  const canPublish = total >= 10000 && orderTitle.trim().length > 0 && !loading;

  const handlePublish = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const newBid = {
        title: orderTitle,
        category,
        deliveryDate,
        items,
        total,
        status: "active",
        createdAt: new Date().toISOString(),
        shopkeeperId: user.id,
        shopkeeperName: user.name,
        shopkeeperBusinessName: user.businessName || "",
      };
      
      const docRef = await addDoc(collection(db, "bids"), newBid);
      navigate(`/quotations/${docRef.id}`);
    } catch (error) {
      console.error("Error publishing bid:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm flex items-center gap-4">
        <button onClick={() => navigate("/dashboard/shopkeeper")} className="text-[#1A1A1A]">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-[#1A1A1A]">Create Order List</h2>
      </div>

      {/* Form Content */}
      <div className="flex-1 px-4 py-6 space-y-4 pb-32">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="mb-4">
            <label className="block text-[#1A1A1A] mb-2 font-medium">
              Order Title <span className="text-[#E8453C]">*</span>
            </label>
            <input
              type="text"
              value={orderTitle}
              onChange={(e) => setOrderTitle(e.target.value)}
              placeholder="e.g., Weekly Grocery Stock"
              className="w-full px-4 py-3 bg-[#F5F5F5] rounded-lg border border-transparent outline-none focus:ring-2 focus:ring-[#E8453C]/20 focus:border-[#E8453C] transition-colors"
            />
          </div>
          <div>
            <label className="block text-[#1A1A1A] mb-2 font-medium">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-[#F5F5F5] rounded-lg border border-transparent outline-none focus:ring-2 focus:ring-[#E8453C]/20 focus:border-[#E8453C] transition-colors"
            >
              <option>Groceries & Staples</option>
              <option>Beverages</option>
              <option>Personal Care</option>
              <option>Household Items</option>
              <option>Snacks & Confectionery</option>
              <option>Dairy Products</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#1A1A1A] font-medium">Items List</h3>
            <button
              onClick={addItem}
              className="flex items-center gap-2 text-[#E8453C] text-sm font-medium"
            >
              <Plus size={18} />
              Add Item
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="border border-gray-200 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#6B6B6B] font-medium">
                    Item #{index + 1}
                  </span>
                  {items.length > 1 && (
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-[#E8453C]"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Product name"
                  value={item.product}
                  onChange={(e) => updateItem(item.id, "product", e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F5F5F5] rounded-lg border border-transparent outline-none focus:ring-2 focus:ring-[#E8453C]/20"
                />

                <div className="flex gap-3">
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-[#F5F5F5] rounded-lg border border-transparent outline-none focus:ring-2 focus:ring-[#E8453C]/20"
                  />
                  <select
                    value={item.unit}
                    onChange={(e) => updateItem(item.id, "unit", e.target.value)}
                    className="w-24 px-4 py-2.5 bg-[#F5F5F5] rounded-lg border border-transparent outline-none focus:ring-2 focus:ring-[#E8453C]/20"
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="L">L</option>
                    <option value="ml">ml</option>
                    <option value="pcs">pcs</option>
                    <option value="box">box</option>
                    <option value="dozen">dozen</option>
                  </select>
                </div>

                <input
                  type="number"
                  placeholder="Estimated price per unit (₹)"
                  value={item.price || ""}
                  onChange={(e) => updateItem(item.id, "price", e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F5F5F5] rounded-lg border border-transparent outline-none focus:ring-2 focus:ring-[#E8453C]/20"
                />
                {item.product && item.quantity && item.price > 0 && (
                  <p className="text-sm text-green-600 font-medium">
                    Subtotal: ₹{(parseFloat(item.quantity) * item.price).toLocaleString("en-IN")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <label className="block text-[#1A1A1A] mb-2 font-medium">Delivery Date</label>
          <input
            type="date"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="w-full px-4 py-3 bg-[#F5F5F5] rounded-lg border border-transparent outline-none focus:ring-2 focus:ring-[#E8453C]/20"
          />
        </div>
      </div>

      {/* Bottom Total and Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-md mx-auto space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B6B6B]">Estimated Total</p>
              <p className="text-2xl text-[#1A1A1A] font-bold">
                ₹{total.toLocaleString("en-IN")}
              </p>
            </div>
            {!canPublish && (
              <p className="text-xs text-[#6B6B6B] max-w-[160px] text-right">
                {!orderTitle.trim()
                  ? "Add an order title to continue"
                  : "Minimum ₹10,000 required to publish"}
              </p>
            )}
          </div>
          <button
            disabled={!canPublish}
            onClick={handlePublish}
            className={`w-full py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              canPublish
                ? "bg-[#E8453C] text-white shadow-lg hover:bg-[#d43d35] active:scale-[0.98]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Publishing...
              </>
            ) : (
              "Publish Bid Request"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
