import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase clients for the expense-manager app.
 *
 * This is a single-user application: there is exactly one account, so there is
 * no per-user session juggling here. Two clients are exported:
 *
 *  - `supabase`        Browser/client-safe client using the public anon key.
 *                      Subject to Row Level Security. Safe to import anywhere.
 *
 *  - `getServiceClient()`  Server-only client using the service role key.
 *                      Bypasses Row Level Security — never import or call this
 *                      from client components or code shipped to the browser.
 *
 * Both clients are created lazily (on first use) so that merely importing this
 * module never throws when environment variables are absent — important because
 * server route handlers import it and Next.js loads those modules at build time.
 */

let browserClient: SupabaseClient | null = null;

/**
 * Returns the lazily-initialized browser client (public anon key).
 * The anon key is exposed to the browser by design (NEXT_PUBLIC_*).
 */
export function getBrowserClient(): SupabaseClient {
  if (browserClient) return browserClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!supabaseAnonKey) {
    throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  browserClient = createClient(supabaseUrl, supabaseAnonKey);
  return browserClient;
}

/**
 * Browser client — uses the public anonymous key.
 *
 * Exposed as a stable object that defers real client creation until the first
 * property access, so importing this module has no side effects.
 */
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getBrowserClient();
    const value = Reflect.get(client as object, prop, client);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

/**
 * Server-only client — uses the service role key, which has full access and
 * bypasses Row Level Security. This must stay on the server.
 *
 * It is created inside a function (rather than at module scope) so the service
 * role key is never read into a client bundle. Calling it in the browser throws
 * immediately.
 */
export function getServiceClient(): SupabaseClient {
  if (typeof window !== 'undefined') {
    throw new Error('getServiceClient() must only be used on the server.');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!serviceRoleKey) {
    throw new Error('Missing environment variable: SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
