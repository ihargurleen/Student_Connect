
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/auth/get-user",
          {
            method: "GET",
            credentials: "include",
          }
        );

        setAuthenticated(response.ok);
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
