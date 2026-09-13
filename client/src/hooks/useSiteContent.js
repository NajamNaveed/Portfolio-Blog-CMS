import { useContext } from 'react';
import { SiteContentContext } from '../context/SiteContentContext';

export function useSiteContent() {
  const context = useContext(SiteContentContext);
  if (!context) {
    throw new Error('useSiteContent must be used within a SiteContentProvider');
  }
  return context;
}
