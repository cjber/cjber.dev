import { NextResponse } from 'next/server';

export const runtime = 'edge';

interface BinCollection {
  type: string;
  color: string;
  dates: string[];
  frequency: string;
  purpose?: string;
  description?: string;
}

export async function GET() {
  try {
    const currentYear = new Date().getFullYear();
    const url = `https://onlineservices.glasgow.gov.uk/forms/refuseandrecyclingcalendar/PrintCalendar.aspx?UPRN=906700147767&Year=${currentYear}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-GB,en;q=0.5',
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const html = await response.text();
    
    // Parse the HTML to extract bin collection dates
    const extractDates = (binType: string): string[] => {
      const dates: string[] = [];
      const binAlt = binType.toLowerCase().replace(' Bin', ' Bin');
      
      // Find each month's calendar table
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December'];
      
      for (const month of months) {
        // Extract the month's calendar section
        const monthTableRegex = new RegExp(`id="${month}_Calendar"[\\s\\S]*?(?=id="[A-Z][a-z]+_Calendar"|$)`, 'i');
        const monthMatch = html.match(monthTableRegex);
        
        if (monthMatch) {
          const monthHtml = monthMatch[0];
          
          // Find all day cells with bin collections
          // Pattern: <td...>day</td></tr><tr><td><img...alt="[color] Bin"
          const dayRegex = /<td[^>]*>(\d{1,2})<\/td>\s*<\/tr>\s*<tr>\s*<td>[\s\S]*?<\/tr>/gi;
          let dayMatch;
          
          while ((dayMatch = dayRegex.exec(monthHtml)) !== null) {
            const day = dayMatch[1];
            const dayContent = dayMatch[0];
            
            // Check if this day has the bin type we're looking for
            if (dayContent.toLowerCase().includes(`alt="${binAlt.toLowerCase()}"`)) {
              dates.push(`${month} ${currentYear} ${day}`);
            }
          }
        }
      }
      
      return dates;
    };

    const bins: BinCollection[] = [
      {
        type: 'Green Bin',
        color: 'green',
        dates: extractDates('green Bin'),
        frequency: 'Every 3 weeks',
        purpose: 'General Waste',
        description: 'Non-recyclable household waste'
      },
      {
        type: 'Blue Bin',
        color: 'blue',
        dates: extractDates('blue Bin'),
        frequency: 'Every 2 weeks',
        purpose: 'Mixed Recycling',
        description: 'Paper, cardboard, plastics, cans'
      },
      {
        type: 'Brown Bin',
        color: 'amber',
        dates: extractDates('brown Bin'),
        frequency: 'Every 2 weeks',
        purpose: 'Food & Garden Waste',
        description: 'Food scraps and garden waste'
      },
      {
        type: 'Purple Bin',
        color: 'purple',
        dates: extractDates('purple Bin'),
        frequency: 'Every 8 weeks',
        purpose: 'Glass',
        description: 'Glass bottles and jars'
      }
    ];

    // Log for debugging
    console.log('Extracted bin data:', bins.map(b => ({ type: b.type, count: b.dates.length })));

    return NextResponse.json({ 
      bins, 
      year: currentYear,
      address: '38 CIRCUS DRIVE, FLAT 1'
    });
  } catch (error) {
    console.error('Error fetching bin data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bin collection data' },
      { status: 500 }
    );
  }
}