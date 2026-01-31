"use client"

import { useState, useEffect } from "react"
import { Search, Eye, Trash2, RefreshCw, Download } from "lucide-react"
import { getOrders, deleteOrder, updateOrder } from "../services/api"
import * as XLSX from "xlsx"

function OrderHistory() {
  const [orders, setOrders] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [selectedDate, setSelectedDate] = useState("")

const fetchOrders = async () => {
  try {
    setLoading(true)

    const filters = statusFilter !== "all" ? { status: statusFilter } : {}
    const data = await getOrders(filters)

    let filteredData = data

    if (selectedDate) {
      const selected = new Date(selectedDate)

      filteredData = data.filter((order) => {
        const d = new Date(order.createdAt)
        return (
          d.getDate() === selected.getDate() &&
          d.getMonth() === selected.getMonth() &&
          d.getFullYear() === selected.getFullYear()
        )
      })
    }

    setOrders(filteredData)
    setError(null)
  } catch (err) {
    console.error("Failed to load orders:", err)
    setError("Erreur lors du chargement des commandes")
  } finally {
    setLoading(false)
  }
}

  useEffect(() => {
    fetchOrders()
  }, [statusFilter])

  useEffect(() => {
  fetchOrders()
}, [selectedDate])

  const formatPrice = (price) => {
    return (price / 1000).toFixed(3) + " DT"
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return (
      date.toLocaleDateString("fr-FR") + " " + date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    )
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      preparing: "bg-blue-100 text-blue-800",
      ready: "bg-green-100 text-green-800",
      delivered: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    }
    const labels = {
      pending: "En attente",
      preparing: "En préparation",
      ready: "Prêt",
      delivered: "Livré",
      cancelled: "Annulé",
    }
    return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badges[status]}`}>{labels[status]}</span>
  }

  const handleDelete = async (orderId) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette commande ?")) return

    try {
      await deleteOrder(orderId)
      // Refresh orders list
      fetchOrders()
    } catch (err) {
      console.error("Failed to delete order:", err)
      alert("Erreur lors de la suppression de la commande")
    }
  }

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await updateOrder(orderId, { status: newStatus })
      // Refresh orders list
      fetchOrders()
    } catch (err) {
      console.error("Failed to update order status:", err)
      alert("Erreur lors de la mise à jour du statut")
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesSearch
  })

  const handleExportExcel = () => {
  const exportData = filteredOrders.map((order) => ({
    "Numéro commande": order.orderNumber,
    "Date": new Date(order.createdAt).toLocaleString("fr-FR"),
    "Client": order.customerName || "-",
    "Statut": order.status,
    "Paiement": order.paymentMethod,
    "Total (DT)": (order.totalAmount / 1000).toFixed(3),
    "Articles": order.items
      .map(
        (item) =>
          `${item.quantity}x ${item.name}${
            item.supplements.length
              ? " (" +
                item.supplements
                  .map((s) => `${s.name} x${s.quantity}`)
                  .join(", ") +
                ")"
              : ""
          }`
      )
      .join(" | "),
  }))

  if (exportData.length === 0) {
    alert("Aucune commande à exporter")
    return
  }

  const worksheet = XLSX.utils.json_to_sheet(exportData)

  worksheet["!cols"] = [
    { wch: 18 }, // Numéro
    { wch: 22 }, // Date
    { wch: 20 }, // Client
    { wch: 15 }, // Statut
    { wch: 15 }, // Paiement
    { wch: 15 }, // Total
    { wch: 60 }, // Articles
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Historique commandes")

  const labelDate = selectedDate
    ? selectedDate
    : new Date().toISOString().split("T")[0]

  XLSX.writeFile(
    workbook,
    `historique-commandes-${labelDate}.xlsx`
  )
}

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par numéro ou nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="preparing">En préparation</option>
            <option value="ready">Prêt</option>
            <option value="delivered">Livré</option>
            <option value="cancelled">Annulé</option>
          </select>
        </div>
  <button
    onClick={fetchOrders}
    disabled={loading}
    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
  >
    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
    Actualiser
  </button>

  <input
    type="date"
    value={selectedDate}
    onChange={(e) => setSelectedDate(e.target.value)}
    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
  />

  {selectedDate && (
    <button
      onClick={() => setSelectedDate("")}
      className="px-3 py-2 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
    >
      Réinitialiser
    </button>
  )}

  <button
    onClick={handleExportExcel}
    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
  >
    <Download size={16} />
    Exporter Excel
  </button>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow-md">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des commandes...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchOrders}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg">Aucune commande trouvée</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredOrders.map((order) => (
              <div key={order._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{order.orderNumber}</h3>
                    <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                    {order.customerName && <p className="text-sm text-gray-600">Client: {order.customerName}</p>}
                  </div>
                  <div className="text-right">
                    {getStatusBadge(order.status)}
                    <p className="text-xl font-bold text-primary mt-2">{formatPrice(order.totalAmount)}</p>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm text-gray-700 font-semibold mb-1">Articles:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {order.items.map((item, idx) => (
                      <li key={idx}>
                        {item.quantity}x {item.name}
                        {item.supplements.length > 0 && (
                          <span className="text-xs text-gray-500">
                            {" "}
                            + {item.supplements
                            .map((s) => `${s.name} x${s.quantity}`)
                            .join(", ")}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-3">
                  <label className="text-sm text-gray-700 font-semibold mr-2">Statut:</label>
                  <select
                    value={order.status}
                    onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                    className="text-sm px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="pending">En attente</option>
                    <option value="preparing">En préparation</option>
                    <option value="ready">Prêt</option>
                    <option value="delivered">Livré</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="flex items-center gap-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Eye size={16} />
                    Voir détails
                  </button>
                  <button
                    onClick={() => handleDelete(order._id)}
                    className="flex items-center gap-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                  >
                    <Trash2 size={16} />
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800">Détails de la commande</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-500 hover:text-gray-700 text-2xl">
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Numéro de commande</p>
                <p className="text-lg font-bold">{selectedOrder.orderNumber}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-semibold">{formatDate(selectedOrder.createdAt)}</p>
              </div>

              {selectedOrder.customerName && (
                <div>
                  <p className="text-sm text-gray-600">Client</p>
                  <p className="font-semibold">{selectedOrder.customerName}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600">Statut</p>
                {getStatusBadge(selectedOrder.status)}
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Articles</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded">
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="text-primary font-bold">{formatPrice(item.itemTotal)}</span>
                      </div>
                      {item.supplements.length > 0 && (
                        <p className="text-xs text-gray-600">+ {item.supplements
      .map((s) => `${s.name} x${s.quantity}`)
      .join(", ")}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <p className="text-sm text-gray-600">Notes</p>
                  <p className="bg-yellow-50 p-3 rounded">{selectedOrder.notes}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex justify-between text-2xl font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(selectedOrder.totalAmount)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Paiement: <span className="font-semibold capitalize">{selectedOrder.paymentMethod}</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full mt-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderHistory
