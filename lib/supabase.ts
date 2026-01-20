import { createClient } from '@supabase/supabase-js';
import { Store, Report } from '../types';

// 수파베이스 프로젝트 URL과 Anon Key는 대시보드 [Settings > API]에 있습니다
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);