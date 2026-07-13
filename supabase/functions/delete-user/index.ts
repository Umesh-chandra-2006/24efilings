
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { userIds } = await req.json()

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return new Response(
                JSON.stringify({ error: 'No user IDs provided' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
        }

        // Delete users from auth.users (this should waterfall to public.profiles if configured, 
        // but often we might need to delete from profiles manually if no cascade exists)
        // Supabase Admin API deleteUser can typically only delete one at a time?
        // Let's check docs logic... actually listUsers is paginated, deleteUser is single.
        // So we loop.

        const results = [];
        const errors = [];

        for (const id of userIds) {
            const { error } = await supabaseClient.auth.admin.deleteUser(id)
            if (error) {
                console.error(`Failed to delete user ${id}:`, error)
                errors.push({ id, error: error.message })
            } else {
                results.push(id)
            }
        }

        // Also explicitly delete from profiles just in case Cascade isn't set up
        // Although standard practice is Cascade. Safe to try delete.
        const { error: profileError } = await supabaseClient
            .from('profiles')
            .delete()
            .in('id', userIds)

        // Ignore profile error if it's just "row not found" (already deleted by cascade)
        // But good to log it.
        if (profileError) {
            console.warn("Profile delete warning (might be cascade):", profileError);
        }

        return new Response(
            JSON.stringify({ success: true, deleted: results, failed: errors }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
