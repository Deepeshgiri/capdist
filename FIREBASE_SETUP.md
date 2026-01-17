# Firebase Analytics Setup

## Quick Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "fancyweb-profile")
4. Disable Google Analytics if you don't need it (or enable for more features)
5. Click "Create project"

### 2. Register Web App
1. In your Firebase project, click the **Web icon** (</>)
2. Enter app nickname (e.g., "FancyWeb")
3. Check "Also set up Firebase Hosting" (optional)
4. Click "Register app"

### 3. Get Configuration
Copy the Firebase configuration object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456",
  measurementId: "G-XXXXXXXXXX"
};
```

### 4. Update profile.html
Open `profile.html` and replace the Firebase configuration:

```javascript
// Find this section in profile.html
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",  // Replace with your actual values
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};
```

### 5. Enable Analytics
1. In Firebase Console, go to **Analytics** > **Dashboard**
2. Analytics will automatically start tracking once configured
3. Wait 24-48 hours for initial data to appear

## What Gets Tracked

### Automatic Events
- **page_view**: Every time someone visits your profile
- **first_visit**: First time a user visits
- **session_start**: When a user starts a session

### Custom Events (Already Implemented)
The code logs page views with:
- Page title
- Page location (full URL)
- Page path

## View Analytics

### Real-time Data
1. Go to Firebase Console
2. Navigate to **Analytics** > **Realtime**
3. See live visitors and their activity

### Historical Data
1. Go to **Analytics** > **Dashboard**
2. View metrics like:
   - Total users
   - Active users
   - Page views
   - Session duration
   - User demographics (if enabled)

## Advanced Tracking (Optional)

### Track Button Clicks
Add to `script.js`:

```javascript
// Track social link clicks
document.querySelectorAll('.social-link').forEach(link => {
    link.addEventListener('click', (e) => {
        analytics.logEvent('social_click', {
            platform: e.currentTarget.getAttribute('data-tooltip'),
            url: e.currentTarget.href
        });
    });
});
```

### Track Video Plays
```javascript
bgVideo.addEventListener('play', () => {
    analytics.logEvent('video_play', {
        video_url: bgVideo.src
    });
});
```

### Track Settings Changes
```javascript
function setMode(mode) {
    // ... existing code ...
    analytics.logEvent('mode_change', {
        mode: mode
    });
}
```

## Privacy & GDPR

### Add Privacy Notice
Consider adding a cookie/privacy notice:

```html
<div class="privacy-notice">
    This site uses Firebase Analytics to improve user experience.
    <button onclick="acceptAnalytics()">Accept</button>
</div>
```

### Disable Analytics (Optional)
If user opts out:

```javascript
firebase.analytics().setAnalyticsCollectionEnabled(false);
```

## Troubleshooting

### Analytics Not Working
1. **Check Console**: Open browser DevTools > Console for errors
2. **Verify Config**: Ensure all Firebase config values are correct
3. **Check Domain**: Make sure your domain is authorized in Firebase Console
4. **Wait**: Analytics data can take 24-48 hours to appear

### Common Issues

**Issue**: "Firebase: No Firebase App '[DEFAULT]' has been created"
**Solution**: Make sure Firebase is initialized before calling analytics

**Issue**: Analytics not tracking
**Solution**: 
- Clear browser cache
- Check if ad blockers are blocking Firebase
- Verify measurementId is correct

**Issue**: CORS errors
**Solution**: Add your domain to Firebase authorized domains:
1. Firebase Console > Authentication > Settings
2. Add your domain to "Authorized domains"

## Testing

### Test Locally
1. Open profile.html in browser
2. Open DevTools > Console
3. Look for: "Firebase Analytics initialized"
4. Check Network tab for analytics requests

### Test Events
```javascript
// In browser console
firebase.analytics().logEvent('test_event', {
    test_param: 'test_value'
});
```

## Security

### API Key Security
- Firebase API keys are safe to expose in client-side code
- They identify your Firebase project, not authenticate users
- Restrict API key usage in Google Cloud Console for production

### Best Practices
1. Enable App Check for production
2. Set up security rules
3. Monitor usage in Firebase Console
4. Set up budget alerts

## Cost

Firebase Analytics is **FREE** with generous limits:
- Unlimited events
- Unlimited users
- 500 distinct events
- 25 user properties

## Resources

- [Firebase Analytics Docs](https://firebase.google.com/docs/analytics)
- [Firebase Console](https://console.firebase.google.com/)
- [Analytics Events Reference](https://firebase.google.com/docs/reference/js/analytics)

---

**Note**: Replace all placeholder values with your actual Firebase configuration!
