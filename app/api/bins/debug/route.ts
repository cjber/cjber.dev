import { NextResponse } from 'next/server';

export const runtime = 'edge';

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
      return NextResponse.json({ error: `Failed to fetch: ${response.status}` });
    }

    const html = await response.text();
    
    // Extract a sample to see the structure
    const sample = html.substring(0, 5000);
    
    // Check for bin images
    const greenBins = (html.match(/alt="Green Bin"/gi) || []).length;
    const blueBins = (html.match(/alt="Blue Bin"/gi) || []).length;
    const brownBins = (html.match(/alt="Brown Bin"/gi) || []).length;
    const purpleBins = (html.match(/alt="Purple Bin"/gi) || []).length;
    
    // Check for month headers
    const months = [...html.matchAll(/<h2[^>]*>([^<]+)<\/h2>/gi)].map(m => m[1]);
    
    return NextResponse.json({ 
      sample,
      counts: {
        green: greenBins,
        blue: blueBins,
        brown: brownBins,
        purple: purpleBins
      },
      months,
      htmlLength: html.length
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) });
  }
}