import { supabase } from '../lib/supabase';

export interface TransactionData {
    date: string;
    amount: number;
    category: string;
    description: string;
    type: 'Income' | 'Expense';
}

export interface Transaction extends TransactionData {
    id: number;
    created_at: string;
}

export const submitTransaction = async (data: TransactionData): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('transactions')
            .insert([data]);

        if (error) {
            console.error("Error submitting transaction:", error);
            return false;
        }
        return true;
    } catch (error) {
        console.error("Unexpected error submitting transaction:", error);
        return false;
    }
};

export const fetchTransactions = async (): Promise<Transaction[]> => {
    try {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .order('date', { ascending: false });

        if (error) {
            console.error("Error fetching transactions:", error);
            return [];
        }
        return data as Transaction[];
    } catch (error) {
        console.error("Unexpected error fetching transactions:", error);
        return [];
    }
};
