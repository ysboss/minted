import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Filter } from 'lucide-react';
import { fetchTransactions, Transaction } from '../services/api';
import TransactionList from '../components/TransactionList';
import './History.css';

const History = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [filterType, setFilterType] = useState<'All' | 'Income' | 'Expense'>('All');

    // Default to current month/year
    const currentDate = new Date();
    const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());

    useEffect(() => {
        const loadTransactions = async () => {
            setLoading(true);
            try {
                const data = await fetchTransactions({
                    type: filterType,
                    month: selectedMonth,
                    year: selectedYear
                });
                setTransactions(data);
            } catch (error) {
                console.error("Failed to load history", error);
            } finally {
                setLoading(false);
            }
        };

        loadTransactions();
    }, [filterType, selectedMonth, selectedYear]);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Generate last 5 years for the dropdown
    const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i);

    return (
        <motion.div
            className="history-page"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className="history-header">
                <h2>Transaction History</h2>
                <p>Browse your past income and expenses</p>
            </div>

            <div className="filter-controls glass">
                <div className="filter-group">
                    <Filter size={18} className="filter-icon" />
                    <div className="type-tabs">
                        <button
                            className={`tab-btn ${filterType === 'All' ? 'active' : ''}`}
                            onClick={() => setFilterType('All')}
                        >
                            All
                        </button>
                        <button
                            className={`tab-btn ${filterType === 'Income' ? 'active' : ''}`}
                            onClick={() => setFilterType('Income')}
                        >
                            Income
                        </button>
                        <button
                            className={`tab-btn ${filterType === 'Expense' ? 'active' : ''}`}
                            onClick={() => setFilterType('Expense')}
                        >
                            Expenses
                        </button>
                    </div>
                </div>

                <div className="filter-group">
                    <Calendar size={18} className="filter-icon" />
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        className="date-select"
                    >
                        {months.map((m, index) => (
                            <option key={m} value={index + 1}>{m}</option>
                        ))}
                    </select>

                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="date-select"
                    >
                        {years.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="history-list-container">
                {loading ? (
                    <div className="loading-state glass">Loading transactions...</div>
                ) : (
                    <TransactionList transactions={transactions} />
                )}
            </div>
        </motion.div>
    );
};

export default History;
