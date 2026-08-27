import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Services from "./components/Services";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import MyBookings from "./components/MyBookings";
import ProviderDashboard from "./components/ProviderDashboard";
import AdminDashboard from "./components/AdminDashboard";

function Home() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <>
      <Hero
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      <Services searchTerm={searchTerm} />
    </>
  );
}

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/dashboard" element={<ProviderDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </div>
  );
}

export default App;
