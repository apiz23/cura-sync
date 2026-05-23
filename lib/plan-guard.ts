import "server-only";

import supabaseAdmin from "@/lib/supabase-admin";

/**
 * Returns true if the facility's plan allows blockchain anchoring.
 * Only 'clinic' and 'enterprise' plans include blockchain.
 */
export async function facilityBlockchainAllowed(facilityId: string): Promise<boolean> {
    const { data, error } = await supabaseAdmin
        .from("cura_facilities")
        .select("plan")
        .eq("id", facilityId)
        .maybeSingle();
    if (error) {
        console.error(`facilityBlockchainAllowed: query failed for facility ${facilityId}:`, error.message);
        return false;
    }
    return data?.plan === "clinic" || data?.plan === "enterprise";
}
