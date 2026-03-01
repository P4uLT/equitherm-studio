// src/App.tsx
import { useEffect } from 'react';
import { useStore } from './store/useStore';
import { loadFromURL } from './config/storage';
import { Header } from './components/Header';
import { ControlsCard } from './components/ControlsCard';
import { HeatingChart } from './components/Chart';
import { PIDPanel } from './components/PIDPanel';
import { TooltipProvider } from './components/ui/tooltip';
import './index.css';

function App() {
  const loadConfig = useStore(s => s.loadConfig);

  // Load config from URL on mount
  useEffect(() => {
    const urlConfig = loadFromURL();
    if (urlConfig) {
      loadConfig(urlConfig);
    }
  }, [loadConfig]);

  return (
    <TooltipProvider>
      <div className="atmosphere" />
      <div className="min-h-screen max-w-[1600px] mx-auto px-6 py-4">
        <Header />
        <main className="grid grid-cols-[minmax(240px,280px)_1fr_minmax(240px,280px)] grid-rows-[minmax(0,1fr)] gap-4 min-h-0 max-[1100px]:grid-cols-[minmax(240px,280px)_1fr] max-[1100px]:grid-rows-[auto_auto]">
          <div className="col-start-1 row-start-1 max-[1100px]:row-span-2"><ControlsCard /></div>
          <div className="col-start-2 row-start-1 min-h-[300px]"><HeatingChart /></div>
          <div className="col-start-3 row-start-1 max-[1100px]:col-start-2 max-[1100px]:row-start-2"><PIDPanel /></div>
        </main>
      </div>
    </TooltipProvider>
  );
}

export default App;
