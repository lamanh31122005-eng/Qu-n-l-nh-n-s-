import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPassword";
import Dashboard from "@/pages/Dashboard";
import EmployeeDashboard from "@/pages/EmployeeDashboard";
import Departments from "@/pages/Departments";
import Recruitment from "@/pages/Recruitment";
import Contracts from "@/pages/Contracts";
import Attendance from "@/pages/Attendance";
import Leaves from "@/pages/Leaves";
import Overtime from "@/pages/Overtime";
import Payroll from "@/pages/Payroll";
import KPI from "@/pages/KPI";
import Finance from "@/pages/Finance";
import Reports from "@/pages/Reports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const EmployeeProfileRedirect = () => <Navigate to="/employees" replace />;

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPassword />} />
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employees" element={<EmployeeDashboard />} />
        <Route path="/employees/:employeeId" element={<Navigate to="/employees" replace />} />
        <Route path="/departments" element={<Departments />} />
        <Route path="/employee-profiles" element={<Navigate to="/employees" replace />} />
        <Route path="/employee-profiles/:employeeId" element={<EmployeeProfileRedirect />} />
        <Route path="/recruitment" element={<Recruitment />} />
        <Route path="/contracts" element={<Contracts />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/leaves" element={<Leaves />} />
        <Route path="/overtime" element={<Overtime />} />
        <Route path="/payroll" element={<Payroll />} />
        <Route path="/kpi" element={<KPI />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/reports" element={<Reports />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
