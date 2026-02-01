import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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
      const isValid = await bcrypt.compare(password, admin.password_hash);
      
      if (!isValid) {
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate session token (simple secure random token)
      const sessionToken = crypto.randomUUID() + '-' + crypto.randomUUID();
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          sessionToken,
          message: 'Login successful' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'change-password') {
      // Validate session
      if (!sessionToken) {
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
        .single();

      if (error || !admin) {
        return new Response(
          JSON.stringify({ error: 'Admin not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify current password
      const isValid = await bcrypt.compare(password, admin.password_hash);
      
      if (!isValid) {
        return new Response(
          JSON.stringify({ error: 'Current password is incorrect' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const newPasswordHash = await bcrypt.hash(newPassword, salt);

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

    if (action === 'init-password') {
      // Initialize password for first-time setup (only works if password is placeholder)
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

      // Check if password is still placeholder
      const isPlaceholder = admin.password_hash.startsWith('$2a$10$rQEY7GxLqpLFqKpVL1QqKuZ');
      
      if (!isPlaceholder) {
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
      const salt = await bcrypt.genSalt(10);
      const newPasswordHash = await bcrypt.hash(password, salt);

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

      const needsInit = admin.password_hash.startsWith('$2a$10$rQEY7GxLqpLFqKpVL1QqKuZ');
      
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