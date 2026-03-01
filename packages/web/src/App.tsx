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
      <div className="min-h-screen max-w-[1600px] mx-auto px-6 py-4 max-[600px]:px-3.5 max-[600px]:py-2.5">
        <Header />
        <main className="grid grid-cols-[minmax(240px,280px)_1fr_minmax(240px,280px)] grid-rows-[minmax(0,1fr)] gap-4 min-h-0 max-[1200px]:grid-cols-[minmax(280px,320px)_1fr] max-[900px]:grid-cols-1 max-[900px]:grid-rows-[auto_auto_auto]">
          <div className="col-start-1 row-start-1 max-[1200px]:row-span-2 max-[900px]:col-start-1 max-[900px]:row-start-1 max-[900px]:row-span-1"><ControlsCard /></div>
          <div className="col-start-2 row-start-1 min-h-[300px] max-[900px]:col-start-1 max-[900px]:row-start-2"><HeatingChart /></div>
          <div className="col-start-3 row-start-1 max-[1200px]:col-start-2 max-[1200px]:row-start-2 max-[900px]:col-start-1 max-[900px]:row-start-3"><PIDPanel /></div>
        </main>
      </div>
    </TooltipProvider>
  );
}

export default App;
