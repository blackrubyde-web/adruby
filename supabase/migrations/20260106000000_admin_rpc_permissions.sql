-- Migration: Lock down admin RPCs to service_role only
-- Description: Revoke execute from public/authenticated/anon and grant to service_role.

REVOKE EXECUTE ON FUNCTION admin_check_role(UUID) FROM PUBLIC, authenticated, anon;
REVOKE EXECUTE ON FUNCTION admin_get_all_users(INT, INT, TEXT) FROM PUBLIC, authenticated, anon;
REVOKE EXECUTE ON FUNCTION admin_get_user_count(TEXT) FROM PUBLIC, authenticated, anon;
REVOKE EXECUTE ON FUNCTION admin_get_all_affiliates() FROM PUBLIC, authenticated, anon;
REVOKE EXECUTE ON FUNCTION admin_create_affiliate(UUID, TEXT, TEXT) FROM PUBLIC, authenticated, anon;
REVOKE EXECUTE ON FUNCTION admin_get_all_payouts(TEXT) FROM PUBLIC, authenticated, anon;
REVOKE EXECUTE ON FUNCTION admin_process_payout(UUID, TEXT, TEXT) FROM PUBLIC, authenticated, anon;
REVOKE EXECUTE ON FUNCTION admin_get_revenue_stats() FROM PUBLIC, authenticated, anon;
REVOKE EXECUTE ON FUNCTION admin_update_user_credits(UUID, INT, TEXT) FROM PUBLIC, authenticated, anon;
REVOKE EXECUTE ON FUNCTION admin_approve_affiliate(UUID) FROM PUBLIC, authenticated, anon;

GRANT EXECUTE ON FUNCTION admin_check_role(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION admin_get_all_users(INT, INT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION admin_get_user_count(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION admin_get_all_affiliates() TO service_role;
GRANT EXECUTE ON FUNCTION admin_create_affiliate(UUID, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION admin_get_all_payouts(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION admin_process_payout(UUID, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION admin_get_revenue_stats() TO service_role;
GRANT EXECUTE ON FUNCTION admin_update_user_credits(UUID, INT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION admin_approve_affiliate(UUID) TO service_role;
