import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import api from "../ApiClient/api"

export default function ProtectedRoute() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        await api.get("/api/auth/get-user");
        setAuthenticated(true);
      } catch {
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  if (loading) {
    return <p>Checking login...</p>;
  }

  return authenticated ? <Outlet /> : <Navigate to="/signin" replace />;
}
