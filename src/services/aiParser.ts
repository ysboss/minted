import { GoogleGenAI, Type } from '@google/genai';
import { TransactionData } from './api';

// Use the Vite environment variable directly
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

/**
 * Parses a natural language sentence into a structured TransactionData object
 * using the Google Gemini API.
 */
export const parseTransactionFromText = async (
    text: string
): Promise<TransactionData | null> => {
    if (!ai) {
        console.error("VITE_GEMINI_API_KEY is not set in environment variables.");
        return null;
    }

    // Get today's date in YYYY-MM-DD format based on the browser's timezone
    const today = new Date();
    // Use local time, to ISO string to strip time, keeping the date slice.
    // Handling timezone offset gracefully to ensure "today" is the user's today.
    const tzOffset = today.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(today.getTime() - tzOffset)).toISOString().slice(0, -1);
    const currentDateStr = localISOTime.split('T')[0];

    const prompt = `
        You are a highly accurate financial parsing assistant.
        Extract the transaction details from the following user input: "${text}"
        
        Today's date is: ${currentDateStr} (Use this if the user says "today", "tonight", "this morning", etc.)
        
        Rules for extraction:
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
                        amount: { type: Type.NUMBER },
                        date: { type: Type.STRING },
                        category: { type: Type.STRING },
                        description: { type: Type.STRING },
                        type: { type: Type.STRING, enum: ["Income", "Expense"] }
                    },
                    required: ["amount", "date", "category", "description", "type"],
                },
            }
        });

        if (response.text) {
            const parsedData: TransactionData = JSON.parse(response.text);
            return parsedData;
        }

        return null;

    } catch (error) {
        console.error("Error parsing transaction with Gemini:", error);
        return null;
    }
};
