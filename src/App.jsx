import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop.jsx";
import Home from "./pages/Home.jsx";
import Contact from "./pages/Contact.jsx";
import Location from "./pages/Location.jsx";
import Login from "./pages/Login.jsx";
import Author from "./pages/Author.jsx";
import ManagerDashboard from "./pages/ManagerDashboard.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/manager" element={<ManagerDashboard />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/location" element={<Location />} />
        <Route path="/login" element={<Login />} />
        <Route path="/author" element={<Author />} />
      </Routes>
    </BrowserRouter>
  );
}
