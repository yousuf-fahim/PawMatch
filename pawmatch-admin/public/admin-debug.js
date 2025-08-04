// Admin panel authentication debugger for Supabase OAuth flow
// Place this in the public folder to access it directly

console.log('🔍 Admin Auth Debug Tool: Loaded');

async function checkAdminAccess() {
  const resultEl = document.getElementById('result');
  const emailEl = document.getElementById('email');
  const statusEl = document.getElementById('status');
  
  try {
    const email = emailEl.value.trim();
    if (!email) {
      statusEl.innerHTML = '<span style="color: red">Please enter an email address</span>';
      return;
    }
    
    statusEl.innerHTML = '<span style="color: blue">Checking admin status...</span>';
    
    const response = await fetch('/api/check-admin?email=' + encodeURIComponent(email), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('🔍 Admin check response:', data);
    
    if (data.isAdmin) {
      resultEl.innerHTML = `
        <div class="alert alert-success">
          <h4>✅ Admin Access Confirmed</h4>
          <p>The email <strong>${email}</strong> has admin privileges.</p>
          <p>Details:</p>
          <pre>${JSON.stringify(data, null, 2)}</pre>
        </div>
      `;
      statusEl.innerHTML = '<span style="color: green">Success! Admin privileges confirmed.</span>';
    } else {
      resultEl.innerHTML = `
        <div class="alert alert-danger">
          <h4>❌ Not an Admin</h4>
          <p>The email <strong>${email}</strong> is not recognized as an admin.</p>
          <p>Details:</p>
          <pre>${JSON.stringify(data, null, 2)}</pre>
        </div>
      `;
      statusEl.innerHTML = '<span style="color: red">Not an admin.</span>';
    }
  } catch (error) {
    console.error('Error checking admin status:', error);
    resultEl.innerHTML = `
      <div class="alert alert-danger">
        <h4>⚠️ Error</h4>
        <p>Failed to check admin status: ${error.message}</p>
      </div>
    `;
    statusEl.innerHTML = '<span style="color: red">Error occurred.</span>';
  }
}

async function checkEnvironment() {
  const envInfoEl = document.getElementById('envInfo');
  
  try {
    envInfoEl.innerHTML = 'Loading environment information...';
    
    const response = await fetch('/api/env-check');
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    envInfoEl.innerHTML = JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Error checking environment:', error);
    envInfoEl.innerHTML = `Error: ${error.message}`;
  }
}

async function checkAuthStatus() {
  const authStatusEl = document.getElementById('authStatus');
  if (!authStatusEl) return;
  
  try {
    authStatusEl.innerHTML = 'Checking authentication status...';
    
    const response = await fetch('/api/auth-status?mode=detailed');
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    authStatusEl.innerHTML = JSON.stringify(data, null, 2);
    
    // Update UI with specific checks
    updateAuthUIWithChecks(data);
  } catch (error) {
    console.error('Error checking auth status:', error);
    authStatusEl.innerHTML = `Error: ${error.message}`;
  }
}

function updateAuthUIWithChecks(data) {
  const checksContainer = document.getElementById('authChecks');
  if (!checksContainer) return;
  
  // Define the checks
  const checks = [
    {
      id: 'check-supabase-url',
      name: 'Supabase URL',
      status: !!data.supabaseUrl,
      message: data.supabaseUrl ? 'Configured correctly' : 'Missing Supabase URL'
    },
    {
      id: 'check-redirect-url',
      name: 'Redirect URL',
      status: !!data.providers?.google?.redirectUrl && data.providers.google.redirectUrl !== 'Not configured',
      message: data.providers?.google?.redirectUrl !== 'Not configured' ? 
        'Redirect URL is set' : 'Missing redirect URL configuration'
    },
    {
      id: 'check-google-client',
      name: 'Google Client ID',
      status: data.providers?.google?.clientId === 'Configured',
      message: data.providers?.google?.clientId === 'Configured' ? 
        'Google Client ID is configured' : 'Missing Google Client ID'
    },
    {
      id: 'check-auth-enabled',
      name: 'Auth Enabled',
      status: data.authEnabled,
      message: data.authEnabled ? 'Authentication is enabled' : 'Authentication is disabled'
    }
  ];
  
  // Generate HTML for checks
  const checksHTML = checks.map(check => `
    <div class="auth-check-item" id="${check.id}">
      <div class="check-icon ${check.status ? 'check-success' : 'check-fail'}">
        ${check.status ? '✓' : '✗'}
      </div>
      <div class="check-details">
        <h4>${check.name}</h4>
        <p>${check.message}</p>
      </div>
    </div>
  `).join('');
  
  checksContainer.innerHTML = checksHTML;
  
  // Add CSS for checks
  if (!document.getElementById('auth-checks-css')) {
    const style = document.createElement('style');
    style.id = 'auth-checks-css';
    style.textContent = `
      .auth-check-item {
        display: flex;
        margin-bottom: 10px;
        padding: 10px;
        border-radius: 4px;
        background-color: #f8f9fa;
      }
      .check-icon {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        margin-right: 10px;
      }
      .check-success {
        background-color: #d4edda;
        color: #155724;
      }
      .check-fail {
        background-color: #f8d7da;
        color: #721c24;
      }
      .check-details h4 {
        margin: 0 0 5px 0;
        font-size: 16px;
      }
      .check-details p {
        margin: 0;
        font-size: 14px;
        color: #6c757d;
      }
    `;
    document.head.appendChild(style);
  }
}

// Initialize when loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Debug tool ready');
  
  // Auto-initialize auth status if the element exists
  if (document.getElementById('authStatus')) {
    checkAuthStatus();
  }
  
  // Auto-initialize environment info if the element exists
  if (document.getElementById('envInfo')) {
    checkEnvironment();
  }
});