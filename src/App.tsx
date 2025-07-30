
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AccountDetails from "./pages/AccountDetails";
import PublicationDetails from "./pages/PublicationDetails";
import Benchmark from "./pages/Benchmark";
import SharedSummary from "./pages/SharedSummary";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { FeedbackButton } from "./components/FeedbackButton";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import EmailVerification from "./components/EmailVerification";
import ForgotPassword from "./components/ForgotPassword";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/account/:accountId/summary/:summaryId" element={<SharedSummary />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/account/:id" element={
              <ProtectedRoute>
                <AccountDetails />
              </ProtectedRoute>
            } />
            <Route path="/account/:id/publication/:publicationId" element={
              <ProtectedRoute>
                <PublicationDetails />
              </ProtectedRoute>
            } />
            <Route path="/benchmark" element={
              <ProtectedRoute>
                <Benchmark />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <FeedbackButton />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
