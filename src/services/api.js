import axios from "axios"

const api = axios.create({
  baseURL: "https://fast-food-backend-qd11.onrender.com",
  headers: { "Content-Type": "application/json" },
})

export const login = async (email, password) => {
  const response = await api.post("/api/auth/login", {
    email,
    password,
  })
  return response.data
}

// Menu API
export const getMenu = async () => {
  try {
    const response = await api.get("/api/menu")
    return response.data
  } catch (error) {
    console.error("Error fetching menu:", error)
    throw error
  }
}

// Orders API
export const createOrder = async (orderData) => {
  try {
    const response = await api.post("/api/orders", orderData)
    return response.data
  } catch (error) {
    console.error("Error creating order:", error)
    throw error
  }
}

export const getOrders = async (filters = {}) => {
  try {
    const params = new URLSearchParams()
    if (filters.status) params.append("status", filters.status)
    if (filters.startDate) params.append("startDate", filters.startDate)
    if (filters.endDate) params.append("endDate", filters.endDate)

    const response = await api.get(`/api/orders?${params.toString()}`)
    return response.data
  } catch (error) {
    console.error("Error fetching orders:", error)
    throw error
  }
}

export const getOrderById = async (id) => {
  try {
    const response = await api.get(`/api/orders/${id}`)
    return response.data
  } catch (error) {
    console.error("Error fetching order:", error)
    throw error
  }
}

export const updateOrder = async (id, orderData) => {
  try {
    const response = await api.put(`/api/orders/${id}`, orderData)
    return response.data
  } catch (error) {
    console.error("Error updating order:", error)
    throw error
  }
}

export const deleteOrder = async (id) => {
  try {
    const response = await api.delete(`/api/orders/${id}`)
    return response.data
  } catch (error) {
    console.error("Error deleting order:", error)
    throw error
  }
}

export const getOrderStats = async () => {
  try {
    const response = await api.get("/api/orders/stats/summary")
    return response.data
  } catch (error) {
    console.error("Error fetching stats:", error)
    throw error
  }
}


export default api
