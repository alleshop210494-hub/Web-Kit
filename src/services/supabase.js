import { createClient } from '@supabase/supabase-js'

// Masukkan Project URL dan Anon Key asli Anda di sini secara langsung
const supabaseUrl = 'https://lnscrzlubsfkcphnoohi.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxuc2Nyemx1YnNma2NwaG5vb2hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4NDE3NDAsImV4cCI6MjEwMDQxNzc0MH0.w_7bg6QNVk4D8wwwGbHPW171dyiFcQy4DHVzmrPkP8w'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)