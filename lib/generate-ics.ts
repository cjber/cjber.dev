interface BinEvent {
  type: string;
  purpose: string;
  description: string;
  date: string;
  color: string;
}

export function generateICS(bins: any[], year: number): string {
  const events: string[] = [];
  
  // Helper to format date for ICS (YYYYMMDD)
  const formatDate = (dateStr: string): string => {
    const months: { [key: string]: string } = {
      'January': '01', 'February': '02', 'March': '03', 'April': '04',
      'May': '05', 'June': '06', 'July': '07', 'August': '08',
      'September': '09', 'October': '10', 'November': '11', 'December': '12'
    };
    
    const parts = dateStr.split(' ');
    if (parts.length >= 3) {
      const month = months[parts[0]];
      const day = parts[2].padStart(2, '0');
      const year = parts[1];
      return `${year}${month}${day}`;
    }
    return '';
  };
  
  // Helper to generate UID
  const generateUID = (type: string, date: string): string => {
    return `${type.replace(/\s/g, '-')}-${date}@bins.cjber.dev`;
  };
  
  // Process each bin type
  bins.forEach(bin => {
    // Get first few dates to establish pattern
    const firstDates = bin.dates.slice(0, 5);
    
    firstDates.forEach((dateStr: string, index: number) => {
      const icsDate = formatDate(dateStr);
      if (!icsDate) return;
      
      // Generate recurrence rule based on frequency
      let rrule = '';
      if (bin.frequency.includes('2 weeks')) {
        rrule = 'RRULE:FREQ=WEEKLY;INTERVAL=2;COUNT=26';
      } else if (bin.frequency.includes('3 weeks')) {
        rrule = 'RRULE:FREQ=WEEKLY;INTERVAL=3;COUNT=18';
      } else if (bin.frequency.includes('8 weeks')) {
        rrule = 'RRULE:FREQ=WEEKLY;INTERVAL=8;COUNT=7';
      }
      
      // Only add recurrence to first event of each type
      const recurrence = index === 0 ? rrule : '';
      
      // Create event with reminder at 6 PM the night before
      const event = `BEGIN:VEVENT
UID:${generateUID(bin.type, icsDate)}
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART;VALUE=DATE:${icsDate}
DTEND;VALUE=DATE:${icsDate}
SUMMARY:🗑️ ${bin.purpose || bin.type} Collection
DESCRIPTION:${bin.type}\\n${bin.description || ''}\\nPut out the night before collection day.
LOCATION:38 CIRCUS DRIVE, FLAT 1, Glasgow
${recurrence}
BEGIN:VALARM
TRIGGER:-PT14H
ACTION:DISPLAY
DESCRIPTION:Reminder: ${bin.purpose || bin.type} collection tomorrow! Put your ${bin.type.toLowerCase()} out tonight.
END:VALARM
END:VEVENT`;
      
      // Only add first event with recurrence for each bin type
      if (index === 0) {
        events.push(event);
      }
    });
  });
  
  // Build complete ICS file
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//cjber.dev//Bin Collection Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Glasgow Bin Collections
X-WR-TIMEZONE:Europe/London
X-WR-CALDESC:Bin collection schedule for 38 CIRCUS DRIVE, FLAT 1
BEGIN:VTIMEZONE
TZID:Europe/London
BEGIN:DAYLIGHT
TZOFFSETFROM:+0000
TZOFFSETTO:+0100
TZNAME:BST
DTSTART:20250330T010000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:+0100
TZOFFSETTO:+0000
TZNAME:GMT
DTSTART:20251026T020000
RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU
END:STANDARD
END:VTIMEZONE
${events.join('\n')}
END:VCALENDAR`;
  
  return icsContent;
}

export function downloadICS(content: string, filename: string = 'bin-collections.ics'): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}