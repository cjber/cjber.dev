'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BinCard } from './bin-card';
import { BinCalendar } from './bin-calendar';
import { RefreshCw, MapPin, Calendar, Grid3x3, List, Download } from 'lucide-react';
import { generateICS, downloadICS } from '@/lib/generate-ics';

interface BinData {
  type: string;
  color: string;
  dates: string[];
  frequency: string;
  purpose?: string;
  description?: string;
}

interface BinResponse {
  bins: BinData[];
  year: number;
  address: string;
}

export function BinTracker() {
  const [data, setData] = useState<BinResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  const fetchBinData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/bins');
      if (!response.ok) throw new Error('Failed to fetch bin data');
      
      const result = await response.json();
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleExportCalendar = () => {
    if (!data) return;
    
    const icsContent = generateICS(data.bins, data.year);
    downloadICS(icsContent, `bin-collections-${data.year}.ics`);
  };

  useEffect(() => {
    fetchBinData();
  }, []);

  const parseDate = (dateStr: string): Date | null => {
    try {
      const months: { [key: string]: number } = {
        'January': 0, 'February': 1, 'March': 2, 'April': 3,
        'May': 4, 'June': 5, 'July': 6, 'August': 7,
        'September': 8, 'October': 9, 'November': 10, 'December': 11
      };
      
      const parts = dateStr.split(' ');
      if (parts.length >= 3) {
        const month = months[parts[0]];
        const day = parseInt(parts[2]);
        const year = parseInt(parts[1]);
        
        if (!isNaN(month) && !isNaN(day) && !isNaN(year)) {
          return new Date(year, month, day);
        }
      }
      return null;
    } catch {
      return null;
    }
  };
  
  const formatBritishDate = (dateStr: string): string => {
    const date = parseDate(dateStr);
    if (!date) return dateStr;
    
    const day = date.getDate();
    const dayWithSuffix = day + (
      day === 1 || day === 21 || day === 31 ? 'st' :
      day === 2 || day === 22 ? 'nd' :
      day === 3 || day === 23 ? 'rd' : 'th'
    );
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    return `${dayNames[date.getDay()]} ${dayWithSuffix} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  const getDaysUntil = (dateStr: string): number | null => {
    const date = parseDate(dateStr);
    if (!date) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
    const diff = date.getTime() - today.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const getNextCollection = (dates: string[]): string | null => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (const dateStr of dates) {
      const date = parseDate(dateStr);
      if (date && date >= today) {
        return dateStr;
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div className="space-y-1">
            <div className="h-4 w-48 bg-muted rounded animate-pulse" />
            <div className="h-3 w-32 bg-muted rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-20 bg-muted rounded-lg animate-pulse" />
            <div className="h-8 w-20 bg-muted rounded-md animate-pulse" />
            <div className="h-8 w-20 bg-muted rounded-md animate-pulse" />
          </div>
        </div>
        
        <div className="grid gap-2 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="p-3 rounded-lg border border-border backdrop-blur-sm">
              <div className="h-4 w-24 bg-muted rounded animate-pulse mb-2" />
              <div className="h-3 w-16 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="text-center text-xs font-mono font-semibold text-muted-foreground py-2">
              {day}
            </div>
          ))}
          {Array.from({ length: 35 }, (_, i) => (
            <div key={i} className="aspect-square border border-border rounded-md p-2 animate-pulse">
              <div className="text-sm font-mono text-muted-foreground/50">
                {i - 1 > 0 && i - 1 <= 31 ? i - 1 : ''}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">Error: {error}</p>
        <button
          onClick={fetchBinData}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const sortedBins = data.bins
    .map(bin => ({
      ...bin,
      nextDate: getNextCollection(bin.dates) ? formatBritishDate(getNextCollection(bin.dates)!) : null,
      daysUntil: getNextCollection(bin.dates) ? getDaysUntil(getNextCollection(bin.dates)!) : null
    }))
    .sort((a, b) => {
      if (a.daysUntil === null) return 1;
      if (b.daysUntil === null) return -1;
      return a.daysUntil - b.daysUntil;
    });

  const upcomingCollections = sortedBins
    .filter(bin => bin.nextDate && bin.daysUntil !== null && bin.daysUntil <= 7)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="font-mono">{data.address}</span>
          </div>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground font-mono">
              Updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 text-sm font-mono transition-colors ${
                viewMode === 'calendar' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted'
              }`}
            >
              <Grid3x3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-sm font-mono transition-colors ${
                viewMode === 'list' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          
          <button
            onClick={handleExportCalendar}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border hover:bg-muted transition-colors"
            title="Export to calendar with reminders"
          >
            <Download className="h-4 w-4" />
            <span className="text-sm font-mono hidden sm:inline">Export</span>
          </button>
          
          <button
            onClick={fetchBinData}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="text-sm font-mono hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {upcomingCollections.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-3">
          {upcomingCollections.map((bin) => {
            const colorClasses = {
              green: 'bg-green-500/10 border-green-500/20',
              blue: 'bg-blue-500/10 border-blue-500/20',
              amber: 'bg-amber-500/10 border-amber-500/20',
              purple: 'bg-purple-500/10 border-purple-500/20',
            };
            
            return (
              <div
                key={bin.type}
                className={`p-3 rounded-lg border ${colorClasses[bin.color as keyof typeof colorClasses]} backdrop-blur-sm`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className="text-sm font-mono font-semibold">{bin.type}</span>
                    {bin.purpose && (
                      <p className="text-[10px] text-muted-foreground">{bin.purpose}</p>
                    )}
                  </div>
                  {bin.daysUntil === 0 && (
                    <span className="text-xs font-bold px-2 py-0.5 bg-primary text-primary-foreground rounded">TODAY</span>
                  )}
                  {bin.daysUntil === 1 && (
                    <span className="text-xs font-bold px-2 py-0.5 bg-secondary text-secondary-foreground rounded">TOMORROW</span>
                  )}
                </div>
                <p className="text-xs font-mono text-muted-foreground">
                  {bin.daysUntil === 0 ? 'Collection day' : 
                   bin.daysUntil === 1 ? '1 day away' : 
                   `In ${bin.daysUntil} days`}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {viewMode === 'calendar' ? (
        <BinCalendar bins={data.bins} year={data.year} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sortedBins.map((bin, index) => (
            <BinCard
              key={bin.type}
              type={bin.type}
              color={bin.color}
              nextDate={bin.nextDate}
              frequency={bin.frequency}
              daysUntil={bin.daysUntil}
              index={index}
              purpose={bin.purpose}
              description={bin.description}
            />
          ))}
        </div>
      )}
    </div>
  );
}