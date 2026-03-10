import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState, useMemo } from 'react';
import { fetchTransactions, submitTransaction, Transaction } from '../services/api';
import { parseTransactionFromText } from '../services/aiParser';
import SmartEntry from '../components/SmartEntry';

const Dashboard = () => {
    const [data, setData] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        const transactions = await fetchTransactions();
        setData(transactions);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleParseRequested = async (text: string) => {
        const parseResult = await parseTransactionFromText(text);

        if (!parseResult) {
            return { success: false, message: "AI Parsing failed. Please try again." };
        }

        if (!parseResult.isTransaction || !parseResult.transaction) {
            return { success: false, message: parseResult.errorReason || "Could not identify a valid transaction." };
        }

        const success = await submitTransaction(parseResult.transaction);
        if (success) {
            // Refresh the dashboard data
            await loadData();
            return { success: true };
        }

        return { success: false, message: "Failed to save transaction to database." };
    };

    const stats = useMemo(() => {
        let income = 0;
        let expense = 0;

        data.forEach(t => {
            // Ensure amount is a number
            const amt = Number(t.amount) || 0;
            if (t.type === 'Income') income += amt;
            else if (t.type === 'Expense') expense += amt;
        });

        return {
            income,
            expense,
            balance: income - expense
        };
    }, [data]);

    const chartData = useMemo(() => {
        // Group by date
        const grouped: Record<string, { income: number, expense: number }> = {};

        // Sort raw data by date first to ensure timeline order
        const sortedDetails = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        sortedDetails.forEach(t => {
            // Format date as MM-DD or similar for shorter axis labels.
            // Explicitly map as UTC since 'YYYY-MM-DD' implies UTC when parsed without a time.
            const dateKey = new Date(t.date).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                timeZone: 'UTC'
            });

            if (!grouped[dateKey]) {
                grouped[dateKey] = { income: 0, expense: 0 };
            }

            const amt = Number(t.amount) || 0;
            if (t.type === 'Income') grouped[dateKey].income += amt;
            else if (t.type === 'Expense') grouped[dateKey].expense += amt;
        });

        return Object.entries(grouped).map(([name, vals]) => ({
            name,
            ...vals
        }));
    }, [data]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>Dashboard</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Welcome back! Here's your financial overview.</p>
                </div>
                {loading && <span style={{ color: 'var(--text-accent)' }}>Syncing...</span>}
            </header>

            <SmartEntry onParseRequested={handleParseRequested} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="glass card">
                    <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Balance</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 700, margin: '0.5rem 0' }}>
                        ${stats.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <div className="glass card">
                    <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Income</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 700, margin: '0.5rem 0', color: 'var(--color-income)' }}>
                        +${stats.income.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <div className="glass card">
                    <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Expenses</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 700, margin: '0.5rem 0', color: 'var(--color-expense)' }}>
                        -${stats.expense.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                </div>
            </div>

            <div className="glass card" style={{ height: '400px' }}>
                <h2 style={{ marginBottom: '1.5rem' }}>Financial Activity</h2>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-income)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--color-income)" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-expense)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--color-expense)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" stroke="var(--text-secondary)" />
                            <YAxis stroke="var(--text-secondary)" />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--bg-card)', border: 'var(--glass-border)', borderRadius: 'var(--radius-md)' }}
                                itemStyle={{ color: 'var(--text-primary)' }}
                            />
                            <Area type="monotone" dataKey="income" stroke="var(--color-income)" fillOpacity={1} fill="url(#colorIncome)" />
                            <Area type="monotone" dataKey="expense" stroke="var(--color-expense)" fillOpacity={1} fill="url(#colorExpense)" />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                        {loading ? 'Loading data...' : 'No transaction data available'}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default Dashboard;
