import './styles/global/App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { DonorImpactPage } from './pages/DonorImpactPage';
import { LoginPage } from './pages/LoginPage';
import { PortalPage } from './pages/PortalPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/impact" element={<DonorImpactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/portal" element={<PortalPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;