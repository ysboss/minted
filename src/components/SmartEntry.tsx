import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, Plus } from 'lucide-react';
import './SmartEntry.css';

interface SmartEntryProps {
    onParseRequested: (text: string) => Promise<{ success: boolean; message?: string }>;
}

const SmartEntry = ({ onParseRequested }: SmartEntryProps) => {
    const [text, setText] = useState('');
    const [isParsing, setIsParsing] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!text.trim() || isParsing) return;

        setIsParsing(true);
        setSuccessMsg('');

        const result = await onParseRequested(text);

        if (result.success) {
            setText('');
            setSuccessMsg('✨ Transaction added successfully!');
            setTimeout(() => setSuccessMsg(''), 3000);
        } else {
            setSuccessMsg(`❌ ${result.message || 'Failed to understand that. Try being more specific.'}`);
            setTimeout(() => setSuccessMsg(''), 4000);
        }

        setIsParsing(false);
    };

    return (
        <motion.div
            className="smart-entry-container glass"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className="smart-entry-header">
                <h3><Sparkles size={20} className="sparkle-icon" /> AI Smart Entry</h3>
                <p>Describe your transaction in natural language, and we'll do the rest.</p>
            </div>

            <form onSubmit={handleSubmit} className="smart-entry-form">
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="e.g., 'Paid $120 for monthly office internet on March 1st'"
                    disabled={isParsing}
                    className="smart-entry-input"
                    autoComplete="off"
                />

                <button
                    type="submit"
                    className={`smart-entry-btn ${isParsing ? 'parsing' : ''}`}
                    disabled={isParsing || !text.trim()}
                >
                    {isParsing ? (
                        <>
                            <Loader2 size={18} className="spin-icon" />
                            Thinking...
                        </>
                    ) : (
                        <>
                            <Plus size={18} />
                            Add
                        </>
                    )}
                </button>
            </form>

            {successMsg && (
                <motion.div
                    className={`smart-entry-feedback ${successMsg.includes('❌') ? 'error' : 'success'}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                >
                    {successMsg}
                </motion.div>
            )}
        </motion.div>
    );
};

export default SmartEntry;
