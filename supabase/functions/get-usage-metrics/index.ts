import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FREE_TIER_LIMITS = {
  database_rows: 500_000,
  storage_gb: 1,
  auth_users: 50_000,
  edge_function_invocations: 500_000,
  realtime_connections: 200,
  bandwidth_gb: 5,
};

const COST_PER_UNIT_INR = {
  extra_rows_per_100k: 210,
  extra_storage_per_gb: 170,
  extra_auth_per_1k: 260,
  extra_bandwidth_per_gb: 75,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const tables = [
      "profiles",
      "user_roles",
      "schools",
      "students",
      "teachers",
      "classes",
      "subjects",
      "academic_years",
      "attendance",
      "assignments",
      "assignment_submissions",
      "exams",
      "exam_results",
      "fee_structures",
      "fee_payments",
      "timetable",
      "notices",
      "leave_requests",
      "support_tickets",
      "audit_logs",
      "billing_transactions",
      "subscription_plans",
    ];

    // Fetch row counts for each table
    const countPromises = tables.map(async (table) => {
      const { count, error } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true });
      return { table, count: error ? 0 : (count ?? 0) };
    });

    // Fetch auth user count
    const authCountPromise = (async () => {
      const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1, page: 1 });
      // The total from the API
      return error ? 0 : (data?.users?.length !== undefined ? (data as any).total ?? data.users.length : 0);
    })();

    const [tableCounts, authUserCount] = await Promise.all([
      Promise.all(countPromises),
      authCountPromise,
    ]);

    const totalRows = tableCounts.reduce((sum, t) => sum + t.count, 0);

    // Estimate storage (rough: 1 row ≈ 0.5KB average)
    const estimatedStorageBytes = totalRows * 512;
    const estimatedStorageGB = estimatedStorageBytes / (1024 * 1024 * 1024);

    // Usage percentages
    const rowUsagePct = Math.min((totalRows / FREE_TIER_LIMITS.database_rows) * 100, 100);
    const storageUsagePct = Math.min((estimatedStorageGB / FREE_TIER_LIMITS.storage_gb) * 100, 100);
    const authUsagePct = Math.min((authUserCount / FREE_TIER_LIMITS.auth_users) * 100, 100);

    // Remaining
    const remainingRows = Math.max(FREE_TIER_LIMITS.database_rows - totalRows, 0);
    const remainingStorageGB = Math.max(FREE_TIER_LIMITS.storage_gb - estimatedStorageGB, 0);
    const remainingAuthUsers = Math.max(FREE_TIER_LIMITS.auth_users - authUserCount, 0);

    // Estimated monthly cost in INR if over free tier
    let estimatedCostINR = 0;
    if (totalRows > FREE_TIER_LIMITS.database_rows) {
      const extraRows = totalRows - FREE_TIER_LIMITS.database_rows;
      estimatedCostINR += Math.ceil(extraRows / 100_000) * COST_PER_UNIT_INR.extra_rows_per_100k;
    }
    if (estimatedStorageGB > FREE_TIER_LIMITS.storage_gb) {
      const extraGB = estimatedStorageGB - FREE_TIER_LIMITS.storage_gb;
      estimatedCostINR += Math.ceil(extraGB) * COST_PER_UNIT_INR.extra_storage_per_gb;
    }
    if (authUserCount > FREE_TIER_LIMITS.auth_users) {
      const extraUsers = authUserCount - FREE_TIER_LIMITS.auth_users;
      estimatedCostINR += Math.ceil(extraUsers / 1000) * COST_PER_UNIT_INR.extra_auth_per_1k;
    }

    const response = {
      table_counts: tableCounts,
      total_rows: totalRows,
      auth_users: authUserCount,
      estimated_storage_gb: Number(estimatedStorageGB.toFixed(4)),
      free_tier_limits: FREE_TIER_LIMITS,
      usage_percentages: {
        database_rows: Number(rowUsagePct.toFixed(2)),
        storage: Number(storageUsagePct.toFixed(2)),
        auth_users: Number(authUsagePct.toFixed(2)),
      },
      remaining: {
        database_rows: remainingRows,
        storage_gb: Number(remainingStorageGB.toFixed(4)),
        auth_users: remainingAuthUsers,
      },
      estimated_monthly_cost_inr: estimatedCostINR,
      fetched_at: new Date().toISOString(),
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
