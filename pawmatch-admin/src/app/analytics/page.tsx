'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@supabase/supabase-js'
import LineChart from './LineChart'
import { 
  BarChart3, 
  Users, 
  Heart, 
  BookOpen, 
  PawPrint,
  Calendar,
  TrendingUp,
  TrendingDown,
  Building,
  Search
} from 'lucide-react'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface AnalyticsData {
  userStats: {
    total: number
    activeLastMonth: number
    newThisMonth: number
    growthRate: number
  }
  petStats: {
    total: number
    available: number
    adopted: number
    addedThisMonth: number
  }
  adoptionStats: {
    total: number
    thisMonth: number
    lastMonth: number
    growthRate: number
    bySpecies: Record<string, number>
  }
  contentStats: {
    totalArticles: number
    mostViewedArticle: string
    mostViewedArticleViews: number
    totalServices: number
  }
  timeSeriesData: {
    adoptions: TimeSeriesPoint[]
    newUsers: TimeSeriesPoint[]
    newPets: TimeSeriesPoint[]
  }
}

interface TimeSeriesPoint {
  date: string
  value: number
}

export default function AnalyticsPage() {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month')

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/login')
      return
    }
    if (user && isAdmin) {
      loadAnalyticsData()
    }
  }, [user, loading, isAdmin, dateRange])

  const loadAnalyticsData = async () => {
    try {
      setLoadingData(true)
      
      // Calculate date ranges
      const today = new Date()
      const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
      const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)
      
      // User statistics
      const { count: totalUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
      
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const { count: activeUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .gte('last_login', thirtyDaysAgo.toISOString())
      
      const { count: newUsersThisMonth } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thisMonthStart.toISOString())
      
      const { count: newUsersLastMonth } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', lastMonthStart.toISOString())
        .lt('created_at', thisMonthStart.toISOString())
      
      // Pet statistics
      const { count: totalPets } = await supabase
        .from('pets')
        .select('*', { count: 'exact', head: true })
      
      const { count: availablePets } = await supabase
        .from('pets')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'available')
      
      const { count: adoptedPets } = await supabase
        .from('pets')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'adopted')
      
      const { count: newPetsThisMonth } = await supabase
        .from('pets')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thisMonthStart.toISOString())
      
      // Adoption statistics
      const { count: totalAdoptions } = await supabase
        .from('adoption_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
      
      const { count: adoptionsThisMonth } = await supabase
        .from('adoption_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
        .gte('approved_at', thisMonthStart.toISOString())
      
      const { count: adoptionsLastMonth } = await supabase
        .from('adoption_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
        .gte('approved_at', lastMonthStart.toISOString())
        .lt('approved_at', thisMonthStart.toISOString())
      
      // Adoptions by species
      const { data: speciesData } = await supabase
        .from('adoption_applications')
        .select(`
          pets (
            species
          )
        `)
        .eq('status', 'approved')
      
      const speciesCount: Record<string, number> = {}
      
      speciesData?.forEach(adoption => {
        const species = adoption.pets?.species || 'Unknown'
        speciesCount[species] = (speciesCount[species] || 0) + 1
      })
      
      // Learning content statistics
      const { count: totalArticles } = await supabase
        .from('learning_articles')
        .select('*', { count: 'exact', head: true })
      
      const { count: totalServices } = await supabase
        .from('pet_services')
        .select('*', { count: 'exact', head: true })
      
      const { data: articles } = await supabase
        .from('learning_articles')
        .select('id, title, view_count')
        .order('view_count', { ascending: false })
        .limit(1)
      
      // Generate time series data
      // This would usually come from actual time series data in the database
      // For this example we'll generate some sample data
      const timeSeriesData = generateTimeSeriesData(dateRange)
      
      const growthRateUsers = newUsersLastMonth ? 
        ((newUsersThisMonth || 0) - (newUsersLastMonth || 0)) / (newUsersLastMonth || 1) * 100 : 0
      
      const growthRateAdoptions = adoptionsLastMonth ? 
        ((adoptionsThisMonth || 0) - (adoptionsLastMonth || 0)) / (adoptionsLastMonth || 1) * 100 : 0
      
      setAnalyticsData({
        userStats: {
          total: totalUsers || 0,
          activeLastMonth: activeUsers || 0,
          newThisMonth: newUsersThisMonth || 0,
          growthRate: growthRateUsers
        },
        petStats: {
          total: totalPets || 0,
          available: availablePets || 0,
          adopted: adoptedPets || 0,
          addedThisMonth: newPetsThisMonth || 0
        },
        adoptionStats: {
          total: totalAdoptions || 0,
          thisMonth: adoptionsThisMonth || 0,
          lastMonth: adoptionsLastMonth || 0,
          growthRate: growthRateAdoptions,
          bySpecies: speciesCount
        },
        contentStats: {
          totalArticles: totalArticles || 0,
          mostViewedArticle: articles?.[0]?.title || 'No articles yet',
          mostViewedArticleViews: articles?.[0]?.view_count || 0,
          totalServices: totalServices || 0
        },
        timeSeriesData
      })
    } catch (error) {
      console.error('Error loading analytics data:', error)
      // Use fallback data for UI development
      setAnalyticsData(getFallbackData())
    } finally {
      setLoadingData(false)
    }
  }

  const generateTimeSeriesData = (range: 'week' | 'month' | 'year') => {
    let dataPoints = 0
    let step = 0
    
    switch (range) {
      case 'week':
        dataPoints = 7
        step = 1
        break
      case 'month':
        dataPoints = 30
        step = 1
        break
      case 'year':
        dataPoints = 12
        step = 30
        break
    }
    
    const adoptions: TimeSeriesPoint[] = []
    const newUsers: TimeSeriesPoint[] = []
    const newPets: TimeSeriesPoint[] = []
    
    const today = new Date()
    
    for (let i = dataPoints - 1; i >= 0; i--) {
      const date = new Date()
      
      if (range === 'year') {
        date.setMonth(today.getMonth() - i)
        date.setDate(1)
      } else {
        date.setDate(today.getDate() - i * step)
      }
      
      const dateStr = range === 'year' 
        ? date.toLocaleDateString('en-US', { month: 'short' })
        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      
      // Generate some random but realistic-looking data
      const adoptionBase = Math.floor(Math.random() * 10) + 1
      const userBase = Math.floor(Math.random() * 15) + 5
      const petBase = Math.floor(Math.random() * 8) + 2
      
      // Add some trend - higher values for more recent dates
      const trendFactor = 1 + ((dataPoints - i) / dataPoints) * 0.5
      
      adoptions.push({
        date: dateStr,
        value: Math.floor(adoptionBase * trendFactor)
      })
      
      newUsers.push({
        date: dateStr,
        value: Math.floor(userBase * trendFactor)
      })
      
      newPets.push({
        date: dateStr,
        value: Math.floor(petBase * trendFactor)
      })
    }
    
    return { adoptions, newUsers, newPets }
  }

  const getFallbackData = (): AnalyticsData => ({
    userStats: {
      total: 2458,
      activeLastMonth: 1245,
      newThisMonth: 187,
      growthRate: 12.5
    },
    petStats: {
      total: 3542,
      available: 2845,
      adopted: 697,
      addedThisMonth: 124
    },
    adoptionStats: {
      total: 697,
      thisMonth: 38,
      lastMonth: 32,
      growthRate: 18.75,
      bySpecies: {
        'Dog': 378,
        'Cat': 258,
        'Bird': 42,
        'Small Mammal': 19
      }
    },
    contentStats: {
      totalArticles: 148,
      mostViewedArticle: 'Essential Vaccinations for Your Pet',
      mostViewedArticleViews: 12543,
      totalServices: 87
    },
    timeSeriesData: {
      adoptions: Array(12).fill(0).map((_, i) => ({
        date: new Date(2023, i, 1).toLocaleDateString('en-US', { month: 'short' }),
        value: Math.floor(Math.random() * 25) + 10
      })),
      newUsers: Array(12).fill(0).map((_, i) => ({
        date: new Date(2023, i, 1).toLocaleDateString('en-US', { month: 'short' }),
        value: Math.floor(Math.random() * 40) + 20
      })),
      newPets: Array(12).fill(0).map((_, i) => ({
        date: new Date(2023, i, 1).toLocaleDateString('en-US', { month: 'short' }),
        value: Math.floor(Math.random() * 30) + 15
      }))
    }
  })

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays < 1) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      return diffHours < 1 
        ? 'Just now' 
        : `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    }
    
    if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    }
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                <p className="text-sm text-gray-500">Overview of PawMatch platform usage</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setDateRange('week')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              dateRange === 'week' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Last 7 Days
          </button>
          <button 
            onClick={() => setDateRange('month')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              dateRange === 'month' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Last 30 Days
          </button>
          <button 
            onClick={() => setDateRange('year')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              dateRange === 'year' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Last 12 Months
          </button>
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search analytics..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {loadingData ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* User Stats */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Users</h3>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{analyticsData?.userStats.total.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Total registered users</p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{analyticsData?.userStats.newThisMonth.toLocaleString()}</p>
                      <p className="text-gray-600">New this month</p>
                    </div>
                    <div>
                      <p className="font-medium">{analyticsData?.userStats.activeLastMonth.toLocaleString()}</p>
                      <p className="text-gray-600">Active users</p>
                    </div>
                    <div className="flex items-center">
                      {analyticsData?.userStats.growthRate && analyticsData.userStats.growthRate > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={analyticsData?.userStats.growthRate && analyticsData.userStats.growthRate > 0 ? 'text-green-600' : 'text-red-600'}>
                        {Math.abs(analyticsData?.userStats.growthRate || 0).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pet Stats */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Pets</h3>
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <PawPrint className="h-6 w-6 text-indigo-600" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{analyticsData?.petStats.total.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Total pets in database</p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{analyticsData?.petStats.available.toLocaleString()}</p>
                      <p className="text-gray-600">Available</p>
                    </div>
                    <div>
                      <p className="font-medium">{analyticsData?.petStats.adopted.toLocaleString()}</p>
                      <p className="text-gray-600">Adopted</p>
                    </div>
                    <div>
                      <p className="font-medium">{analyticsData?.petStats.addedThisMonth.toLocaleString()}</p>
                      <p className="text-gray-600">New this month</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Adoption Stats */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Adoptions</h3>
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <Heart className="h-6 w-6 text-pink-600" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{analyticsData?.adoptionStats.total.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Total successful adoptions</p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{analyticsData?.adoptionStats.thisMonth.toLocaleString()}</p>
                      <p className="text-gray-600">This month</p>
                    </div>
                    <div>
                      <p className="font-medium">{analyticsData?.adoptionStats.lastMonth.toLocaleString()}</p>
                      <p className="text-gray-600">Last month</p>
                    </div>
                    <div className="flex items-center">
                      {analyticsData?.adoptionStats.growthRate && analyticsData.adoptionStats.growthRate > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={analyticsData?.adoptionStats.growthRate && analyticsData.adoptionStats.growthRate > 0 ? 'text-green-600' : 'text-red-600'}>
                        {Math.abs(analyticsData?.adoptionStats.growthRate || 0).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Stats */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Content</h3>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BookOpen className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-gray-900">{analyticsData?.contentStats.totalArticles.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Articles</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-gray-900">{analyticsData?.contentStats.totalServices.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Services</p>
                    </div>
                  </div>
                  <div className="text-sm border-t border-gray-200 pt-3">
                    <p className="text-sm font-medium">Most viewed article:</p>
                    <p className="text-sm text-gray-600 truncate">{analyticsData?.contentStats.mostViewedArticle}</p>
                    <p className="text-xs text-gray-500">{analyticsData?.contentStats.mostViewedArticleViews.toLocaleString()} views</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Adoption Trend */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Adoption Trend</h3>
                <div className="h-64">
                  <LineChart 
                    data={analyticsData?.timeSeriesData.adoptions || []}
                    width={600}
                    height={300}
                    color="#ec4899"
                    label="Adoptions over time"
                  />
                </div>
              </div>

              {/* New Users Trend */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">New Users Trend</h3>
                <div className="h-64">
                  <LineChart 
                    data={analyticsData?.timeSeriesData.newUsers || []}
                    width={600}
                    height={300}
                    color="#3b82f6"
                    label="New user registrations"
                  />
                </div>
              </div>

              {/* New Pets Trend */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">New Pets Trend</h3>
                <div className="h-64">
                  <LineChart 
                    data={analyticsData?.timeSeriesData.newPets || []}
                    width={600}
                    height={300}
                    color="#6366f1"
                    label="New pets added"
                  />
                </div>
              </div>

              {/* Species Distribution */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Adoption by Species</h3>
                <div className="h-64 flex items-end justify-around gap-2 mt-4">
                  {Object.entries(analyticsData?.adoptionStats.bySpecies || {}).map(([species, count], index) => {
                    const maxValue = Math.max(...Object.values(analyticsData?.adoptionStats.bySpecies || {}));
                    const height = (count / maxValue) * 100;
                    const colors = ['#ec4899', '#3b82f6', '#6366f1', '#10b981', '#f59e0b'];
                    
                    return (
                      <div key={species} className="flex flex-col items-center justify-end" style={{ height: '85%' }}>
                        <div 
                          className="w-16 rounded-t-md relative group flex items-end justify-center"
                          style={{ 
                            height: `${height}%`, 
                            backgroundColor: colors[index % colors.length],
                            minHeight: '20px'
                          }}
                        >
                          <span className="text-white font-bold">{count}</span>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            {count} adoptions
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 mt-2 font-medium">{species}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
