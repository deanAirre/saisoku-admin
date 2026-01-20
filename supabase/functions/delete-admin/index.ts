// import { createClient } from 'jsr:@supabase/supabase-js@2';

// Deno.serve(async (req) => {
//   try {
//     const authHeader = req.headers.get('Authorization');
//     if (!authHeader) {
//       return new Response(JSON.stringify({ error: 'Missing authorization' }), {
//         status: 401,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     const supabaseClient = createClient(
//       Deno.env.get('SUPABASE_URL') ?? '',
//       Deno.env.get('SUPABASE_ANON_KEY') ?? '',
//       { global: { headers: { Authorization: authHeader } } }
//     );

//     const supabaseAdmin = createClient(
//       Deno.env.get('SUPABASE_URL') ?? '',
//       Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
//     );

//     const { adminId } = await req.json();

//     if (!adminId) {
//       return new Response(JSON.stringify({ error: 'Admin ID required' }), {
//         status: 400,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

//     if (userError || !user) {
//       return new Response(JSON.stringify({ error: 'Not authenticated' }), {
//         status: 401,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     const [callerResult, targetResult, superAdminCount] = await Promise.all([
//       supabaseClient.from('admins').select('role').eq('id', user.id).single(),
//       supabaseClient.from('admins').select('role').eq('id', adminId).single(),
//       supabaseClient.from('admins').select('id', { count: 'exact', head: true }).eq('role', 'super_admin')
//     ]);

//     if (callerResult.error || callerResult.data?.role !== 'super_admin') {
//       return new Response(JSON.stringify({ error: 'Only super admins can delete admins' }), {
//         status: 403,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     if (user.id === adminId) {
//       return new Response(JSON.stringify({ error: 'Cannot delete your own account' }), {
//         status: 400,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     if (targetResult.error) {
//       return new Response(JSON.stringify({ error: 'Admin not found' }), {
//         status: 404,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     if (targetResult.data?.role === 'super_admin' && (superAdminCount.count || 0) <= 1) {
//       return new Response(JSON.stringify({ error: 'Cannot delete the last super admin' }), {
//         status: 400,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     const { error: deleteAdminError } = await supabaseAdmin
//       .from('admins')
//       .delete()
//       .eq('id', adminId);

//     if (deleteAdminError) {
//       return new Response(JSON.stringify({ error: 'Failed to delete admin from database' }), {
//         status: 500,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(adminId);

//     if (deleteAuthError) {
//       console.error('Auth deletion error:', deleteAuthError);
//       return new Response(JSON.stringify({
//         success: true,
//         warning: 'Admin removed but auth cleanup failed'
//       }), {
//         status: 200,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     return new Response(JSON.stringify({ success: true }), {
//       status: 200,
//       headers: { 'Content-Type': 'application/json' },
//     });

//   } catch (error) {
//     console.error('Edge function error:', error);
//     return new Response(JSON.stringify({ error: 'Internal server error' }), {
//       status: 500,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   }
// });
