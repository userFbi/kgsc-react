import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop.jsx";
import Home from "./pages/Home.jsx";
import Contact from "./pages/Contact.jsx";
import Location from "./pages/Location.jsx";
import Login from "./pages/Login.jsx";
import Author from "./pages/Author.jsx";
import ManagerDashboard from "./manager/Dashboard.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import ManagerLayout from "./manager/ManagerLayout.jsx";
import Dashboard from "./manager/Dashboard.jsx";
import ViewMembers from "./manager/ViewMembers.jsx";
import AddMember from "./manager/AddMember.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/manager" element={<ManagerLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="members" element={<ViewMembers />} />
          <Route path="add-member" element={<AddMember />} />
        </Route>
        <Route path="/contact" element={<Contact />} />
        <Route path="/location" element={<Location />} />
        <Route path="/login" element={<Login />} />
        <Route path="/author" element={<Author />} />
      </Routes>
    </BrowserRouter>
  );
}
