
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabase() {
    console.log('Testing Supabase connection...');
    console.log('URL:', supabaseUrl);

    // 1. Insert a test transaction
    const testData = {
        date: new Date().toISOString().split('T')[0],
        amount: 123.45,
        category: 'Test Category',
        description: 'Test Transaction from Script',
        type: 'Expense'
    };

    console.log('Inserting test data:', testData);
    const { data: insertData, error: insertError } = await supabase
        .from('transactions')
        .insert([testData])
        .select();

    if (insertError) {
        console.error('❌ Insert failed:', insertError);
        return;
    }
    console.log('✅ Insert successful:', insertData);

    // 2. Fetch transactions
    console.log('Fetching transactions...');
    const { data: fetchData, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .limit(5);

    if (fetchError) {
        console.error('❌ Fetch failed:', fetchError);
        return;
    }
    console.log('✅ Fetch successful. Found', fetchData.length, 'records.');
    console.log(fetchData);
}

testSupabase();
