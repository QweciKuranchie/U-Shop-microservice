// Re-export: the implementation lives in @repo/auth so there is ONE admin check.
export { verifyIsAdmin, requireAdmin } from "@repo/auth";
