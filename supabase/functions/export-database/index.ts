import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting database export...');

    // Export profiles
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('*')
    if (profilesError) throw profilesError;

    // Export user_roles
    const { data: userRoles, error: rolesError } = await supabaseClient
      .from('user_roles')
      .select('*')
    if (rolesError) throw rolesError;

    // Export ruang
    const { data: ruang, error: ruangError } = await supabaseClient
      .from('ruang')
      .select('*')
    if (ruangError) throw ruangError;

    // Export infokus
    const { data: infokus, error: infokusError } = await supabaseClient
      .from('infokus')
      .select('*')
    if (infokusError) throw infokusError;

    // Export peminjaman
    const { data: peminjaman, error: peminjamanError } = await supabaseClient
      .from('peminjaman')
      .select('*')
    if (peminjamanError) throw peminjamanError;

    // Export jadwal_dosen
    const { data: jadwalDosen, error: jadwalError } = await supabaseClient
      .from('jadwal_dosen')
      .select('*')
    if (jadwalError) throw jadwalError;

    // Export profile_access_log
    const { data: accessLog, error: logError } = await supabaseClient
      .from('profile_access_log')
      .select('*')
    if (logError) throw logError;

    console.log(`Exported: ${profiles?.length} profiles, ${ruang?.length} ruang, ${infokus?.length} infokus`);

    // Generate SQL INSERT statements
    const generateInserts = (tableName: string, data: any[]) => {
      if (!data || data.length === 0) return `-- No data in ${tableName}\n`;
      
      let sql = `-- Insert data into ${tableName}\n`;
      data.forEach(row => {
        const columns = Object.keys(row).join(', ');
        const values = Object.values(row).map(val => {
          if (val === null) return 'NULL';
          if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
          if (val instanceof Date) return `'${val.toISOString()}'`;
          if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
          return val;
        }).join(', ');
        sql += `INSERT INTO public.${tableName} (${columns}) VALUES (${values});\n`;
      });
      return sql + '\n';
    };

    const sqlExport = `-- Database Export from Lovable Cloud
-- Generated: ${new Date().toISOString()}
-- 
-- INSTRUCTIONS:
-- 1. Create a new Supabase project
-- 2. Run the schema migrations from supabase/migrations/ folder first
-- 3. Then run this data import SQL
--

${generateInserts('profiles', profiles || [])}
${generateInserts('user_roles', userRoles || [])}
${generateInserts('ruang', ruang || [])}
${generateInserts('infokus', infokus || [])}
${generateInserts('peminjaman', peminjaman || [])}
${generateInserts('jadwal_dosen', jadwalDosen || [])}
${generateInserts('profile_access_log', accessLog || [])}

-- Export completed
`;

    // Also provide JSON format
    const jsonExport = {
      exported_at: new Date().toISOString(),
      tables: {
        profiles,
        user_roles: userRoles,
        ruang,
        infokus,
        peminjaman,
        jadwal_dosen: jadwalDosen,
        profile_access_log: accessLog,
      },
      counts: {
        profiles: profiles?.length || 0,
        user_roles: userRoles?.length || 0,
        ruang: ruang?.length || 0,
        infokus: infokus?.length || 0,
        peminjaman: peminjaman?.length || 0,
        jadwal_dosen: jadwalDosen?.length || 0,
        profile_access_log: accessLog?.length || 0,
      }
    };

    const format = new URL(req.url).searchParams.get('format') || 'sql';

    if (format === 'json') {
      return new Response(JSON.stringify(jsonExport, null, 2), {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Content-Disposition': 'attachment; filename="database-export.json"'
        },
      });
    }

    return new Response(sqlExport, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/plain',
        'Content-Disposition': 'attachment; filename="database-export.sql"'
      },
    });

  } catch (error) {
    console.error('Export error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})
