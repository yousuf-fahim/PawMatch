export default function TestPage() {
  return (
    <div>
      <h1>Test Page</h1>
      <p>If you can see this, the admin panel is working!</p>
      <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set'}</p>
      <p>Supabase Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}</p>
    </div>
  )
}
