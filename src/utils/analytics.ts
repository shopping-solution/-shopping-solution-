export interface VisitorStats {
  today: { unique: number; views: number };
  week: { unique: number; views: number };
  month: { unique: number; views: number };
  total: { unique: number; views: number };
}

export function trackVisitor() {
  try {
    let visitorId = localStorage.getItem('zoruq_visitor_id');
    if (!visitorId) {
      visitorId = 'v_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
      localStorage.setItem('zoruq_visitor_id', visitorId);
    }

    // Rate limit hits within same tab session (e.g. 1 hit every 15 seconds max)
    const lastTrackTime = sessionStorage.getItem('zoruq_last_track');
    const now = Date.now();
    if (lastTrackTime && now - Number(lastTrackTime) < 15000) {
      return;
    }
    sessionStorage.setItem('zoruq_last_track', String(now));

    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId }),
    }).catch((e) => {
      console.warn('Visitor tracking request error:', e);
    });
  } catch (err) {
    console.error('Visitor tracking error:', err);
  }
}

export async function fetchAnalyticsStats(): Promise<VisitorStats | null> {
  try {
    const res = await fetch('/api/analytics/stats');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Fetch analytics stats error:', err);
  }
  return null;
}
