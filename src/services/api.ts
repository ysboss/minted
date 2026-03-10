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

interface FetchTransactionsOptions {
    type?: 'Income' | 'Expense' | 'All';
    month?: number; // 1-12
    year?: number;
}

export const fetchTransactions = async (options?: FetchTransactionsOptions): Promise<Transaction[]> => {
    try {
        let query = supabase
            .from('transactions')
            .select('*')
            .order('date', { ascending: false });

        if (options?.type && options.type !== 'All') {
            query = query.eq('type', options.type);
        }

        if (options?.year && options?.month) {
            // Calculate start and end dates for the selected month
            const startDate = new Date(options.year, options.month - 1, 1).toISOString().split('T')[0];
            const endDate = new Date(options.year, options.month, 0).toISOString().split('T')[0];
            query = query.gte('date', startDate).lte('date', endDate);
        }

        const { data, error } = await query;

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

export const deleteTransaction = async (id: number): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Error deleting transaction:", error);
            return false;
        }
        return true;
    } catch (error) {
        console.error("Unexpected error deleting transaction:", error);
        return false;
    }
};

export const updateTransaction = async (id: number, data: Partial<TransactionData>): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('transactions')
            .update(data)
            .eq('id', id);

        if (error) {
            console.error("Error updating transaction:", error);
            return false;
        }
        return true;
    } catch (error) {
        console.error("Unexpected error updating transaction:", error);
        return false;
    }
};
