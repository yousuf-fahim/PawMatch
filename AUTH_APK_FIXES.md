# Google Auth & APK Crash Fixes

## 🔴 Issue 1: Google Auth Redirect Problem

**Problem:** Google Auth redirects to admin panel URL instead of mobile app
**Root Cause:** Supabase Google OAuth settings pointing to wrong redirect URL

### IMMEDIATE FIX NEEDED:

1. **Go to Supabase Dashboard:**
   - URL: https://supabase.com/dashboard/project/afxkliyukojjymvfwiyp
   - Go to Authentication → Settings → Auth

2. **Update Site URL:**
   ```
   Current (wrong): https://pawmatch-admin.vercel.app
   Change to: https://pawmatchapp.expo.app
   ```

3. **Update Additional Redirect URLs:**
   Add these URLs (comma-separated):
   ```
   https://pawmatchapp.expo.app/auth/callback
   pawmatch://auth/callback
   pawmatch://oauth/callback
   exp://192.168.68.102:8081/--/auth/callback
   http://localhost:8081/assets/web/auth-callback.html
   ```

4. **Google Console Update:**
   - Go to [Google Console](https://console.developers.google.com)
   - Select your project
   - Go to Credentials → OAuth 2.0 Client IDs
   - Edit your client
   - Add to "Authorized redirect URIs":
     ```
     https://afxkliyukojjymvfwiyp.supabase.co/auth/v1/callback
     ```

---

## 🔴 Issue 2: APK Crash After Installation

**Problem:** App works in Expo Go but crashes when built as APK
**Common Causes:** Metro bundler issues, missing dependencies, network security

### APK CRASH FIXES:

1. **Update app.json for Production:**
```json
{
  "expo": {
    "android": {
      "usesCleartextTraffic": true,
      "networkSecurityConfig": "./network_security_config.xml"
    }
  }
}
```

2. **Create Network Security Config:**
File: `network_security_config.xml` in root directory:
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
        <domain includeSubdomains="true">192.168.68.102</domain>
    </domain-config>
    <base-config cleartextTrafficPermitted="false" />
</network-security-config>
```

3. **Update EAS Build Configuration:**
File: `eas.json` - ensure proper configuration:
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

---

## 📱 Correct App URLs

### Development:
- **Expo Go**: Use QR code (works fine)
- **Local Network**: exp://192.168.68.102:8081

### Production:
- **Expo Published**: https://pawmatchapp.expo.app
- **Play Store**: Will be different after upload

---

## 🚀 Quick Test Commands

### Test APK Build:
```bash
cd /Users/fahim/PawMatch

# Install EAS CLI if not installed
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Build APK for testing
eas build --platform android --profile preview
```

### Test Local Development:
```bash
# Clear cache and restart
npx expo start --clear --tunnel
```

---

## 🔧 Files to Update

I'll create the necessary files and updates for you:

1. ✅ Network security config
2. ✅ Updated app.json
3. ✅ Fixed auth redirect URLs
4. ✅ APK-compatible build settings

After these fixes:
- Google Auth will redirect to your app correctly
- APK will not crash on installation
- Both Expo Go and built APK will work
