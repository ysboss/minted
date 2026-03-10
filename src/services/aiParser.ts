import { GoogleGenAI, Type } from '@google/genai';
import { TransactionData } from './api';

export interface ParseResult {
    isTransaction: boolean;
    transaction?: TransactionData;
    errorReason?: string;
}

// Use the Vite environment variable directly
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

/**
 * Parses a natural language sentence into a structured ParseResult object
 * using the Google Gemini API.
 */
export const parseTransactionFromText = async (
    text: string
): Promise<ParseResult | null> => {
    if (!ai) {
        console.error("VITE_GEMINI_API_KEY is not set in environment variables.");
        return null;
    }

    // Get today's date in YYYY-MM-DD format based on the browser's local timezone.
    // 'en-CA' cleanly formats as YYYY-MM-DD natively.
    const currentDateStr = new Date().toLocaleDateString('en-CA');

    const prompt = `
        You are a highly accurate financial parsing assistant.
        Determine if the user input contains a valid financial transaction.
        User input: "${text}"
        
        Today's date is: ${currentDateStr} (Use this if the user says "today", "tonight", "this morning", etc.)
        
        If it IS a valid transaction, set "isTransaction" to true, and populate the "transaction" object.
        If it is NOT a valid transaction (e.g., greeting, nonsense, or missing crucial info like amount), set "isTransaction" to false, and provide a helpful "errorReason" explaining what's missing or why it failed.
        
        Rules for extraction (if valid):
        - "amount": Must be a positive number.
        - "date": Must be in YYYY-MM-DD format. Resolve relative dates like "yesterday" based on Today's date.
        - "category": Choose the most appropriate general category (e.g., "Food", "Transport", "Shopping", "Salary", "Rent", "Utilities", "Entertainment", "Health", "Education", "Other"). Maintain consistent capitalization.
        - "description": A concise, original summary of the purchase (e.g., "Lazy dog dinner").
        - "type": MUST be strictly either "Income" or "Expense".
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        isTransaction: { type: Type.BOOLEAN },
                        transaction: {
                            type: Type.OBJECT,
                            properties: {
                                amount: { type: Type.NUMBER },
                                date: { type: Type.STRING },
                                category: { type: Type.STRING },
                                description: { type: Type.STRING },
                                type: { type: Type.STRING, enum: ["Income", "Expense"] }
                            }
                        },
                        errorReason: { type: Type.STRING }
                    },
                    required: ["isTransaction"],
                },
            }
        });

        if (response.text) {
            // Gemini sometimes wraps JSON in markdown block even with responseMimeType set
            let cleanText = response.text.trim();
            if (cleanText.startsWith('```json')) {
                cleanText = cleanText.substring(7, cleanText.length - 3).trim();
            } else if (cleanText.startsWith('```')) {
                cleanText = cleanText.substring(3, cleanText.length - 3).trim();
            }

            const parsedData: ParseResult = JSON.parse(cleanText);
            return parsedData;
        }

        return null;

    } catch (error) {
        console.error("Error parsing transaction with Gemini:", error);
        return null;
    }
};
