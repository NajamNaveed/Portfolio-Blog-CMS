import { createContext, useState, useEffect, useCallback } from 'react';
import { getSiteContent } from '../services/siteContentService';
import { DEFAULT_SITE_CONTENT } from '../utils/defaultSiteContent';

export const SiteContentContext = createContext(null);

export function SiteContentProvider({ children }) {
  const [content, setContent] = useState(DEFAULT_SITE_CONTENT);
  const [status, setStatus] = useState('loading');

  const fetchContent = useCallback(async () => {
    setStatus('loading');
    try {
      const data = await getSiteContent();
      setContent(data);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return (
    <SiteContentContext.Provider value={{ content, status, refetch: fetchContent }}>
      {children}
    </SiteContentContext.Provider>
  );
}
