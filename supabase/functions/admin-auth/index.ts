import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import bcrypt from "https://esm.sh/bcryptjs@2.4.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

// Session expiry: 24 hours
const SESSION_EXPIRY_HOURS = 24;

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { action, username, password, newPassword, sessionToken } = await req.json();

    // Helper to clean up expired sessions
    const cleanupExpiredSessions = async () => {
      await supabase
        .from('admin_sessions')
        .delete()
        .lt('expires_at', new Date().toISOString());
    };

    // Helper to validate session token
    const validateSession = async (token: string): Promise<{ valid: boolean; adminId?: string }> => {
      if (!token) return { valid: false };
      
      const { data: session, error } = await supabase
        .from('admin_sessions')
        .select('*')
        .eq('session_token', token)
        .gt('expires_at', new Date().toISOString())
        .single();
      
      if (error || !session) return { valid: false };
      return { valid: true, adminId: session.admin_id };
    };

    // Action: Validate session
    if (action === 'validate-session') {
      if (!sessionToken) {
        return new Response(
          JSON.stringify({ valid: false }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { valid } = await validateSession(sessionToken);
      return new Response(
        JSON.stringify({ valid }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action: Login
    if (action === 'login') {
      // Validate input
      if (!username || !password) {
        return new Response(
          JSON.stringify({ error: 'Username and password are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get admin credentials
      const { data: admin, error } = await supabase
        .from('admin_credentials')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !admin) {
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify password
      const isValid = bcrypt.compareSync(password, admin.password_hash);
      
      if (!isValid) {
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Clean up expired sessions first
      await cleanupExpiredSessions();

      // Generate secure session token
      const newSessionToken = crypto.randomUUID() + '-' + crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + SESSION_EXPIRY_HOURS);

      // Get client info from headers
      const userAgent = req.headers.get('user-agent') || null;
      const forwardedFor = req.headers.get('x-forwarded-for');
      const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : null;

      // Store session in database
      const { error: sessionError } = await supabase
        .from('admin_sessions')
        .insert({
          session_token: newSessionToken,
          admin_id: admin.id,
          expires_at: expiresAt.toISOString(),
          ip_address: ipAddress,
          user_agent: userAgent,
        });

      if (sessionError) {
        console.error('Failed to create session:', sessionError);
        return new Response(
          JSON.stringify({ error: 'Failed to create session' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          sessionToken: newSessionToken,
          expiresAt: expiresAt.toISOString(),
          message: 'Login successful' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action: Logout
    if (action === 'logout') {
      if (sessionToken) {
        await supabase
          .from('admin_sessions')
          .delete()
          .eq('session_token', sessionToken);
      }
      
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action: Change password
    if (action === 'change-password') {
      // Validate session
      const { valid, adminId } = await validateSession(sessionToken);
      if (!valid || !adminId) {
        return new Response(
          JSON.stringify({ error: 'Not authenticated' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate input
      if (!password || !newPassword) {
        return new Response(
          JSON.stringify({ error: 'Current password and new password are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (newPassword.length < 6) {
        return new Response(
          JSON.stringify({ error: 'New password must be at least 6 characters' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get current admin credentials
      const { data: admin, error } = await supabase
        .from('admin_credentials')
        .select('*')
        .eq('id', adminId)
        .single();

      if (error || !admin) {
        return new Response(
          JSON.stringify({ error: 'Admin not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify current password
      const isValid = bcrypt.compareSync(password, admin.password_hash);
      
      if (!isValid) {
        return new Response(
          JSON.stringify({ error: 'Current password is incorrect' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Hash new password
      const newPasswordHash = bcrypt.hashSync(newPassword, 10);

      // Update password
      const { error: updateError } = await supabase
        .from('admin_credentials')
        .update({ password_hash: newPasswordHash })
        .eq('id', admin.id);

      if (updateError) {
        return new Response(
          JSON.stringify({ error: 'Failed to update password' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Password updated successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action: Initialize password
    if (action === 'init-password') {
      // Initialize password for first-time setup (only works if password is empty or placeholder)
      const { data: admin, error } = await supabase
        .from('admin_credentials')
        .select('*')
        .single();

      if (error || !admin) {
        return new Response(
          JSON.stringify({ error: 'Admin not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if password is empty or placeholder
      const needsInit = !admin.password_hash || admin.password_hash === '' || admin.password_hash.startsWith('$2a$10$rQEY7GxLqpLFqKpVL1QqKuZ');
      
      if (!needsInit) {
        return new Response(
          JSON.stringify({ error: 'Password already initialized' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!password || password.length < 6) {
        return new Response(
          JSON.stringify({ error: 'Password must be at least 6 characters' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Hash new password
      const newPasswordHash = bcrypt.hashSync(password, 10);

      // Update password
      const { error: updateError } = await supabase
        .from('admin_credentials')
        .update({ password_hash: newPasswordHash })
        .eq('id', admin.id);

      if (updateError) {
        return new Response(
          JSON.stringify({ error: 'Failed to initialize password' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Password initialized successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action: Check if password initialization is needed
    if (action === 'check-init') {
      // Check if password needs initialization
      const { data: admin, error } = await supabase
        .from('admin_credentials')
        .select('password_hash')
        .single();

      if (error || !admin) {
        return new Response(
          JSON.stringify({ needsInit: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const needsInit = !admin.password_hash || admin.password_hash === '' || admin.password_hash.startsWith('$2a$10$rQEY7GxLqpLFqKpVL1QqKuZ');
      
      return new Response(
        JSON.stringify({ needsInit }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
