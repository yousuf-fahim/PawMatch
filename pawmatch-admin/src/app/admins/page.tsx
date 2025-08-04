'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Users, 
  Shield,
  Mail,
  Calendar,
  ArrowLeft,
  Ban,
  Plus,
  Send
} from 'lucide-react'

interface PreAccessAdmin {
  id: string
  email: string
  created_at: string
}

export default function AdminManagementPage() {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()
  
  const [preAccessAdmins, setPreAccessAdmins] = useState<PreAccessAdmin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/login')
    } else if (user && isAdmin) {
      loadPreAccessAdmins()
    }
  }, [user, loading, isAdmin, router])

  const loadPreAccessAdmins = async () => {
    try {
      setIsLoading(true)
      
      // Use server-side API to get admins
      const response = await fetch('/api/admin')
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to load admin list')
      }
      
      console.log('Loaded admins:', result.admins?.length || 0)
      setPreAccessAdmins(result.admins || [])
    } catch (error: any) {
      console.error('Error loading pre-access admins:', error)
      setErrorMsg(error.message || 'Failed to load admin list - please check database permissions')
    } finally {
      setIsLoading(false)
    }
  }
  
  const addPreAccessAdmin = async (email: string) => {
    try {
      setIsSending(true)
      setErrorMsg('')
      setSuccessMsg('')
      
      // Check if email already exists
      const exists = preAccessAdmins.some(admin => admin.email.toLowerCase() === email.toLowerCase())
      if (exists) {
        setErrorMsg('This email is already in the pre-access admin list')
        return
      }

      // Add to pre_access_admins using the server API
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to add admin')
      }
      
      setSuccessMsg(`Admin added successfully! Invitation sent to ${email}`)
      
      // Reload pre-access admins
      await loadPreAccessAdmins()
      setNewAdminEmail('')
    } catch (error: any) {
      console.error('Error adding pre-access admin:', error)
      setErrorMsg(error.message || 'Failed to add admin')
    } finally {
      setIsSending(false)
    }
  }

  const removePreAccessAdmin = async (id: string) => {
    try {
      setErrorMsg('')
      setSuccessMsg('')
      
      // Use server API to delete admin
      const response = await fetch(`/api/admin?id=${id}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to remove admin')
      }
      
      setSuccessMsg('Admin removed successfully')
      // Reload pre-access admins
      await loadPreAccessAdmins()
    } catch (error: any) {
      console.error('Error removing pre-access admin:', error)
      setErrorMsg(error.message || 'Failed to remove admin')
    }
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Admin Management</h1>
                  <p className="text-sm text-gray-500">Manage admin access and invitations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Messages */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
            {successMsg}
          </div>
        )}
        
        {/* Add Admin Form */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Admin</h2>
          <p className="text-sm text-gray-600 mb-4">
            Grant admin access to an email address that hasn't registered yet. This allows the user
            to have admin privileges upon sign-up. An invitation email will be sent to the specified address.
          </p>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            if (newAdminEmail) {
              addPreAccessAdmin(newAdminEmail);
            }
          }} className="flex flex-col sm:flex-row gap-3">
            <input 
              type="email" 
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              placeholder="Enter email address"
              required
              className="flex-1 border border-gray-300 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-800"
            />
            <button
              type="submit"
              disabled={isSending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Add & Send Invitation</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Admin List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Admin Access List</h2>
            <span className="bg-indigo-100 text-indigo-800 py-1 px-3 rounded-full text-sm font-medium">
              {preAccessAdmins.length} {preAccessAdmins.length === 1 ? 'Admin' : 'Admins'}
            </span>
          </div>
          
          {isLoading ? (
            <div className="p-6 flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
            </div>
          ) : preAccessAdmins.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">No admin invitations have been sent yet.</p>
              <p className="text-sm text-gray-400 mt-1">Add an admin to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Added On
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {preAccessAdmins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Mail className="flex-shrink-0 h-5 w-5 text-gray-400 mr-3" />
                          <div className="text-sm font-medium text-gray-900">{admin.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="flex-shrink-0 h-5 w-5 text-gray-400 mr-3" />
                          <div className="text-sm text-gray-500">{formatDate(admin.created_at)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => removePreAccessAdmin(admin.id)}
                          className="text-red-600 hover:text-red-900 flex items-center gap-1 ml-auto"
                        >
                          <Ban className="w-4 h-4" />
                          <span>Remove</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
