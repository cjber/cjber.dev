'use client';

import { motion } from 'framer-motion';
import { Calendar, Trash2 } from 'lucide-react';

interface BinCardProps {
  type: string;
  color: string;
  nextDate: string | null;
  frequency: string;
  daysUntil: number | null;
  index: number;
  purpose?: string;
  description?: string;
}

export function BinCard({ type, color, nextDate, frequency, daysUntil, index, purpose, description }: BinCardProps) {
  const colorClasses = {
    green: 'bg-green-500/10 border-green-500/20 text-green-500',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-500',
  };

  const iconColorClasses = {
    green: 'text-green-500',
    blue: 'text-blue-500',
    amber: 'text-amber-500',
    purple: 'text-purple-500',
  };

  const isToday = daysUntil === 0;
  const isTomorrow = daysUntil === 1;
  const isOverdue = daysUntil !== null && daysUntil < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative overflow-hidden rounded-lg border ${
        colorClasses[color as keyof typeof colorClasses]
      } p-6 backdrop-blur-sm transition-all hover:scale-[1.02] ${
        isToday ? 'ring-2 ring-primary animate-pulse' : ''
      }`}
    >
      {isToday && (
        <div className="absolute top-2 right-2">
          <span className="text-xs font-bold bg-primary text-primary-foreground px-2 py-1 rounded">
            TODAY
          </span>
        </div>
      )}
      {isTomorrow && (
        <div className="absolute top-2 right-2">
          <span className="text-xs font-bold bg-secondary text-secondary-foreground px-2 py-1 rounded">
            TOMORROW
          </span>
        </div>
      )}
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Trash2 className={`h-6 w-6 ${iconColorClasses[color as keyof typeof iconColorClasses]}`} />
          <div>
            <h3 className="text-lg font-mono font-semibold text-foreground">{type}</h3>
            {purpose && (
              <p className="text-xs text-muted-foreground">{purpose}</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Next collection:</span>
        </div>
        
        {nextDate ? (
          <>
            <p className="text-xl font-mono font-bold text-foreground">
              {nextDate}
            </p>
            {daysUntil !== null && (
              <p className={`text-sm font-mono ${
                isOverdue ? 'text-destructive' : 'text-muted-foreground'
              }`}>
                {isOverdue 
                  ? `${Math.abs(daysUntil)} days ago`
                  : isToday 
                  ? 'Collection day!'
                  : isTomorrow
                  ? 'Tomorrow'
                  : `In ${daysUntil} days`
                }
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No upcoming collections</p>
        )}
        
        <div className="pt-2 border-t border-border space-y-1">
          <p className="text-xs text-muted-foreground">
            {frequency}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground/70">
              {description}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}