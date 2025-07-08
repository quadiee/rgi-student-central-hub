
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';

// Lightweight auth hook that only checks authentication status without loading full profile
export const useQuickAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Quick session check without profile loading
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(session);
          setLoading(false);
        }
      } catch (error) {
        console.error('Quick auth check error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Listen for auth changes with minimal overhead
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        setSession(session);
        setLoading(false);
      }
    });

    checkAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    isAuthenticated: !!session,
    session,
    loading,
    userId: session?.user?.id || null
  };
};
