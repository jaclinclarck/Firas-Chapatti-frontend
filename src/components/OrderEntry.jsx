"use client"

import { useState, useEffect } from "react"
import { Plus, Minus } from "lucide-react"
import { getMenu } from "../services/api"

function OrderEntry({ addToCart, t }) {
  const [menu, setMenu] = useState({ products: [], supplements: [], drinks: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedSupplements, setSelectedSupplements] = useState({})

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true)
        const data = await getMenu()
        setMenu(data)
        setError(null)
      } catch (err) {
        console.error("Failed to load menu:", err)
        setError("Erreur lors du chargement du menu")
      } finally {
        setLoading(false)
      }
    }

    fetchMenu()
  }, [])

  const addSupplement = (supplement) => {
    setSelectedSupplements((prev) => ({
      ...prev,
      [supplement.id]: (prev[supplement.id] || 0) + 1,
    }))
  }

  const removeSupplement = (supplementId) => {
    setSelectedSupplements((prev) => {
      const newSupplements = { ...prev }
      if (newSupplements[supplementId] > 1) {
        newSupplements[supplementId]--
      } else {
        delete newSupplements[supplementId]
      }
      return newSupplements
    })
  }

  const calculateItemTotal = () => {
    if (!selectedProduct) return 0
    const basePrice = selectedProduct.price * quantity

    const supplementsTotal =
      Object.entries(selectedSupplements).reduce((sum, [supplementId, qty]) => {
        const supplement = menu.supplements.find((s) => s.id === supplementId)
        return sum + (supplement ? supplement.price * qty : 0)
      }, 0) * quantity

    return basePrice + supplementsTotal
  }

  const handleAddToCart = () => {
    if (!selectedProduct) return

    const supplementsArray = Object.entries(selectedSupplements).map(([supplementId, qty]) => {
      const supplement = menu.supplements.find((s) => s.id === supplementId)
      return {
        id: supplementId,
        name: supplement.name,
        price: supplement.price,
        quantity: qty,
      }
    })

    const item = {
      productId: selectedProduct.id,
      name: selectedProduct.name,
      quantity,
      price: selectedProduct.price,
      supplements: supplementsArray,
      itemTotal: calculateItemTotal(),
    }

    addToCart(item)

    // Reset
    setSelectedProduct(null)
    setQuantity(1)
    setSelectedSupplements({})
  }

  const formatPrice = (price) => {
    return (price / 1000).toFixed(3) + " DT"
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du menu...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Products Grid */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">{t.menu}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {menu.products.map((product) => (
            <button
              key={product.id}
              onClick={() => {
                setSelectedProduct(product)
                setSelectedSupplements({})
              }}
              className={`text-left p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                selectedProduct?.id === product.id
                  ? "border-primary bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-gray-800">{product.name}</h3>
                <span className="text-primary font-bold text-lg">{formatPrice(product.price)}</span>
              </div>
              <p className="text-sm text-gray-600">{product.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Supplements */}
      {selectedProduct && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">{t.supplements}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {menu.supplements.map((supplement) => (
              <div
                key={supplement.id}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedSupplements[supplement.id]
                    ? "border-secondary bg-orange-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="text-sm font-semibold text-gray-800 mb-2">{supplement.name}</div>
                <div className="text-xs text-secondary font-bold mb-2">{formatPrice(supplement.price)}</div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => removeSupplement(supplement.id)}
                    disabled={!selectedSupplements[supplement.id]}
                    className="p-1 bg-red-100 rounded hover:bg-red-200 disabled:opacity-30 transition-colors"
                  >
                    <Minus size={14} className="text-red-600" />
                  </button>
                  <span className="flex-1 text-center font-bold text-sm">
                    {selectedSupplements[supplement.id] || 0}
                  </span>
                  <button
                    onClick={() => addSupplement(supplement)}
                    className="p-1 bg-green-100 rounded hover:bg-green-200 transition-colors"
                  >
                    <Plus size={14} className="text-green-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drinks */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">{t.drinks}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {menu.drinks.map((drink) => (
            <button
              key={drink.id}
              onClick={() => {
                addToCart({
                  productId: drink.id,
                  name: drink.name,
                  quantity: 1,
                  price: drink.price,
                  supplements: [],
                  itemTotal: drink.price,
                })
              }}
              className="p-4 rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-blue-50 transition-all text-left"
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-800">{drink.name}</span>
                <span className="text-primary font-bold">{formatPrice(drink.price)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Add to Cart Section */}
      {selectedProduct && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-800">{selectedProduct.name}</h3>
              <p className="text-sm text-gray-600">
                {t.total}: <span className="text-2xl font-bold text-primary">{formatPrice(calculateItemTotal())}</span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 bg-white rounded hover:bg-gray-50 transition-colors"
                >
                  <Minus size={20} />
                </button>
                <span className="px-4 font-bold text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 bg-white rounded hover:bg-gray-50 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="px-8 py-3 bg-primary text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t.addToCart}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderEntry
