import { useState } from 'react';
import { motion } from 'framer-motion';
import { submitTransaction, TransactionData } from '../../services/api';
import './TransactionForm.css';

interface TransactionFormProps {
    type: 'Income' | 'Expense';
}

const TransactionForm = ({ type }: TransactionFormProps) => {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        category: '',
        description: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const categories = type === 'Income'
        ? ['Salary', 'Freelance', 'Investments', 'Gift', 'Other']
        : ['Food', 'Transport', 'Housing', 'Utilities', 'Entertainment', 'Healthcare', 'Shopping', 'Other'];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus('idle');

        const amount = parseFloat(formData.amount);
        if (isNaN(amount) || amount <= 0) {
            alert("Please enter a valid positive amount.");
            setIsSubmitting(false);
            return;
        }

        const payload: TransactionData = {
            ...formData,
            amount,
            type
        };

        const success = await submitTransaction(payload);

        if (success) {
            setStatus('success');
            setFormData({
                date: new Date().toISOString().split('T')[0],
                amount: '',
                category: '',
                description: ''
            });
            // Clear success message after 3 seconds
            setTimeout(() => setStatus('idle'), 3000);
        } else {
            setStatus('error');
        }
        setIsSubmitting(false);
    };

    return (
        <motion.form
            className="transaction-form card glass"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onSubmit={handleSubmit}
        >
            <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                    type="date"
                    id="date"
                    name="date"
                    className="input-field"
                    value={formData.date}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="amount">Amount ($)</label>
                <input
                    type="number"
                    id="amount"
                    name="amount"
                    className="input-field"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                    id="category"
                    name="category"
                    className="input-field"
                    value={formData.category}
                    onChange={handleChange}
                    required
                >
                    <option value="" disabled>Select a category</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="description">Description (Optional)</label>
                <input
                    type="text"
                    id="description"
                    name="description"
                    className="input-field"
                    placeholder="e.g. Weekly Groceries"
                    value={formData.description}
                    onChange={handleChange}
                />
            </div>

            <button
                type="submit"
                className={`btn ${type === 'Income' ? 'btn-income' : 'btn-expense'}`}
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Submitting...' : `Add ${type}`}
            </button>

            {status === 'success' && (
                <motion.p
                    className="status-msg success"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    Successfully added!
                </motion.p>
            )}

            {status === 'error' && (
                <motion.p
                    className="status-msg error"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    Failed to submit. Please try again.
                </motion.p>
            )}
        </motion.form>
    );
};

export default TransactionForm;
