import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://elzxxravpnpppzneqcmg.supabase.co"
const supabaseKey = "sb_publishable_axkABOpW-emO9GwrKAf5UQ_CSJM12R-"

export const supabase = createClient(supabaseUrl, supabaseKey)