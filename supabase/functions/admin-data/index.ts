import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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

    const { action, sessionToken, data } = await req.json();

    // Validate session for all actions
    if (!sessionToken) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify session is valid
    const { data: session, error: sessionError } = await supabase
      .from('admin_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =============================================
    // ADMISSION INQUIRIES ACTIONS
    // =============================================

    // Action: Get all admission inquiries
    if (action === 'get-inquiries') {
      const { data: inquiries, error } = await supabase
        .from('admission_inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch inquiries:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch inquiries' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, data: inquiries }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action: Update inquiry status
    if (action === 'update-inquiry-status') {
      const { id, status } = data || {};

      if (!id || !status) {
        return new Response(
          JSON.stringify({ error: 'Inquiry ID and status are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const validStatuses = ['pending', 'approved', 'rejected'];
      if (!validStatuses.includes(status)) {
        return new Response(
          JSON.stringify({ error: 'Invalid status' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error } = await supabase
        .from('admission_inquiries')
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: session.admin_id,
        })
        .eq('id', id);

      if (error) {
        console.error('Failed to update inquiry:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to update inquiry' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action: Delete inquiry
    if (action === 'delete-inquiry') {
      const { id } = data || {};

      if (!id) {
        return new Response(
          JSON.stringify({ error: 'Inquiry ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error } = await supabase
        .from('admission_inquiries')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Failed to delete inquiry:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to delete inquiry' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =============================================
    // SITE CONTENT ACTIONS
    // =============================================

    // Action: Update site content
    if (action === 'update-site-content') {
      const { section_key, title, subtitle, description, image_url, extra_data } = data || {};

      if (!section_key) {
        return new Response(
          JSON.stringify({ error: 'Section key is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error } = await supabase
        .from('site_content')
        .update({
          title,
          subtitle,
          description,
          image_url,
          extra_data,
          updated_by: session.admin_id,
        })
        .eq('section_key', section_key);

      if (error) {
        console.error('Failed to update site content:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to update site content' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =============================================
    // GALLERY ACTIONS
    // =============================================

    // Action: Create gallery item
    if (action === 'create-gallery-item') {
      const { title, image_url, category, is_active, display_order, media_type } = data || {};

      if (!title || !image_url) {
        return new Response(
          JSON.stringify({ error: 'Title and image URL are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error } = await supabase
        .from('gallery')
        .insert({
          title,
          image_url,
          category: category || null,
          is_active: is_active ?? true,
          display_order: display_order ?? 0,
          media_type: media_type || 'image',
          created_by: session.admin_id,
        });

      if (error) {
        console.error('Failed to create gallery item:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to create gallery item' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action: Update gallery item
    if (action === 'update-gallery-item') {
      const { id, title, image_url, category, is_active, display_order, media_type } = data || {};

      if (!id) {
        return new Response(
          JSON.stringify({ error: 'Gallery item ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error } = await supabase
        .from('gallery')
        .update({
          title,
          image_url,
          category: category || null,
          is_active,
          display_order,
          media_type,
        })
        .eq('id', id);

      if (error) {
        console.error('Failed to update gallery item:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to update gallery item' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action: Delete gallery item
    if (action === 'delete-gallery-item') {
      const { id } = data || {};

      if (!id) {
        return new Response(
          JSON.stringify({ error: 'Gallery item ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error } = await supabase
        .from('gallery')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Failed to delete gallery item:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to delete gallery item' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =============================================
    // STORAGE ACTIONS (for admin uploads)
    // =============================================

    // Action: Get signed upload URL
    if (action === 'get-upload-url') {
      const { fileName, contentType } = data || {};

      if (!fileName) {
        return new Response(
          JSON.stringify({ error: 'File name is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate a unique file path
      const fileExt = fileName.split('.').pop();
      const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { data: signedData, error } = await supabase.storage
        .from('gallery-images')
        .createSignedUploadUrl(uniqueName);

      if (error) {
        console.error('Failed to create signed URL:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to create upload URL' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get the public URL for after upload
      const { data: publicData } = supabase.storage
        .from('gallery-images')
        .getPublicUrl(uniqueName);

      return new Response(
        JSON.stringify({ 
          success: true, 
          signedUrl: signedData.signedUrl,
          token: signedData.token,
          path: uniqueName,
          publicUrl: publicData.publicUrl 
        }),
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
