import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseEnabled = !!(url?.startsWith('http') && key && !key.includes('your-anon-key'))
export const supabase = supabaseEnabled ? createClient(url, key) : null
export const BOARD_SLUG = 'default-team-board'
