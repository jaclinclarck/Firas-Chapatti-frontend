"use client"

import { useState } from "react"
import { Trash2, ShoppingCart, Printer } from "lucide-react"
import Receipt from "./Receipt"
import { createOrder } from "../services/api"

function Cart({ cart, removeFromCart, clearCart, t }) {
  const [showReceipt, setShowReceipt] = useState(false)
  const [customerName, setCustomerName] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [notes, setNotes] = useState("")
  const [currentOrder, setCurrentOrder] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.itemTotal, 0)
  }

  const formatPrice = (price) => {
    return (price / 1000).toFixed(3) + " DT"
  }

  const handleSubmitOrder = async () => {
    if (cart.length === 0) return

    const orderData = {
  items: cart.map(item => ({
    ...item,
    supplements: item.supplements.map(s => ({
  name: s.name,
  quantity: s.quantity,
  price: s.price
}))
  })),
  totalAmount: calculateTotal(),
  customerName,
  paymentMethod,
  notes,
}

    try {
      setSubmitting(true)
      setError(null)

      const createdOrder = await createOrder(orderData)

      setCurrentOrder(createdOrder)
      setShowReceipt(true)
    } catch (err) {
      console.error("Failed to create order:", err)
      setError("Erreur lors de la création de la commande")
    } finally {
      setSubmitting(false)
    }
  }

  const handleCloseReceipt = () => {
    setShowReceipt(false)
    clearCart()
    setCustomerName("")
    setNotes("")
    setCurrentOrder(null)
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart size={24} className="text-primary" />
          <h2 className="text-2xl font-bold text-gray-800">{t.cart}</h2>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ShoppingCart size={48} className="mx-auto mb-2 opacity-30" />
            <p>{t.emptyCart}</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {cart.map((item, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">
                        {item.quantity}x {item.name}
                      </h4>
                      {item.supplements && item.supplements.length > 0 && (
                        <p className="text-xs text-gray-600 mt-1">
                          + {item.supplements.map((s) => `${s.name} x${s.quantity}`).join(", ")}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromCart(index)}
                      className="text-red-500 hover:text-red-700 transition-colors ml-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="text-right text-primary font-bold">{formatPrice(item.itemTotal)}</div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between text-xl font-bold">
                <span>{t.total}</span>
                <span className="text-primary">{formatPrice(calculateTotal())}</span>
              </div>

              <input
                type="text"
                placeholder={`${t.customerName} (${t.optional})`}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />

              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="cash">{t.cash}</option>
                <option value="card">{t.card}</option>
                <option value="mobile">{t.mobile}</option>
              </select>

              <textarea
                placeholder={`${t.notes} (${t.optional})`}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />

              {error && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm">{error}</div>
              )}

              <button
                onClick={handleSubmitOrder}
                disabled={submitting}
                className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>{t.processing}</span>
                  </>
                ) : (
                  <>
                    <Printer size={20} />
                    {t.validateOrder}
                  </>
                )}
              </button>

              <button
                onClick={clearCart}
                className="w-full py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                {t.clearCart}
              </button>
            </div>
          </>
        )}
      </div>

      {showReceipt && currentOrder && <Receipt order={currentOrder} onClose={handleCloseReceipt} t={t} />}
    </>
  )
}

export default Cart
