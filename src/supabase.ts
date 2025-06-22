import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// console.log('Creating Supabase client with URL:', supabaseUrl)
// console.log('Using anon key (first 20 chars):', supabaseKey?.substring(0, 20) + '...')

export const supabase = createClient(supabaseUrl, supabaseKey)