import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, TrendingDown, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import './Layout.css';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="layout-container">
            <motion.aside
                className={`sidebar glass ${isSidebarOpen ? 'open' : 'closed'}`}
                initial={{ width: 250 }}
                animate={{ width: isSidebarOpen ? 250 : 80 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
                <div className="sidebar-header">
                    {isSidebarOpen && <h1 className="logo-text">Finance<span className="text-accent">Logger</span></h1>}
                    <button onClick={toggleSidebar} className="toggle-btn">
                        <Menu size={24} />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <LayoutDashboard size={24} />
                        {isSidebarOpen && <span>Dashboard</span>}
                    </NavLink>
                    <NavLink to="/income" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <TrendingUp size={24} />
                        {isSidebarOpen && <span>Income</span>}
                    </NavLink>
                    <NavLink to="/expense" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <TrendingDown size={24} />
                        {isSidebarOpen && <span>Expense</span>}
                    </NavLink>
                </nav>
            </motion.aside>

            <main className="main-content">
                <AnimatePresence mode='wait'>
                    <Outlet />
                </AnimatePresence>
            </main>
        </div>
    );
};

export default Layout;
