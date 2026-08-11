import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LogoIntro } from './components/common/LogoIntro';
import { AppLayout } from './components/layout/AppLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { CustomerDetail } from './pages/CustomerDetail';
import { Products } from './pages/Products';
import { StockMovements } from './pages/StockMovements';
import { Challans } from './pages/Challans';
import { ChallanDetail } from './pages/ChallanDetail';
import { UsersPage } from './pages/Users';
import { Reports } from './pages/Reports';
import { ApprovalsPage } from './pages/Approvals';

import { LandingPage } from './pages/LandingPage/LandingPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--primary)', color: '#FFFFFF' }}>
        <div>Loading ProcessifyERP...</div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <LogoIntro />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />

          {/* Authenticated ERP/CRM Application Routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/:id" element={<CustomerDetail />} />
            <Route path="/products" element={<Products />} />
            <Route path="/stock-movements" element={<StockMovements />} />
            <Route path="/challans" element={<Challans />} />
            <Route path="/challans/:id" element={<ChallanDetail />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/approvals" element={<ApprovalsPage />} />
            <Route path="/users" element={<UsersPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};
