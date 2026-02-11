import { motion } from 'framer-motion';
import TransactionForm from '../components/forms/TransactionForm';

const Expense = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--color-expense)' }}>Expense</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Track your spending.</p>
            </header>

            <TransactionForm type="Expense" />
        </motion.div>
    );
};

export default Expense;
