import "server-only";
import { createClient } from "@supabase/supabase-js";

// 서버에서만 쓰는 관리자용 연결. 브라우저에는 절대 노출되지 않습니다.
// 값은 .env.local 의 SUPABASE_SERVICE_ROLE_KEY 에서 입력합니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const isAdminConfigured =
  supabaseUrl.startsWith("https://") &&
  serviceRoleKey.length > 20 &&
  !serviceRoleKey.includes("붙여넣기");

export const supabaseAdmin = isAdminConfigured
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;
