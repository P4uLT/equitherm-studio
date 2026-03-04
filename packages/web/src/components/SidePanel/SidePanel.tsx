// src/components/SidePanel/SidePanel.tsx
import { ControlsCard } from '../ControlsCard';
import { PIDPanel } from '../PIDPanel';
import { PresetsPanel } from './PresetsPanel';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function SidePanel() {
  return (
    <Card className="p-0 overflow-hidden flex flex-col max-h-[70vh] md:max-h-none">
      <Tabs defaultValue="curve" className="flex flex-col flex-1 min-h-0">
        <TabsList className="w-full rounded-none border-b border-border bg-secondary/50 shrink-0">
          <TabsTrigger value="curve" className="flex-1 text-xs">Curve</TabsTrigger>
          <TabsTrigger value="pid" className="flex-1 text-xs">PID</TabsTrigger>
          <TabsTrigger value="presets" className="flex-1 text-xs">Presets</TabsTrigger>
        </TabsList>
        <TabsContent value="curve" className="m-0 overflow-y-auto">
          <ControlsCard />
        </TabsContent>
        <TabsContent value="pid" className="m-0 overflow-y-auto">
          <PIDPanel />
        </TabsContent>
        <TabsContent value="presets" className="m-0 overflow-y-auto">
          <PresetsPanel />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
