"use client"

import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { TrendingUp, ShoppingCart, DollarSign, Package, Download } from "lucide-react"
import { getOrders } from "../services/api"
import * as XLSX from "xlsx"


const COLORS = ["#A0522D", "#D2691E", "#CD853F", "#DEB887", "#F4A460", "#8B4513", "#6B4423", "#996633"]

function Statistics({ t }) {
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState({})
  const [revenueData, setRevenueData] = useState([])
  const [paymentMethodsData, setPaymentMethodsData] = useState([])
  const [popularProducts, setPopularProducts] = useState([])
  const [period, setPeriod] = useState("today")

  useEffect(() => {
    fetchStatistics()
  }, [])

  useEffect(() => {
    if (orders.length > 0) {
      applyPeriodFilter(period)
    }
  }, [period, orders])

  const fetchStatistics = async () => {
    try {
      const data = await getOrders()
      setOrders(data)
      applyPeriodFilter("today", data)
    } catch (error) {
      console.error("Erreur statistiques :", error)
    }
  }

  const applyPeriodFilter = (selectedPeriod, sourceOrders = orders) => {
    const now = new Date()

    let startDate = null
    if (selectedPeriod === "today") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    } else if (selectedPeriod === "week") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    } else if (selectedPeriod === "month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    const filteredOrders =
      selectedPeriod === "total"
        ? sourceOrders
        : sourceOrders.filter((o) => new Date(o.createdAt) >= startDate)

    calculateStats(filteredOrders)
    calculateProducts(filteredOrders)
    calculatePayments(filteredOrders)
    calculateRevenueChart(filteredOrders)
  }

  const calculateStats = (filteredOrders) => {
    setStats({
      orders: filteredOrders.length,
      revenue: filteredOrders.reduce((s, o) => s + o.totalAmount, 0),
      completed: filteredOrders.filter((o) => o.status === "completed").length,
      pending: filteredOrders.filter((o) => o.status === "pending").length,
    })
  }

  const calculateProducts = (filteredOrders) => {
    const productCounts = {}

    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        productCounts[item.name] = (productCounts[item.name] || 0) + item.quantity

        if (item.supplements) {
          item.supplements.forEach((s) => {
            const key = `${s.name} (${t.supplement})`
            productCounts[key] = (productCounts[key] || 0) + (s.quantity || 1) * item.quantity
          })
        }
      })
    })

    const allProducts = Object.entries(productCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    setPopularProducts(allProducts) // ✅ PLUS DE LIMITE
  }

  const calculatePayments = (filteredOrders) => {
    const payments = filteredOrders.reduce((acc, o) => {
      acc[o.paymentMethod] = (acc[o.paymentMethod] || 0) + 1
      return acc
    }, {})

    setPaymentMethodsData(
      Object.entries(payments).map(([name, value]) => ({
        name: name === "cash" ? "Cash" : "Carte",
        value,
      }))
    )
  }

  const calculateRevenueChart = (filteredOrders) => {
    const days = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)

      const label = date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })

      const total = filteredOrders
        .filter((o) => {
          const d = new Date(o.createdAt)
          return (
            d.getDate() === date.getDate() &&
            d.getMonth() === date.getMonth() &&
            d.getFullYear() === date.getFullYear()
          )
        })
        .reduce((s, o) => s + o.totalAmount, 0)

      days.push({ date: label, revenue: total / 1000 })
    }

    setRevenueData(days)
  }

    const handleExportExcel = () => {
    const periodLabel = {
        today: "Jour",
        week: "Semaine",
        month: "Mois",
        total: "Total",
    }[period]

    const avgBasket =
        stats.orders > 0 ? (stats.revenue / stats.orders) / 1000 : 0

    // ========================
    // 📘 FEUILLE 1 : RÉSUMÉ
    // ========================
    const summaryData = [
        {
        "Période": periodLabel,
        "Total commandes": stats.orders,
        "Revenus (DT)": (stats.revenue / 1000).toFixed(2),
        "Panier moyen (DT)": avgBasket.toFixed(2),
        "Commandes terminées": stats.completed,
        "En attente": stats.pending,
        "Date export": new Date().toLocaleDateString("fr-FR"),
        },
    ]

    // ========================
    // 🟩 FEUILLE 2 : PRODUITS
    // ========================
    const productsData = popularProducts.map((p) => ({
        "Période": periodLabel,
        "Produit": p.name,
        "Quantité vendue": p.count,
    }))

    // ========================
    // 📦 CRÉATION DU CLASSEUR
    // ========================
    const workbook = XLSX.utils.book_new()

    const summarySheet = XLSX.utils.json_to_sheet(summaryData)
    const productsSheet = XLSX.utils.json_to_sheet(productsData)

    // ✅ AJOUT DES LARGEURS DE COLONNES (SEULE MODIFICATION)
    summarySheet["!cols"] = [
        { wch: 15 }, // Période
        { wch: 20 }, // Total commandes
        { wch: 18 }, // Revenus
        { wch: 22 }, // Panier moyen
        { wch: 24 }, // Commandes terminées
        { wch: 15 }, // En attente
        { wch: 18 }, // Date export
    ]

    productsSheet["!cols"] = [
        { wch: 15 }, // Période
        { wch: 40 }, // Produit
        { wch: 20 }, // Quantité vendue
    ]

    XLSX.utils.book_append_sheet(workbook, summarySheet, "Résumé")
    XLSX.utils.book_append_sheet(workbook, productsSheet, "Produits vendus")

    XLSX.writeFile(
        workbook,
        `bilan-statistiques-${period}.xlsx`
    )
    }

  const formatPrice = (price) => (price / 1000).toFixed(3) + " DT"
  const averageBasket = stats.orders ? stats.revenue / stats.orders : 0

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t.statistics}</h2>
        <button
        onClick={handleExportExcel}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg"
        ><Download size={18} /> {t.exportData}
        </button>
      </div>

      {/* Period Tabs */}
      <div className="flex gap-2 bg-white p-2 rounded-lg shadow-sm">
        {[
          { key: "today", label: t.today },
          { key: "week", label: t.thisWeek },
          { key: "month", label: t.thisMonth },
          { key: "total", label: t.totalOrders },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setPeriod(tab.key)}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
              period === tab.key ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* STATS CARDS — DESIGN INCHANGÉ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<ShoppingCart />} label={t.totalOrders} value={stats.orders} color="blue" />
        <StatCard icon={<DollarSign />} label={t.revenue} value={formatPrice(stats.revenue)} color="green" />
        <StatCard icon={<TrendingUp />} label={t.averageBasket} value={formatPrice(averageBasket)} color="purple" />
        <StatCard
          icon={<Package />}
          label={t.completedOrders}
          value={stats.completed}
          sub={`${t.pendingOrders}: ${stats.pending}`}
          color="orange"
        />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title={t.revenueChart}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line dataKey="revenue" stroke="#2563eb" strokeWidth={2} />
          </LineChart>
        </ChartCard>

        <ChartCard title={t.paymentMethods}>
          <PieChart>
            <Pie data={paymentMethodsData} dataKey="value" outerRadius={100}>
              {paymentMethodsData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ChartCard>
      </div>

      {/* ALL PRODUCTS SOLD */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="font-bold mb-4">{t.popularProducts}</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={popularProducts}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#A0522D" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

const StatCard = ({ icon, label, value, sub, color }) => (
  <div className={`bg-white p-6 rounded-lg shadow-sm border-l-4 border-${color}-500`}>
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm">{label}</p>
        <p className="text-3xl font-bold">{value}</p>
        {sub && <p className="text-sm mt-1">{sub}</p>}
      </div>
      <div className={`bg-${color}-100 p-3 rounded-lg`}>{icon}</div>
    </div>
  </div>
)

const ChartCard = ({ title, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <h3 className="font-bold mb-4">{title}</h3>
    <ResponsiveContainer width="100%" height={300}>
      {children}
    </ResponsiveContainer>
  </div>
)

export default Statistics
