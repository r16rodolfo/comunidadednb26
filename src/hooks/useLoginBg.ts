import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useLoginBg() {
  const { data: loginBgUrl, refetch } = useQuery({
    queryKey: ['login-bg-url'],
    queryFn: async () => {
      const { data } = await supabase
        .from('home_config')
        .select('login_bg_url')
        .limit(1)
        .maybeSingle();

      return (data as any)?.login_bg_url as string | null;
    },
    staleTime: 5 * 60 * 1000,
  });

  return { loginBgUrl: loginBgUrl ?? null, refetch };
}
