import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import axios from "axios";
import AdminDashboard from "../components/AdminDashboard";
import ClientDashboard from "../components/ClientDashboard";

const Dashboard1 = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in, otherwise redirect to signin
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchUserRole = async () => {
      const token = localStorage.getItem("token"); // ✅ Fetch token inside the function

      if (!token) {
        console.log("No token found, redirecting...");
        navigate("/signin");
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:3000/api/v1/users/user",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        const role = response.data.user.role;
        setUserRole(role);
      } catch (error) {
        console.log("Error fetching user role:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [navigate]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={userRole}>
      {userRole === "admin" ? <AdminDashboard /> : <ClientDashboard />}
    </DashboardLayout>
  );
};

export default Dashboard1;
