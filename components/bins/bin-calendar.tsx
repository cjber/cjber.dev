'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useMemo } from 'react';

interface BinData {
  type: string;
  color: string;
  dates: string[];
  frequency: string;
  purpose?: string;
  description?: string;
}

interface BinCalendarProps {
  bins: BinData[];
  year: number;
}

export function BinCalendar({ bins, year }: BinCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                     'July', 'August', 'September', 'October', 'November', 'December'];
  
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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

  const calendarData = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Adjust for Monday as first day (getDay() returns 0 for Sunday)
    let startingDayOfWeek = firstDay.getDay() - 1;
    if (startingDayOfWeek === -1) startingDayOfWeek = 6;
    
    const calendar: (number | null)[] = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendar.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      calendar.push(day);
    }
    
    // Fill remaining cells to complete the grid
    while (calendar.length % 7 !== 0) {
      calendar.push(null);
    }
    
    return calendar;
  }, [currentMonth, currentYear]);

  const getBinsForDay = (day: number | null) => {
    if (!day) return [];
    
    const dateStr = `${monthNames[currentMonth]} ${currentYear} ${day}`;
    const dayBins: { type: string; color: string }[] = [];
    
    bins.forEach(bin => {
      if (bin.dates.includes(dateStr)) {
        dayBins.push({ type: bin.type, color: bin.color });
      }
    });
    
    return dayBins;
  };

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentYear, currentMonth + direction, 1);
    setCurrentMonth(newDate.getMonth());
    setCurrentYear(newDate.getFullYear());
  };

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return day === today.getDate() && 
           currentMonth === today.getMonth() && 
           currentYear === today.getFullYear();
  };

  const binColors = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        
        <h2 className="text-lg font-mono font-bold">
          {monthNames[currentMonth]} {currentYear}
        </h2>
        
        <button
          onClick={() => navigateMonth(1)}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs font-mono font-semibold text-muted-foreground py-1">
            {day}
          </div>
        ))}
        
        {calendarData.map((day, index) => {
          const dayBins = getBinsForDay(day);
          const hasCollection = dayBins.length > 0;
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.005 }}
              className={`
                relative aspect-square border rounded-md flex flex-col items-center justify-between p-1.5 transition-all
                ${day ? 'border-border' : 'border-transparent'}
                ${isToday(day) ? 'ring-2 ring-primary/40 border-primary/40' : ''}
                ${hasCollection ? 'bg-muted/20' : ''}
              `}
            >
              {day && (
                <>
                  <div className={`text-sm font-mono ${isToday(day) ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                    {day}
                  </div>
                  
                  {hasCollection && (
                    <div className="flex gap-1 flex-wrap justify-center">
                      {dayBins.map((bin, idx) => (
                        <div
                          key={idx}
                          className={`w-2.5 h-2.5 rounded-full ${binColors[bin.color as keyof typeof binColors]} ring-1 ring-border/30`}
                          title={bin.type}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 justify-center text-xs">
        {Object.entries(binColors).map(([color, className]) => {
          const bin = bins.find(b => b.color === color);
          if (!bin) return null;
          
          return (
            <div key={color} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${className}`} />
              <span className="text-xs font-mono text-muted-foreground">
                {bin.purpose || bin.type}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}