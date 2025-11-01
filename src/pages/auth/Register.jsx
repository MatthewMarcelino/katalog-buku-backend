import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import bgImage from "../../assets/background5.png"; // gambar kanan
import logo from "../../assets/logo.png"; // logo kiri atas

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // handle input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.type === "text" ? "name" : e.target.type]: e.target.value,
    });
  };

  // handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      navigate("/login"); // redirect ke login
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Terjadi kesalahan, coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Side */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Navbar */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-gray-200">
          {/* Logo bulat */}
          <img
            src={logo}
            alt="Logo"
            className="w-8 h-8 rounded-full object-cover" // rounded-full tetap dipakai jika ingin bentuk lingkaran
          />

          {/* Tombol Login */}
          <button
            onClick={() => navigate("/login")}
            className="px-5 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Log in
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center px-8 lg:px-24 max-w-lg mx-auto">
          <h1 className="text-3xl md:text-3xl font-extrabold text-gray-900">
            Explore the library <br /> to experience the beauty of reading
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Daftar dan mulai perjalanan membaca Anda hari ini! 
          </p>

          {/* Form Register */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-gray-400 focus:outline-none"
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-gray-400 focus:outline-none"
            />
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-gray-400 focus:outline-none"
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition disabled:opacity-50"
            >
              {loading ? "Loading..." : "Sign up"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-sm text-gray-500">AND</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div> 

          {/* Terms */}
          <p className="text-xs text-gray-500 mt-6">
            By signing up, you agree to the{" "}
            <a href="#" className="underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline">
              Privacy Policy
            </a>
            , including cookie use.
          </p>
        </div>
      </div>

      {/* Right Side - Image */}
      <div
        className="hidden lg:block w-1/2 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      ></div>
    </div>
  );
};

export default Register;
