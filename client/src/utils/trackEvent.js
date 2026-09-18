import api from '../services/api';

export function trackEvent(event, meta = '') {
  try {
    api.post('/analytics/track', { event, path: window.location.pathname, meta }).catch(() => {});
  } catch {
    // Tracking must never affect the user's experience.
  }
}
