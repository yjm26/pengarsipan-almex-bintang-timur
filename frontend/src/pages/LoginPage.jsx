import { useState } from 'react';
import { BrandPanel } from '../components/BrandPanel';
import { LoginForm } from '../components/LoginForm';
import DashboardPage from './DashboardPage';

export default function LoginPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (isLoggedIn) {
    return <DashboardPage onLogout={() => setIsLoggedIn(false)} />;
  }

  return (
    <div className="min-h-screen flex bg-white">
      <BrandPanel />
      <LoginForm onLogin={() => setIsLoggedIn(true)} />
    </div>
  );
}
