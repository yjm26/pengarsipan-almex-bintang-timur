import { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import DashboardOverview from '../../features/dashboard/DashboardOverview';

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen flex bg-[#FAFAFA]">
      {sidebarOpen && <Sidebar sidebarOpen={true} onClose={() => setSidebarOpen(false)} />}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <DashboardOverview />
          </div>
        </main>
      </div>
    </div>
  );
}
