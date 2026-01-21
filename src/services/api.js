import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Menu API
export const getMenu = async () => {
  try {
    const response = await api.get("/menu")
    return response.data
  } catch (error) {
    console.error("Error fetching menu:", error)
    throw error
  }
}

// Orders API
export const createOrder = async (orderData) => {
  try {
    const response = await api.post("/orders", orderData)
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

    const response = await api.get(`/orders?${params.toString()}`)
    return response.data
  } catch (error) {
    console.error("Error fetching orders:", error)
    throw error
  }
}

export const getOrderById = async (id) => {
  try {
    const response = await api.get(`/orders/${id}`)
    return response.data
  } catch (error) {
    console.error("Error fetching order:", error)
    throw error
  }
}

export const updateOrder = async (id, orderData) => {
  try {
    const response = await api.put(`/orders/${id}`, orderData)
    return response.data
  } catch (error) {
    console.error("Error updating order:", error)
    throw error
  }
}

export const deleteOrder = async (id) => {
  try {
    const response = await api.delete(`/orders/${id}`)
    return response.data
  } catch (error) {
    console.error("Error deleting order:", error)
    throw error
  }
}

export const getOrderStats = async () => {
  try {
    const response = await api.get("/orders/stats/summary")
    return response.data
  } catch (error) {
    console.error("Error fetching stats:", error)
    throw error
  }
}

export default api
