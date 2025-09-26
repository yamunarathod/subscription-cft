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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 p-6 md:p-10">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800">
                Subscription Tracker
              </span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">Manage all your subscriptions in one place</p>
          </div>
          <button
            onClick={fetchSubscriptions}
            className="flex items-center gap-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-600"
          >
            <RefreshCw size={20} />
            <span className="font-medium">Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          <div className="xl:col-span-2">
            <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50">
              <div className="p-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                    <CreditCard size={24} className="text-white" />
                  </div>
                  Your Subscriptions
                </h2>
                {loading ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : subscriptions.length === 0 ? (
                  <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                    <div className="flex justify-center mb-6">
                      <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-2xl">
                        <CreditCard size={48} className="text-gray-400 dark:text-gray-500" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No subscriptions yet</h3>
                    <p className="text-gray-600 dark:text-gray-400">Add your first subscription to get started tracking your expenses.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {subscriptions.map((sub) => (
                      <div
                        key={sub.id}
                        className="group bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-750 border border-gray-200/60 dark:border-gray-600/40 rounded-2xl p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 backdrop-blur-sm"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                {sub.company_name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{sub.company_name}</h3>
                                <p className="text-lg font-semibold text-gray-700 dark:text-gray-200 leading-relaxed">{sub.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-6 mt-4">
                              <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-xl">
                                <DollarSign size={20} className="text-green-600 dark:text-green-400" />
                                <span className="text-lg font-bold text-green-700 dark:text-green-300">${Number(sub.amount).toFixed(2)}</span>
                              </div>
                              <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl">
                                <Calendar size={20} className="text-blue-600 dark:text-blue-400" />
                                <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">{format(new Date(sub.renewal_date), "MMM dd, yyyy")}</span>
                              </div>
                              {isPast(new Date(sub.renewal_date)) && (
                                <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-4 py-2 rounded-xl text-sm font-semibold">
                                  Overdue
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDelete(sub.id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-all duration-200 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20"
                            aria-label="Delete subscription"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 dark:border-gray-700/50 h-fit sticky top-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
                <Plus size={24} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add Subscription</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Subscription Name</label>
                <input
                  type="text"
                  required
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:bg-white dark:focus:bg-gray-600 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200"
                  placeholder="Netflix, Spotify, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:bg-white dark:focus:bg-gray-600 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 resize-none"
                  placeholder="Premium plan, family subscription, etc."
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Amount ($)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <DollarSign size={20} className="text-gray-500 dark:text-gray-400" />
                  </div>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 pl-12 pr-4 py-3 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:bg-white dark:focus:bg-gray-600 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200"
                    placeholder="9.99"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Renewal Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <Calendar size={20} className="text-gray-500 dark:text-gray-400" />
                  </div>
                  <input
                    type="date"
                    required
                    value={formData.renewal_date}
                    onChange={(e) => setFormData({ ...formData, renewal_date: e.target.value })}
                    className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 pl-12 pr-4 py-3 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:bg-white dark:focus:bg-gray-600 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 text-white py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-3 font-semibold text-lg"
              >
                <Plus size={20} />
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