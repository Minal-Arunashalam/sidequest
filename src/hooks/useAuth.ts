import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setUserId(data.session.user.id);
        setAuthLoading(false);
      } else {
        supabase.auth.signInAnonymously().then(({ data: signInData }) => {
          setUserId(signInData.user?.id ?? null);
          setAuthLoading(false);
        });
      }
    });
  }, []);

  return { userId, authLoading };
}
