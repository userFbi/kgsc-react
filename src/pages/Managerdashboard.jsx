import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Chart from "chart.js/auto";
import styles from "../pages/ManagerDashboard.module.css";

const MONTH_LABELS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export default function ManagerDashboard() {
    const [members, setMembers] = useState([]);
    const barCanvasRef = useRef(null);
    const pieCanvasRef = useRef(null);
    const barChartRef = useRef(null);
    const pieChartRef = useRef(null);

    // Load members from localStorage (swap this for an API call when ready)
    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("members") || "[]");
        setMembers(stored);
    }, []);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let newThisMonth = 0;
    let recentCount = 0;
    const monthlyCounts = Array(12).fill(0);

    members.forEach((member) => {
        const createdAt = new Date(member.createdAt || member.timestamp || Date.now());
        if (createdAt.getMonth() === currentMonth && createdAt.getFullYear() === currentYear) {
            newThisMonth++;
        }
        if ((now - createdAt) / (1000 * 60 * 60 * 24) <= 7) {
            recentCount++;
        }
        monthlyCounts[createdAt.getMonth()]++;
    });

    const recentMembers = [...members].slice(-4).reverse();

    // Build / update charts whenever members change
    useEffect(() => {
        if (barChartRef.current) barChartRef.current.destroy();
        if (pieChartRef.current) pieChartRef.current.destroy();

        if (barCanvasRef.current) {
            barChartRef.current = new Chart(barCanvasRef.current, {
                type: "bar",
                data: {
                    labels: MONTH_LABELS,
                    datasets: [
                        {
                            label: "Contacts per Month",
                            data: monthlyCounts,
                            backgroundColor: "#3b82f6",
                        },
                    ],
                },
                options: {
                    responsive: true,
                    scales: { y: { beginAtZero: true } },
                },
            });
        }

        if (pieCanvasRef.current) {
            pieChartRef.current = new Chart(pieCanvasRef.current, {
                type: "pie",
                data: {
                    labels: ["New This Month", "Existing"],
                    datasets: [
                        {
                            data: [newThisMonth, members.length - newThisMonth],
                            backgroundColor: ["#10b981", "#d1d5db"],
                        },
                    ],
                },
                options: { responsive: true },
            });
        }

        return () => {
            if (barChartRef.current) barChartRef.current.destroy();
            if (pieChartRef.current) pieChartRef.current.destroy();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [members]);

    function logout() {
        localStorage.removeItem("isAdmin");
        window.location.href = "/";
    }

    return (
        <div className={styles.managerPage}>
            {/* ============================= SIDEBAR ============================= */}
            <div className={styles.sidebar}>
                <div className={styles.navSection}>
                    <div className={styles.sidebarHeader}>
                        <h4>Manager Panel</h4>
                    </div>
                    <Link to="/manager" className={`${styles.navLink} ${styles.navLinkActive}`}>
                        <i className="bi bi-speedometer2 me-2"></i> Dashboard
                    </Link>
                    <Link to="/manager/members" className={styles.navLink}>
                        <i className="bi bi-people me-2"></i> View Members
                    </Link>
                    <Link to="/manager/add-member" className={styles.navLink}>
                        <i className="bi bi-person-plus me-2"></i> Add Member
                    </Link>
                </div>
                <div className={styles.logoutBtn}>
                    <a href="#" onClick={logout} className="text-danger">
                        Logout
                    </a>
                </div>
            </div>

            {/* ============================= MAIN ============================= */}
            <div className={styles.mainContent}>
                <h2 className="fw-bold">Dashboard</h2>
                <p className="text-muted">
                    Welcome back! Here's what's happening with your contacts.
                </p>

                {/* Stat cards */}
                <div className="row g-3 mb-4">
                    <div className="col-md-3">
                        <div className={`${styles.cardBox} d-flex justify-content-between align-items-center`}>
                            <div>
                                <p className="text-muted mb-1">Total Contacts</p>
                                <h3>{members.length}</h3>
                                <small className="text-success">+12% from last month</small>
                            </div>
                            <div
                                className="rounded-circle d-flex justify-content-center align-items-center"
                                style={{ width: 45, height: 45, backgroundColor: "#e0edff" }}
                            >
                                <i className="bi bi-people fs-4 text-primary"></i>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3">
                        <div className={`${styles.cardBox} d-flex justify-content-between align-items-center`}>
                            <div>
                                <p className="text-muted mb-1">New This Month</p>
                                <h3>{newThisMonth}</h3>
                                <small className="text-success">+5% from last month</small>
                            </div>
                            <div
                                className="rounded-circle d-flex justify-content-center align-items-center"
                                style={{ width: 45, height: 45, backgroundColor: "#d9fce5" }}
                            >
                                <i className="bi bi-person-plus fs-4 text-success"></i>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3">
                        <div className={`${styles.cardBox} d-flex justify-content-between align-items-center`}>
                            <div>
                                <p className="text-muted mb-1">Recently Viewed</p>
                                <h3>{recentCount}</h3>
                                <small className="text-success">+8% from last month</small>
                            </div>
                            <div
                                className="rounded-circle d-flex justify-content-center align-items-center"
                                style={{ width: 45, height: 45, backgroundColor: "#f0e9ff" }}
                            >
                                <i className={`bi bi-eye fs-4 ${styles.textPurple}`}></i>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3">
                        <div className={`${styles.cardBox} d-flex justify-content-between align-items-center`}>
                            <div>
                                <p className="text-muted mb-1">Growth Rate</p>
                                <h3>23%</h3>
                                <small className="text-success">+2% from last month</small>
                            </div>
                            <div
                                className="rounded-circle d-flex justify-content-center align-items-center"
                                style={{ width: 45, height: 45, backgroundColor: "#fff3e0" }}
                            >
                                <i className="bi bi-graph-up-arrow fs-4 text-warning"></i>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="row g-3 mb-4">
                    <div className="col-md-6">
                        <div className={styles.cardBox}>
                            <h5>Bar Chart: Contacts by Month</h5>
                            <canvas ref={barCanvasRef}></canvas>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className={styles.cardBox}>
                            <h5>Pie Chart: New vs Old</h5>
                            <canvas ref={pieCanvasRef}></canvas>
                        </div>
                    </div>
                </div>

                {/* Quick actions + recent contacts */}
                <div className="row g-3">
                    <div className="col-md-6">
                        <div className={styles.cardBox}>
                            <h5>
                                <i className="bi bi-person-plus me-2"></i>Quick Actions
                            </h5>
                            <Link to="/manager/add-member" className="btn btn-primary w-100 mb-2">
                                Add New Contact
                            </Link>
                            <Link to="/manager/members" className="btn btn-outline-secondary w-100">
                                View All Contacts
                            </Link>
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className={styles.cardBox}>
                            <h5 className="fw-bold mb-3">
                                <i className="bi bi-people text-success me-2"></i> Recent Contacts
                            </h5>
                            <div>
                                {recentMembers.length === 0 ? (
                                    <p className="text-muted">No recent contacts.</p>
                                ) : (
                                    recentMembers.map((m) => {
                                        const fullName = `${m.firstName} ${m.lastName}`;
                                        const originalIndex = members.indexOf(m);
                                        return (
                                            <div className={styles.recentContact} key={originalIndex}>
                                                <span className={styles.contactName}>{fullName}</span>
                                                <Link to={`/manager/members/${originalIndex}`} className={styles.viewBtn}>
                                                    <i className="bi bi-eye"></i>
                                                </Link>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}