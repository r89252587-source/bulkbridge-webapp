import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Bell,
  Package,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock,
  Trash2,
} from "lucide-react";

interface Notification {
  id: string;
  type: "bid" | "order" | "quote" | "system";
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionRoute?: string;
}

export function Notifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "quote",
      title: "New Quotation Received",
      message: "Shree Traders sent a quotation of ₹23,450 for your Weekly Grocery bid.",
      time: "5 min ago",
      read: false,
      actionRoute: "/quotations/1",
    },
    {
      id: "2",
      type: "quote",
      title: "New Quotation Received",
      message: "Gupta Wholesale sent a quotation of ₹24,800 for your Weekly Grocery bid.",
      time: "12 min ago",
      read: false,
      actionRoute: "/quotations/1",
    },
    {
      id: "3",
      type: "order",
      title: "Order Out for Delivery",
      message: "Your order ORD-2024-001 from Shree Traders is out for delivery.",
      time: "2 hours ago",
      read: false,
      actionRoute: "/order/ORD-2024-001",
    },
    {
      id: "4",
      type: "bid",
      title: "Bid Expiring Soon",
      message: "Your bid for Personal Care items expires in 1 hour. Check quotations now.",
      time: "3 hours ago",
      read: true,
      actionRoute: "/quotations/2",
    },
    {
      id: "5",
      type: "order",
      title: "Order Confirmed",
      message: "Your order ORD-2024-002 has been confirmed by Modern Wholesale Hub.",
      time: "Yesterday",
      read: true,
      actionRoute: "/order/ORD-2024-002",
    },
    {
      id: "6",
      type: "system",
      title: "Profile Incomplete",
      message: "Add your GST number and business name to get verified status.",
      time: "2 days ago",
      read: true,
      actionRoute: "/profile/shopkeeper",
    },
    {
      id: "7",
      type: "quote",
      title: "Bid Received 3 Quotes",
      message: "Your Beverages bid has received 3 quotations. Compare now to get the best price.",
      time: "2 days ago",
      read: true,
      actionRoute: "/quotations/3",
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleNotificationClick = (notif: Notification) => {
    markRead(notif.id);
    if (notif.actionRoute) {
      navigate(notif.actionRoute);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "bid":
        return <TrendingUp className="w-5 h-5 text-orange-600" />;
      case "order":
        return <Package className="w-5 h-5 text-blue-600" />;
      case "quote":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "system":
        return <AlertCircle className="w-5 h-5 text-[#E8453C]" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case "bid":
        return "bg-orange-100";
      case "order":
        return "bg-blue-100";
      case "quote":
        return "bg-green-100";
      case "system":
        return "bg-red-100";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)}>
              <ArrowLeft className="w-6 h-6 text-[#1A1A1A]" />
            </button>
            <div>
              <h1 className="text-[20px] font-bold text-[#1A1A1A]">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-[12px] text-[#E8453C]">{unreadCount} unread</p>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-[14px] text-[#E8453C] font-medium"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-2">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-[16px] p-12 text-center shadow-sm mt-4">
            <Bell className="w-14 h-14 text-gray-200 mx-auto mb-4" />
            <h3 className="font-bold text-[#1A1A1A] mb-1">All caught up!</h3>
            <p className="text-[14px] text-gray-500">
              You have no notifications right now.
            </p>
          </div>
        ) : (
          <>
            {/* Unread section */}
            {notifications.filter((n) => !n.read).length > 0 && (
              <div>
                <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide px-1 mb-2">
                  New
                </p>
                {notifications
                  .filter((n) => !n.read)
                  .map((notif) => (
                    <NotifCard
                      key={notif.id}
                      notif={notif}
                      onTap={handleNotificationClick}
                      onDelete={deleteNotification}
                      getIcon={getIcon}
                      getIconBg={getIconBg}
                    />
                  ))}
              </div>
            )}

            {/* Read section */}
            {notifications.filter((n) => n.read).length > 0 && (
              <div className="pt-2">
                <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide px-1 mb-2">
                  Earlier
                </p>
                {notifications
                  .filter((n) => n.read)
                  .map((notif) => (
                    <NotifCard
                      key={notif.id}
                      notif={notif}
                      onTap={handleNotificationClick}
                      onDelete={deleteNotification}
                      getIcon={getIcon}
                      getIconBg={getIconBg}
                    />
                  ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function NotifCard({
  notif,
  onTap,
  onDelete,
  getIcon,
  getIconBg,
}: {
  notif: Notification;
  onTap: (n: Notification) => void;
  onDelete: (id: string) => void;
  getIcon: (type: string) => JSX.Element;
  getIconBg: (type: string) => string;
}) {
  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-[14px] mb-2 cursor-pointer transition-colors ${
        notif.read ? "bg-white" : "bg-[#E8453C]/5 border border-[#E8453C]/15"
      }`}
      onClick={() => onTap(notif)}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getIconBg(
          notif.type
        )}`}
      >
        {getIcon(notif.type)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4
            className={`text-[14px] leading-tight ${
              notif.read ? "text-[#1A1A1A]" : "text-[#1A1A1A] font-bold"
            }`}
          >
            {notif.title}
          </h4>
          {!notif.read && (
            <div className="w-2.5 h-2.5 bg-[#E8453C] rounded-full flex-shrink-0 mt-1" />
          )}
        </div>
        <p className="text-[13px] text-gray-500 mt-0.5 leading-snug">{notif.message}</p>
        <div className="flex items-center gap-2 mt-2">
          <Clock className="w-3 h-3 text-gray-400" />
          <span className="text-[11px] text-gray-400">{notif.time}</span>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(notif.id);
        }}
        className="text-gray-300 hover:text-[#E8453C] transition-colors flex-shrink-0 mt-0.5"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
