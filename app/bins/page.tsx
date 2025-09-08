import { BinTracker } from '@/components/bins/bin-tracker';
import { Trash2 } from 'lucide-react';

export default function BinsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Trash2 className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-mono font-bold text-foreground">
              Bin Collection Tracker
            </h1>
          </div>
          <p className="text-sm text-muted-foreground font-mono">
            Glasgow City Council refuse and recycling collection schedule
          </p>
        </div>
        
        <BinTracker />
      </div>
    </div>
  );
}