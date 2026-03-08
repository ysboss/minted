import { Transaction } from '../services/api';
import { motion } from 'framer-motion';
import { ShoppingCart, Car, Home, Zap, Receipt, HeartPulse, GraduationCap, Utensils, Music, Gift, DollarSign } from 'lucide-react';
import './TransactionList.css';

interface TransactionListProps {
    transactions: Transaction[];
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

const TransactionList = ({ transactions }: TransactionListProps) => {
    if (transactions.length === 0) {
        return (
            <div className="no-transactions glass">
                <p>No transactions found for this period.</p>
            </div>
        );
    }

    return (
        <div className="transaction-list glass">
            {transactions.map((t, index) => (
                <motion.div
                    key={t.id}
                    className="transaction-item"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                >
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
                </motion.div>
            ))}
        </div>
    );
};

export default TransactionList;
