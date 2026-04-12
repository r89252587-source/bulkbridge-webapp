import { createBrowserRouter } from "react-router";
import { RootRedirect } from "./components/RootRedirect";
import { Welcome } from "./components/Welcome";
import { Login } from "./components/Login";
import { Signup } from "./components/Signup";
import { SelectUserType } from "./components/SelectUserType";
import { ShopkeeperDashboard } from "./components/ShopkeeperDashboard";
import { ShopkeeperOrders } from "./components/ShopkeeperOrders";
import { CreateOrderList } from "./components/CreateOrderList";
import { QuotationsComparison } from "./components/QuotationsComparison";
import { WholesalerDashboard } from "./components/WholesalerDashboard";
import { WholesalerBids } from "./components/WholesalerBids";
import { WholesalerOrders } from "./components/WholesalerOrders";
import { OrderDetail } from "./components/OrderDetail";
import { ShopkeeperProfile } from "./components/ShopkeeperProfile";
import { WholesalerProfile } from "./components/WholesalerProfile";
import { SendQuotation } from "./components/SendQuotation";
import { Notifications } from "./components/Notifications";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { QuotationsList } from "./components/QuotationsList";
import { SelectShopType } from "./components/SelectShopType";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootRedirect,
  },
  {
    path: "/welcome",
    Component: Welcome,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/signup",
    Component: Signup,
  },
  {
    path: "/select-user-type",
    Component: SelectUserType,
  },
  {
    path: "/select-shop-type",
    Component: SelectShopType,
  },

  // ── Shopkeeper routes ──────────────────────────────────
  {
    path: "/quotations",
    element: (
      <ProtectedRoute requiredUserType="shopkeeper">
        <QuotationsList />
      </ProtectedRoute>
    ),
  },
  {
    path: "/quotations/",
    element: (
      <ProtectedRoute requiredUserType="shopkeeper">
        <QuotationsList />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard/shopkeeper",
    element: (
      <ProtectedRoute requiredUserType="shopkeeper">
        <ShopkeeperDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/orders/shopkeeper",
    element: (
      <ProtectedRoute requiredUserType="shopkeeper">
        <ShopkeeperOrders />
      </ProtectedRoute>
    ),
  },
  {
    path: "/create-order",
    element: (
      <ProtectedRoute requiredUserType="shopkeeper">
        <CreateOrderList />
      </ProtectedRoute>
    ),
  },
  {
    path: "/quotations/:orderId",
    element: (
      <ProtectedRoute requiredUserType="shopkeeper">
        <QuotationsComparison />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile/shopkeeper",
    element: (
      <ProtectedRoute requiredUserType="shopkeeper">
        <ShopkeeperProfile />
      </ProtectedRoute>
    ),
  },

  // ── Wholesaler routes ──────────────────────────────────
  {
    path: "/wholesaler",
    element: (
      <ProtectedRoute requiredUserType="wholesaler">
        <WholesalerDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/wholesaler/bids",
    element: (
      <ProtectedRoute requiredUserType="wholesaler">
        <WholesalerBids />
      </ProtectedRoute>
    ),
  },
  {
    path: "/wholesaler/orders",
    element: (
      <ProtectedRoute requiredUserType="wholesaler">
        <WholesalerOrders />
      </ProtectedRoute>
    ),
  },
  {
    path: "/wholesaler/send-quotation/:bidId",
    element: (
      <ProtectedRoute requiredUserType="wholesaler">
        <SendQuotation />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile/wholesaler",
    element: (
      <ProtectedRoute requiredUserType="wholesaler">
        <WholesalerProfile />
      </ProtectedRoute>
    ),
  },

  // ── Shared routes ──────────────────────────────────────
  {
    path: "/order/:orderId",
    element: (
      <ProtectedRoute>
        <OrderDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: "/notifications",
    element: (
      <ProtectedRoute>
        <Notifications />
      </ProtectedRoute>
    ),
  },
]);
