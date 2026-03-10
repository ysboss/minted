import { Transaction } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
    ShoppingCart, Car, Home, Zap, Receipt, HeartPulse, GraduationCap,
    Utensils, Music, Gift, DollarSign, Pencil, Trash2, X, Check
} from 'lucide-react';
import './TransactionList.css';

interface TransactionListProps {
    transactions: Transaction[];
    onUpdate?: (id: number, data: Partial<Transaction>) => Promise<boolean>;
    onDelete?: (id: number) => Promise<boolean>;
}

const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
        case 'salary':
        case 'bonus':
        case 'investment':
            return <DollarSign size={20} className="icon-green" />;
        case 'groceries':
            return <ShoppingCart size={20} className="icon-blue" />;
        case 'dining':
        case 'coffee':
        case 'food':
            return <Utensils size={20} className="icon-orange" />;
        case 'transport':
            return <Car size={20} className="icon-gray" />;
        case 'housing':
        case 'rent':
            return <Home size={20} className="icon-indigo" />;
        case 'utilities':
            return <Zap size={20} className="icon-yellow" />;
        case 'entertainment':
            return <Music size={20} className="icon-pink" />;
        case 'shopping':
            return <Gift size={20} className="icon-purple" />;
        case 'health':
            return <HeartPulse size={20} className="icon-red" />;
        case 'education':
            return <GraduationCap size={20} className="icon-cyan" />;
        default:
            return <Receipt size={20} className="icon-gray" />;
    }
};

const TransactionList = ({ transactions, onUpdate, onDelete }: TransactionListProps) => {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<Transaction>>({});
    const [isSaving, setIsSaving] = useState(false);

    const handleEditClick = (t: Transaction) => {
        setEditingId(t.id);
        // Pre-populate the form
        setEditForm({
            amount: t.amount,
            category: t.category,
            description: t.description,
            date: t.date,
            type: t.type
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    const handleSaveEdit = async (id: number) => {
        if (!onUpdate) return;
        setIsSaving(true);
        const success = await onUpdate(id, editForm);
        if (success) {
            setEditingId(null);
        }
        setIsSaving(false);
    };

    const handleDelete = async (id: number) => {
        if (!onDelete) return;
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            await onDelete(id);
        }
    };

    if (transactions.length === 0) {
        return (
            <div className="no-transactions glass">
                <p>No transactions found for this period.</p>
            </div>
        );
    }

    return (
        <div className="transaction-list glass">
            <AnimatePresence>
                {transactions.map((t, index) => (
                    <motion.div
                        key={t.id}
                        className={`transaction-item ${editingId === t.id ? 'editing' : ''}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        {editingId === t.id ? (
                            // --- INLINE EDIT MODE ---
                            <div className="transaction-edit-form">
                                <div className="edit-form-row">
                                    <input
                                        type="date"
                                        className="edit-input"
                                        value={editForm.date || ''}
                                        onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                                    />
                                    <select
                                        className="edit-input"
                                        value={editForm.type || 'Expense'}
                                        onChange={e => setEditForm({ ...editForm, type: e.target.value as 'Income' | 'Expense' })}
                                    >
                                        <option value="Income">Income</option>
                                        <option value="Expense">Expense</option>
                                    </select>
                                    <select
                                        className="edit-input"
                                        value={editForm.category || ''}
                                        onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                                    >
                                        <option value="Salary">Salary</option>
                                        <option value="Food">Food</option>
                                        <option value="Transport">Transport</option>
                                        <option value="Housing">Housing</option>
                                        <option value="Utilities">Utilities</option>
                                        <option value="Shopping">Shopping</option>
                                        <option value="Entertainment">Entertainment</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="edit-form-row">
                                    <input
                                        type="text"
                                        className="edit-input flex-grow"
                                        placeholder="Description"
                                        value={editForm.description || ''}
                                        onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                    />
                                    <div className="edit-amount-wrapper">
                                        <span className="currency-symbol">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="edit-input amount-input"
                                            value={editForm.amount || ''}
                                            onChange={e => setEditForm({ ...editForm, amount: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="edit-actions">
                                    <button className="action-btn cancel-btn" onClick={handleCancelEdit} disabled={isSaving}>
                                        <X size={16} /> Cancel
                                    </button>
                                    <button className="action-btn save-btn" onClick={() => handleSaveEdit(t.id)} disabled={isSaving}>
                                        <Check size={16} /> {isSaving ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // --- STANDARD DISPLAY MODE ---
                            <>
                                <div className="transaction-icon glass">
                                    {getCategoryIcon(t.category)}
                                </div>
                                <div className="transaction-details">
                                    <div className="transaction-title-row">
                                        <h4>{t.category}</h4>
                                        <span className={`transaction-amount ${t.type === 'Income' ? 'text-green' : 'text-red'}`}>
                                            {t.type === 'Income' ? '+' : '-'}${Math.abs(t.amount).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="transaction-subtitle-row">
                                        <span className="transaction-description">{t.description || 'No description'}</span>
                                        <span className="transaction-date">{new Date(t.date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="transaction-actions">
                                    <button className="icon-btn edit-btn" onClick={() => handleEditClick(t)} aria-label="Edit">
                                        <Pencil size={16} />
                                    </button>
                                    <button className="icon-btn delete-btn" onClick={() => handleDelete(t.id)} aria-label="Delete">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default TransactionList;
