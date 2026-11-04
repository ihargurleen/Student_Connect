
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Signin() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();
      console.log("Login message:", data.message);

      if (!response.ok) {
        throw new Error(data.message || "Signin failed.");
      }

      const userResponse = await fetch(
        "http://localhost:5000/api/auth/get-user",
        {
          method: "GET",
          credentials: "include",
        }
      );

      const userData = await userResponse.json();
           console.log("LOGIN RESPONSE:", data);
           console.log("GET USER RESPONSE:", userData);
      if (!userResponse.ok) {
        throw new Error(
          userData.message || "User verification failed."
        );
      }

      const loggedInUser = {
        id: userData._id || data.user?.id,
        userName: userData.userName || data.user?.userName,
        email: userData.email || data.user?.email,
        role: userData.role || data.user?.role,
      };

      if (!loggedInUser.role) {
        throw new Error("User role not found. Please contact Admin.");
      }

      localStorage.setItem("user", JSON.stringify(loggedInUser));

      setMessage(`Welcome, ${loggedInUser.userName}!`);

      navigate("/");
    } catch (error) {
      setMessage(error.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Welcome Back</h1>
        <p>Sign in to your campus account.</p>

        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>

        {message && <p role="status">{message}</p>}

        <p>
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </form>
    </div>
  );
}
