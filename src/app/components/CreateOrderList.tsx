import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Plus, X, Package, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { db } from "../../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

interface OrderItem {
  id: string;
  product: string;
  quantity: string;
  unit: string;
  price: string;
}

export function CreateOrderList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orderTitle, setOrderTitle] = useState("");
  const [category, setCategory] = useState("Groceries & Staples");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [items, setItems] = useState<OrderItem[]>([
    { id: "1", product: "", quantity: "", unit: "kg", price: "" },
  ]);
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const addItem = () => {
    const newItem: OrderItem = {
      id: Date.now().toString(),
      product: "",
      quantity: "",
      unit: "kg",
      price: "",
    };
    setItems([...items, newItem]);
    setFocusedItemId(newItem.id);
  };

  useEffect(() => {
    if (focusedItemId && inputRefs.current[focusedItemId]) {
      inputRefs.current[focusedItemId]?.focus();
    }
  }, [focusedItemId, items.length]);

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

  const handleKeyDown = (
    e: React.KeyboardEvent,
    itemId: string,
    field: keyof OrderItem
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const currentIndex = items.findIndex((item) => item.id === itemId);

      if (field === "product") {
        const quantityInput = document.getElementById(`quantity-${itemId}`) as HTMLInputElement;
        quantityInput?.focus();
      } else if (field === "quantity") {
        const priceInput = document.getElementById(`price-${itemId}`) as HTMLInputElement;
        priceInput?.focus();
      } else if (field === "price") {
        if (currentIndex === items.length - 1) {
          addItem();
        } else {
          const nextItem = items[currentIndex + 1];
          inputRefs.current[nextItem.id]?.focus();
        }
      }
    }
  };

  const filledItems = items.filter(
    (item) => item.product.trim() && item.quantity.trim()
  );
  const isValid = orderTitle.trim() && filledItems.length > 0 && deliveryDate;

  const estimatedTotal = items.reduce((sum, item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.price) || 0;
    return sum + quantity * price;
  }, 0);

  const handlePublishOrder = async () => {
    if (!isValid || !user || isPublishing) return;

    setIsPublishing(true);
    try {
      const bidData = {
        shopkeeperId: user.id,
        shopkeeperName: user.name,
        shopType: user.shopType || "Not Specified",
        title: orderTitle,
        category,
        deliveryDate,
        items: filledItems.map(item => ({
          product: item.product,
          quantity: parseFloat(item.quantity),
          unit: item.unit,
          targetPrice: parseFloat(item.price) || 0
        })),
        status: "active",
        createdAt: new Date().toISOString(),
        totalEstimatedAmount: estimatedTotal
      };

      const docRef = await addDoc(collection(db, "bids"), bidData);
      navigate(`/quotations/${docRef.id}`);
    } catch (error) {
      console.error("Error publishing bid:", error);
      alert("Failed to publish order. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col pb-32">
      <div className="bg-white px-4 py-4 shadow-sm flex items-center gap-4 sticky top-0 z-10">
        <button
          onClick={() => navigate("/dashboard/shopkeeper")}
          className="text-[#1A1A1A] hover:bg-gray-100 p-2 rounded-lg transition-colors"
        >
          <ArrowLeft size={22} />
        </button>
        <h2 className="text-[#1A1A1A] flex-1">Create Order List</h2>
        <span className="text-sm text-gray-600">{filledItems.length} items</span>
      </div>

      <div className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full space-y-4">
        <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
              Order Title <span className="text-[#E8453C]">*</span>
            </label>
            <input
              type="text"
              value={orderTitle}
              onChange={(e) => setOrderTitle(e.target.value)}
              placeholder="e.g., Weekly Grocery Stock"
              className="w-full px-4 py-3 bg-[#F5F5F5] rounded-lg border-2 border-transparent outline-none focus:border-[#E8453C] transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-[#F5F5F5] rounded-lg border-2 border-transparent outline-none focus:border-[#E8453C] transition-colors"
              >
                <option>Groceries & Staples</option>
                <option>Beverages</option>
                <option>Personal Care</option>
                <option>Household Items</option>
                <option>Electronics</option>
                <option>Hardware</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                Delivery Date <span className="text-[#E8453C]">*</span>
              </label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full px-4 py-3 bg-[#F5F5F5] rounded-lg border-2 border-transparent outline-none focus:border-[#E8453C] transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-[#E8453C]" />
              <h3 className="font-medium text-[#1A1A1A]">Items List</h3>
            </div>
            <button
              onClick={addItem}
              className="flex items-center gap-1.5 bg-[#E8453C] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#d43d35] transition-colors"
            >
              <Plus size={16} />
              Add Item
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="bg-[#F5F5F5] rounded-lg p-4 space-y-3 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-7 h-7 bg-white rounded-full text-sm font-medium text-[#6B6B6B]">
                    {index + 1}
                  </span>
                  <input
                    ref={(el) => (inputRefs.current[item.id] = el)}
                    type="text"
                    placeholder="Product name (e.g., Rice, Sugar)"
                    value={item.product}
                    onChange={(e) =>
                      updateItem(item.id, "product", e.target.value)
                    }
                    onKeyDown={(e) => handleKeyDown(e, item.id, "product")}
                    className="flex-1 px-4 py-2.5 bg-white rounded-lg border-2 border-transparent outline-none focus:border-[#E8453C] transition-colors"
                  />
                  {items.length > 1 && (
                    <button
                      onClick={() => removeItem(item.id)}
                      className="flex items-center justify-center w-9 h-9 text-gray-400 hover:text-[#E8453C] hover:bg-white rounded-lg transition-colors"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>

                <div className="flex gap-3 pl-10">
                  <div className="flex gap-2">
                    <input
                      id={`quantity-${item.id}`}
                      type="number"
                      inputMode="decimal"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(item.id, "quantity", e.target.value)
                      }
                      onKeyDown={(e) => handleKeyDown(e, item.id, "quantity")}
                      className="w-24 px-4 py-2.5 bg-white rounded-lg border-2 border-transparent outline-none focus:border-[#E8453C] transition-colors"
                    />
                    <select
                      value={item.unit}
                      onChange={(e) =>
                        updateItem(item.id, "unit", e.target.value)
                      }
                      className="px-3 py-2.5 bg-white rounded-lg border-2 border-transparent outline-none focus:border-[#E8453C] transition-colors"
                    >
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="L">L</option>
                      <option value="ml">ml</option>
                      <option value="pcs">pcs</option>
                      <option value="box">box</option>
                      <option value="pack">pack</option>
                      <option value="dozen">dozen</option>
                    </select>
                  </div>
                  <div className="flex-1 relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      id={`price-${item.id}`}
                      type="number"
                      inputMode="decimal"
                      placeholder="Price per unit"
                      value={item.price}
                      onChange={(e) =>
                        updateItem(item.id, "price", e.target.value)
                      }
                      onKeyDown={(e) => handleKeyDown(e, item.id, "price")}
                      className="w-full pl-9 pr-4 py-2.5 bg-white rounded-lg border-2 border-transparent outline-none focus:border-[#E8453C] transition-colors"
                    />
                  </div>
                </div>
                {item.quantity && item.price && (
                  <div className="pl-10 text-sm text-gray-600">
                    Subtotal: ₹{(parseFloat(item.quantity) * parseFloat(item.price)).toLocaleString("en-IN")}
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={addItem}
            className="w-full mt-3 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-[#E8453C] hover:text-[#E8453C] transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Add Another Item
          </button>
        </div>

        {!isValid && (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <span className="font-medium">Almost there!</span> Fill in the order title,
              at least one item, and delivery date to continue.
            </p>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 px-4 py-4 shadow-lg">
        <div className="max-w-2xl mx-auto space-y-3">
          {estimatedTotal > 0 && (
            <div className="flex items-center justify-between px-2">
              <span className="text-sm text-gray-600">Estimated Total</span>
              <span className="text-xl font-medium text-[#1A1A1A]">
                ₹{estimatedTotal.toLocaleString("en-IN")}
              </span>
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/dashboard/shopkeeper")}
              className="px-6 py-3.5 border-2 border-gray-300 rounded-xl font-medium text-[#1A1A1A] hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={!isValid || isPublishing}
              onClick={handlePublishOrder}
              className={`flex-1 py-3.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                isValid && !isPublishing
                  ? "bg-[#E8453C] text-white shadow-lg hover:bg-[#d43d35] active:scale-[0.98]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isPublishing ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Publishing...
                </>
              ) : (
                <>Publish Order ({filledItems.length} item{filledItems.length !== 1 ? 's' : ''})</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
