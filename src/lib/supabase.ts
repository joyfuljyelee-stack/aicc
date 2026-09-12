import { createClient } from "@supabase/supabase-js";

// 실제 값은 프로젝트 최상위의 .env.local 파일에서 입력합니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// .env.local 에 값이 아직 입력되지 않았는지 확인
export const isSupabaseConfigured =
  supabaseUrl.startsWith("https://") && supabaseAnonKey.length > 20;

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
