import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import Contact from "./pages/Contact.jsx";
import Location from "./pages/Location.jsx";
import Login from "./pages/Login.jsx";
import Author from "./pages/Author.jsx";
import Profile from "./pages/Profile";
import UserDashboard from "./pages/UserDashboard.jsx";
import CompleteProfile from "./pages/CompleteProfile";

// Manager Routes
import ManagerLayout from "./manager/ManagerLayout.jsx";
import Dashboard from "./manager/Dashboard.jsx";
import ViewMembers from "./manager/ViewMembers.jsx";
import AddMember from "./manager/AddMember.jsx";
import InsuranceMembers from "./manager/InsuranceMembers.jsx";
// Admin Routes
import AdminLayout from "./admin/AdminLayout.jsx";
import AdminDashboard from "./admin/Dashboard.jsx";
import Reports from "./admin/Reports.jsx";
import AddTransaction from "./admin/AddTransaction.jsx";
import AdminMessages from "./admin/AdminMessages.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/location" element={<Location />} />
        <Route path="/login" element={<Login />} />
        <Route path="/author" element={<Author />} />

        <Route
          path="/complete-profile"
          element={
            <ProtectedRoute>
              <CompleteProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["member"]}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        {/* Manager Routes */}
        <Route
          path="/manager"
          element={
            <ProtectedRoute allowedRoles={["manager", "admin"]}>
              <ManagerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="members" element={<ViewMembers />} />
          <Route path="add-member" element={<AddMember />} />
          <Route path="insurance" element={<InsuranceMembers />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="reports" element={<Reports />} />
          <Route path="add-transaction" element={<AddTransaction />} />
          <Route path="messages" element={<AdminMessages />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
