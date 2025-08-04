# 🚨 GOOGLE AUTH STILL REDIRECTING TO VERCEL - IMMEDIATE FIX

## The Problem
Google Auth is still redirecting to `https://pawmatch-admin.vercel.app` instead of your mobile app because **Supabase project settings** override the app code.

## 🔥 EXACT STEPS TO FIX THIS NOW

### Step 1: Go to Supabase Dashboard
1. Open: https://supabase.com/dashboard/projects
2. Click on your project: `afxkliyukojjymvfwiyp`
3. Go to **Authentication** → **Settings**

### Step 2: Update Site URL (CRITICAL)
**Current Wrong Setting:**
```
Site URL: https://pawmatch-admin.vercel.app
```

**CHANGE TO:**
```
Site URL: pawmatch://auth/callback
```

### Step 3: Update Additional Redirect URLs
**In the "Additional Redirect URLs" field, add these (copy exactly):**
```
pawmatch://auth/callback,
pawmatch://oauth/callback,
https://pawmatchapp.expo.app/auth/callback,
exp://localhost:8081/--/auth/callback
```

### Step 4: Save Settings
Click **Save** at the bottom of the page.

---

## 🔧 Alternative: Update Google Console Directly

If Supabase doesn't work immediately, also update Google Console:

1. Go to: https://console.developers.google.com
2. Select your project
3. Go to **Credentials** → **OAuth 2.0 Client IDs**
4. Edit your client
5. In **Authorized redirect URIs**, make sure you have:
   ```
   https://afxkliyukojjymvfwiyp.supabase.co/auth/v1/callback
   ```

---

## 🧪 Test After Changes

### Test 1: Clear Supabase Cache
```bash
# Force new auth session
cd /Users/fahim/PawMatch
npx expo start --clear
```

### Test 2: Try Google Sign-In
1. Open your app on phone
2. Tap "Sign in with Google"  
3. Complete Google auth
4. **Should now redirect to your app, NOT Vercel**

---

## 📱 What Should Happen After Fix

**BEFORE (wrong):**
```
Google Auth → https://pawmatch-admin.vercel.app/l?code=... 
```

**AFTER (correct):**
```
Google Auth → pawmatch://auth/callback?code=...
(Opens your mobile app)
```

---

## ⚡ If It Still Doesn't Work

Try this temporary workaround in your app code:

**Force Mobile Redirect:**
```typescript
// In lib/supabase.ts, change line ~156 to:
redirectTo: 'pawmatch://auth/callback', // Force mobile always
```

**Then rebuild:**
```bash
npx expo start --clear
```

---

## 🎯 The Root Cause

The issue is that **Supabase project settings** take priority over app code settings. When you set up the admin panel, it likely set the default redirect URL to the Vercel domain, and that's still being used.

**The Site URL in Supabase Dashboard MUST be changed from Vercel to your mobile app scheme.**

Do the Supabase dashboard update first - it should fix the issue immediately! 🚀
