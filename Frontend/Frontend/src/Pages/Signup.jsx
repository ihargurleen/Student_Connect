import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../ApiClient/api";

export default function Signup() {
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    role: "Student",
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
      const response = await api.post(
        "/api/auth/signup",
        formData
      );

      setMessage(response.data.message || "Signup successful!");

      setTimeout(() => {
        navigate("/signin");
      }, 1000);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Unable to create account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Create Account</h1>
        <p>Join your campus community.</p>

        <label htmlFor="userName">Username</label>
        <input
          id="userName"
          name="userName"
          type="text"
          placeholder="Enter your username"
          value={formData.userName}
          onChange={handleChange}
          required
        />

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
          placeholder="At least 6 characters"
          minLength={6}
          value={formData.password}
          onChange={handleChange}
          required
        />

        <label htmlFor="role">Role</label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
        >
          <option value="Student">Student</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        {message && <p role="status">{message}</p>}

        <p>
          Already have an account? <Link to="/signin">Sign In</Link>
        </p>
      </form>
    </div>
  );
}
