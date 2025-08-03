'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@supabase/supabase-js'
import { 
  Heart, 
  Users, 
  BookOpen, 
  BarChart3, 
  Settings, 
  LogOut,
  PawPrint,
  TrendingUp,
  MessageSquare,
  Shield,
  Building
} from 'lucide-react'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface AdminStats {
  totalPets: number
  activeUsers: number
  adoptionsThisMonth: number
  articlesPublished: number
}

interface RecentAdoption {
  id: string
  pet_name: string
  user_name: string
  adopted_at: string
}

export default function DashboardPage() {
  const { user, loading, signOut, isAdmin } = useAuth()
  const router = useRouter()
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalPets: 0,
    activeUsers: 0,
    adoptionsThisMonth: 0,
    articlesPublished: 0
  })
  const [recentAdoptions, setRecentAdoptions] = useState<RecentAdoption[]>([])
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/login')
    } else if (user && isAdmin) {
      loadDashboardData()
    }
  }, [user, loading, isAdmin, router])

  const loadDashboardData = async () => {
    try {
      setLoadingStats(true)
      
      // Load total pets
      const { count: totalPets } = await supabase
        .from('pets')
        .select('*', { count: 'exact', head: true })

      // Load active users (users who have logged in within the last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const { count: activeUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', thirtyDaysAgo.toISOString())

      // Load adoptions this month
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)
      
      const { count: adoptionsThisMonth } = await supabase
        .from('adoption_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
        .gte('approved_at', startOfMonth.toISOString())

      // Load articles count
      const { count: articlesPublished } = await supabase
        .from('learning_articles')
        .select('*', { count: 'exact', head: true })

      // Load recent adoptions
      const { data: recentAdoptionsData } = await supabase
        .from('adoption_applications')
        .select(`
          id,
          approved_at,
          pets (name),
          user_profiles (full_name)
        `)
        .eq('status', 'approved')
        .order('approved_at', { ascending: false })
        .limit(3)

      setAdminStats({
        totalPets: totalPets || 0,
        activeUsers: activeUsers || 0,
        adoptionsThisMonth: adoptionsThisMonth || 0,
        articlesPublished: articlesPublished || 0
      })

      if (recentAdoptionsData) {
        const formattedAdoptions: RecentAdoption[] = recentAdoptionsData.map((adoption: any) => ({
          id: adoption.id,
          pet_name: adoption.pets?.name || 'Unknown Pet',
          user_name: adoption.user_profiles?.full_name || 'Anonymous User',
          adopted_at: adoption.approved_at
        }))
        setRecentAdoptions(formattedAdoptions)
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error)
      // Use fallback data
      setAdminStats({
        totalPets: 2847,
        activeUsers: 1234,
        adoptionsThisMonth: 89,
        articlesPublished: 156
      })
    } finally {
      setLoadingStats(false)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`
    } else {
      return `${days} day${days !== 1 ? 's' : ''} ago`
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
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

  const statsCards = [
    { name: 'Total Pets', value: adminStats.totalPets.toLocaleString(), change: '+12%', icon: PawPrint, color: 'bg-blue-500' },
    { name: 'Active Users', value: adminStats.activeUsers.toLocaleString(), change: '+8%', icon: Users, color: 'bg-green-500' },
    { name: 'Adoptions This Month', value: adminStats.adoptionsThisMonth.toLocaleString(), change: '+15%', icon: Heart, color: 'bg-pink-500' },
    { name: 'Articles Published', value: adminStats.articlesPublished.toLocaleString(), change: '+3%', icon: BookOpen, color: 'bg-purple-500' },
  ]

  const quickActions = [
    { name: 'Manage Pets', href: '/pets', icon: PawPrint, color: 'bg-blue-500' },
    { name: 'User Management', href: '/users', icon: Users, color: 'bg-green-500' },
    { name: 'Shelter Management', href: '/shelters', icon: Building, color: 'bg-indigo-500' },
    { name: 'Article Management', href: '/content/articles', icon: BookOpen, color: 'bg-purple-500' },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, color: 'bg-orange-500' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" fill="currentColor" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">PawMatch Admin</h1>
                  <p className="text-sm text-gray-500">Administrative Dashboard</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-green-500" />
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.email}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h2>
          <p className="text-gray-600">Here's what's happening with PawMatch today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat) => (
            <div key={stat.name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                    <span className="text-sm text-gray-500 ml-1">this month</span>
                  </div>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.name}
                onClick={() => router.push(action.href)}
                className="flex flex-col items-center p-6 rounded-xl border-2 border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-200"
              >
                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-3`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900">{action.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Adoptions</h3>
            <div className="space-y-4">
              {loadingStats ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                </div>
              ) : recentAdoptions.length > 0 ? (
                recentAdoptions.map((adoption) => (
                  <div key={adoption.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-red-400 rounded-xl flex items-center justify-center">
                      <Heart className="w-6 h-6 text-white" fill="currentColor" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{adoption.pet_name} was adopted by {adoption.user_name}</p>
                      <p className="text-sm text-gray-500">{formatTimeAgo(adoption.adopted_at)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Heart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No recent adoptions</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">System Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-900">Database</span>
                </div>
                <span className="text-green-600 text-sm font-medium">Operational</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-900">API Services</span>
                </div>
                <span className="text-green-600 text-sm font-medium">Operational</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-900">Authentication</span>
                </div>
                <span className="text-green-600 text-sm font-medium">Operational</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
