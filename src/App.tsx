"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { supabase } from "./lib/supabase"
import { Toaster, toast } from "react-hot-toast"
import { Bell, Calendar, CreditCard, DollarSign, Plus, RefreshCw, Trash2 } from "lucide-react"
import { addDays, format, isPast, isWithinInterval } from "date-fns"
import axios from "axios"

interface Subscription {
  id: string
  company_name: string
  description: string
  amount: number
  renewal_date: string
  notification_sent: boolean
}

function App() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    company_name: "",
    description: "",
    amount: "",
    renewal_date: "",
  })

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  useEffect(() => {
    // Check for upcoming renewals
    const upcomingRenewals = subscriptions.filter((sub) => {
      const renewalDate = new Date(sub.renewal_date)
      const tomorrow = addDays(new Date(), 1)
      return isWithinInterval(renewalDate, {
        start: new Date(),
        end: tomorrow,
      })
    })

    upcomingRenewals.forEach((sub) => {
      toast.custom(
        (t) => (
          <div
            className={`${t.visible ? "animate-enter" : "animate-leave"} max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 flex items-center gap-3 border border-yellow-200 dark:border-yellow-800`}
          >
            <Bell className="text-yellow-500" />
            <div>
              <p className="font-medium dark:text-white">{sub.company_name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Renewal due on {format(new Date(sub.renewal_date), "MMM dd, yyyy")}
              </p>
            </div>
          </div>
        ),
        { duration: 5000 },
      )

      sendNotification(sub.company_name, sub.renewal_date)
    })
  }, [subscriptions])

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from("software_subscriptions")
        .select("*")
        .order("renewal_date", { ascending: true })

      if (error) throw error
      
      // Ensure amount is always a number
      const processedData = (data || []).map(sub => ({
        ...sub,
        amount: typeof sub.amount === 'number' ? sub.amount : parseFloat(sub.amount) || 0
      }))
      
      setSubscriptions(processedData)
    } catch (error) {
      console.error("Error fetching subscriptions:", error)
      toast.error("Failed to fetch subscriptions")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase.from("software_subscriptions").insert([
        {
          ...formData,
          amount: Number.parseFloat(formData.amount),
        },
      ])

      if (error) throw error
      toast.success("Subscription added successfully")
      setFormData({ company_name: "", description: "", amount: "", renewal_date: "" })
      fetchSubscriptions()
    } catch (error) {
      console.error("Error adding subscription:", error)
      toast.error("Failed to add subscription")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("software_subscriptions").delete().eq("id", id)
      if (error) throw error
      toast.success("Subscription deleted successfully")
      fetchSubscriptions()
    } catch (error) {
      console.error("Error deleting subscription:", error)
      toast.error("Failed to delete subscription")
    }
  }

  const sendNotification = async (companyName: string, renewalDate: string) => {
    try {
      await axios.post("https://shark-app-xa2zr.ondigitalocean.app/send-notification", {
        email: "yamuna@craftech360.com",
        subject: "Subscription Renewal Reminder",
        text: `Your subscription for ${companyName} is due for renewal on ${format(new Date(renewalDate), "MMM dd, yyyy")}.`,
      })
    } catch (error) {
      console.error("Error sending notification:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
              Subscription Tracker
            </span>
          </h1>
          <button
            onClick={fetchSubscriptions}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                  <CreditCard size={20} className="text-blue-500" />
                  Your Subscriptions
                </h2>
                {loading ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : subscriptions.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                    <div className="flex justify-center mb-3">
                      <CreditCard size={40} className="text-gray-300 dark:text-gray-600" />
                    </div>
                    <p>No subscriptions added yet.</p>
                    <p className="text-sm mt-1">Add your first subscription to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {subscriptions.map((sub) => (
                      <div
                        key={sub.id}
                        className="border border-gray-100 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{sub.company_name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{sub.description}</p>
                            <div className="flex items-center gap-4 mt-3">
                              <div className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                                <DollarSign size={16} className="text-green-500" />
                                ${Number(sub.amount).toFixed(2)}
                              </div>
                              <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-200">
                                <Calendar size={16} className="text-blue-500" />
                                {format(new Date(sub.renewal_date), "MMM dd, yyyy")}
                              </div>
                            </div>
                            {isPast(new Date(sub.renewal_date)) && (
                              <span className="inline-block mt-2 text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-1 rounded-full">
                                Overdue
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleDelete(sub.id)}
                            className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                            aria-label="Delete subscription"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 h-fit">
            <div className="flex items-center gap-2 mb-4">
              <Plus size={20} className="text-green-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Subscription</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subscription Name</label>
                <input
                  type="text"
                  required
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/30 outline-none transition-shadow"
                  placeholder="Netflix, Spotify, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/30 outline-none transition-shadow"
                  placeholder="Premium plan, family subscription, etc."
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount ($)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <DollarSign size={16} className="text-gray-500 dark:text-gray-400" />
                  </div>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 pl-9 pr-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/30 outline-none transition-shadow"
                    placeholder="9.99"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Renewal Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Calendar size={16} className="text-gray-500 dark:text-gray-400" />
                  </div>
                  <input
                    type="date"
                    required
                    value={formData.renewal_date}
                    onChange={(e) => setFormData({ ...formData, renewal_date: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 pl-9 pr-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/30 outline-none transition-shadow"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 px-4 rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Add Subscription
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App