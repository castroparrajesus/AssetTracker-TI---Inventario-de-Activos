import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://fjgazgzsezdruqjaowfb.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqZ2F6Z3pzZXpkcnVxamFvd2ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNjEyNzAsImV4cCI6MjA4ODczNzI3MH0.gjTUAJ28nb7tkJ87XWldlN4mrb7TgBD1HPBVUjifqk0'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)