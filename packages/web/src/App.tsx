// src/App.tsx
import { useEffect } from 'react';
import { useStore } from './store/useStore';
import { loadFromURL } from './config/storage';
import { Header } from './components/Header';
import { SidePanel } from './components/SidePanel';
import { HeatingChart } from './components/Chart';
import { TooltipProvider } from './components/ui/tooltip';
import './index.css';

function App() {
  const loadConfig = useStore(s => s.loadConfig);

  useEffect(() => {
    const urlConfig = loadFromURL();
    if (urlConfig) loadConfig(urlConfig);
  }, [loadConfig]);

  return (
    <TooltipProvider>
      <div className="atmosphere" />
      <div className="min-h-screen max-w-[1600px] mx-auto px-3.5 py-2.5 sm:px-6 sm:py-4">
        <Header />
        <main className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(280px,320px)_1fr]">
          <SidePanel />
          <div className="min-h-[300px] md:min-h-0">
            <HeatingChart />
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}

export default App;
