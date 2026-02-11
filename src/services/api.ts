export interface TransactionData {
    date: string;
    amount: number;
    category: string;
    description: string;
    type: 'Income' | 'Expense';
}

export interface Transaction extends TransactionData {
    timestamp?: string;
    [key: string]: any;
}

const GOOGLE_APPS_SCRIPT_URL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || '';

export const submitTransaction = async (data: TransactionData): Promise<boolean> => {
    if (!GOOGLE_APPS_SCRIPT_URL) {
        console.warn("Google Apps Script URL not configured. Data:", data);
        return true;
    }

    try {
        await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return true;
    } catch (error) {
        console.error("Error submitting transaction:", error);
        return false;
    }
};

export const fetchTransactions = async (): Promise<Transaction[]> => {
    if (!GOOGLE_APPS_SCRIPT_URL) {
        console.warn("Apps Script URL not set");
        return [];
    }

    try {
        // Basic GET request. 
        // Note: With 'Anyone' access, this returns the JSON directly.
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL);
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return [];
    }
};
