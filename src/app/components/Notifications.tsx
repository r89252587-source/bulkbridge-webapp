import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Bell,
  Package,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../context/AuthContext";

interface Notification {
  id: string;
  type: "bid" | "order" | "quote" | "system";
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  actionRoute?: string;
  userId: string;
}

export function Notifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.id),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs: Notification[] = [];
      snapshot.forEach((docSnap) => {
        notifs.push({ id: docSnap.id, ...docSnap.data() } as Notification);
      });
      setNotifications(notifs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching notifications:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    await Promise.all(
      unread.map((n) => updateDoc(doc(db, "notifications", n.id), { read: true }))
    );
  };

  const markRead = async (id: string) => {
    await updateDoc(doc(db, "notifications", id), { read: true });
  };

  const deleteNotification = async (id: string) => {
    await deleteDoc(doc(db, "notifications", id));
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.read) await markRead(notif.id);
    if (notif.actionRoute) navigate(notif.actionRoute);
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      const diffMs = Date.now() - d.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return "Just now";
      if (diffMin < 60) return `${diffMin} min ago`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;
      const diffDay = Math.floor(diffHr / 24);
      if (diffDay === 1) return "Yesterday";
      return `${diffDay} days ago`;
    } catch {
      return dateStr;
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
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#6B6B6B]">
            <Loader2 className="animate-spin mb-3" size={36} />
            <p className="font-medium">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
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
                      formatTime={formatTime}
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
                      formatTime={formatTime}
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
  formatTime,
}: {
  notif: Notification;
  onTap: (n: Notification) => void;
  onDelete: (id: string) => void;
  getIcon: (type: string) => JSX.Element;
  getIconBg: (type: string) => string;
  formatTime: (dateStr: string) => string;
}) {
  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-[14px] mb-2 cursor-pointer transition-colors ${
        notif.read ? "bg-white" : "bg-[#E8453C]/5 border border-[#E8453C]/15"
      }`}
      onClick={() => onTap(notif)}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getIconBg(notif.type)}`}
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
          <span className="text-[11px] text-gray-400">{formatTime(notif.createdAt)}</span>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(notif.id);
        }}
        className="text-gray-300 hover:text-[#E8453C] transition-colors flex-shrink-0 mt-0.5"
      >
        ✕
      </button>
    </div>
  );
}
