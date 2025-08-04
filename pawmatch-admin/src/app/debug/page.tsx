'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'

export default function DebugPage() {
  const [envInfo, setEnvInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkEnvironment = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/env-check')
      const data = await res.json()
      setEnvInfo(data)
    } catch (error) {
      console.error('Error checking environment:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Load environment on mount
    checkEnvironment()
  }, [])

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      {/* Include the debug script */}
      <Script src="/admin-debug.js" strategy="afterInteractive" />
      
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-pink-500 to-orange-500 text-white p-6 rounded-lg shadow-lg mb-8">
          <h1 className="text-3xl font-bold mb-2">PawMatch Admin Debug Console</h1>
          <p className="opacity-90">
            Use this page to troubleshoot authentication and environment issues
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Google OAuth Debug</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Authentication Redirect URLs</h3>
            <p className="text-gray-600 mb-3">
              Make sure these redirect URLs are configured in your Google OAuth credentials AND in your Supabase dashboard:
            </p>
            <div className="bg-gray-100 p-3 rounded-md">
              <h4 className="font-medium mb-2">Required Redirect URLs:</h4>
              <ul className="list-disc pl-5 space-y-2">
                <li><code className="bg-gray-200 px-2 py-1 rounded text-sm">https://afxkliyukojjymvfwiyp.supabase.co/auth/v1/callback</code></li>
                <li><code className="bg-gray-200 px-2 py-1 rounded text-sm">http://localhost:3000/auth/callback</code> <span className="text-green-600 text-xs">(Admin Panel)</span></li>
                <li><code className="bg-gray-200 px-2 py-1 rounded text-sm">http://localhost:8081/auth-processor.html</code> <span className="text-blue-600 text-xs">(Expo App)</span></li>
              </ul>
              <div className="mt-3 p-2 bg-yellow-100 rounded text-sm">
                <strong>Note:</strong> Port 3000 is reserved for the admin panel only. The Expo app will not redirect to this port.
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Admin Access Check</h3>
            <p className="text-gray-600 mb-3">
              Verify if an email address has admin access privileges:
            </p>
            <div className="flex gap-3 mb-2">
              <input 
                type="email" 
                id="email" 
                defaultValue="pawfect.mew@gmail.com"
                placeholder="Enter email address" 
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <button 
                onClick={() => {
                  // @ts-ignore - This function is defined in the external admin-debug.js file
                  window.checkAdminAccess?.()
                }}
                className="bg-pink-600 hover:bg-pink-700 text-white px-5 py-2 rounded-md transition-colors"
              >
                Check Access
              </button>
            </div>
            <p id="status" className="text-sm min-h-[1.5rem]"></p>
            <div id="result" className="mt-3"></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Authentication Status</h2>
          
          <div className="mb-4">
            <button 
              onClick={() => {
                // @ts-ignore - This function is defined in the external admin-debug.js file
                window.checkAuthStatus?.()
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Check Auth Configuration
            </button>
          </div>
          
          <div className="space-y-4">
            <div id="authChecks" className="mb-4"></div>
            
            <div className="bg-gray-100 p-4 rounded-md">
              <h3 className="text-lg font-semibold mb-2 text-gray-700">Authentication Details</h3>
              <pre id="authStatus" className="text-sm overflow-auto max-h-60 p-2 bg-gray-200 rounded">
                Click "Check Auth Configuration" to load authentication information...
              </pre>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Environment Variables</h2>
          
          <div className="mb-4">
            <button 
              onClick={checkEnvironment}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors disabled:bg-blue-400"
            >
              {loading ? 'Loading...' : 'Refresh Environment Info'}
            </button>
          </div>
          
          {envInfo ? (
            <div className="bg-gray-100 p-4 rounded-md">
              <table className="w-full">
                <tbody>
                  {Object.entries(envInfo).map(([key, value]: [string, any]) => (
                    <tr key={key} className="border-b border-gray-200 last:border-0">
                      <td className="py-3 font-medium text-gray-900">{key}</td>
                      <td className="py-3 text-gray-700">
                        {typeof value === 'string' && (
                          value.includes('✓') ? 
                            <span className="text-green-600">{value}</span> : 
                            value.includes('✗') ? 
                              <span className="text-red-600">{value}</span> : 
                              value
                        )}
                        {typeof value !== 'string' && JSON.stringify(value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-gray-500">Loading environment information...</div>
          )}
        </div>
      </div>
    </div>
  )
}
