# Frontend Code Updates Needed for Production

## ⚠️ Important: Socket.io Configuration

When deploying to Render with separate backend and frontend URLs, you need to update the Socket.io connection in your frontend code.

### Files to Update

#### 1. ChatPage.jsx

**Current code (lines ~39-47):**
```jsx
const s = io(window.location.origin, {
  withCredentials: true,
  auth: {},
});
```

**Update to:**
```jsx
import { getSocketUrl } from '@/lib/api';

// Inside useEffect
const s = io(getSocketUrl(), {
  withCredentials: true,
  auth: {},
});
```

This ensures the frontend connects to the correct backend URL in production.

### Why This Change is Needed

- **Development**: Frontend (localhost:5173) and Backend (localhost:3000) are on different ports, but Vite proxy handles requests
- **Production on Render**: Frontend and Backend have completely different domains:
  - Frontend: `https://thriftify-frontend.onrender.com`
  - Backend: `https://thriftify-backend.onrender.com`
  
Using `window.location.origin` would try to connect to the frontend URL, which won't work. The `getSocketUrl()` helper uses the `VITE_API_URL` environment variable to connect to the correct backend.

### Testing

After making this change:

1. Test locally first (should still work with Vite proxy)
2. Deploy to Render
3. Open browser console on your frontend
4. Go to the chat page
5. Check for Socket.io connection success messages
6. Send a test message to verify real-time functionality

### Other Considerations

If you have Socket.io connections in other components, apply the same fix:
- Import `getSocketUrl` from `@/lib/api`
- Use it instead of `window.location.origin`

## Optional: Use Axios Instance for API Calls

While not required for deployment, you can optionally update your API calls to use the centralized axios instance:

```jsx
// Instead of:
import axios from 'axios';
axios.get('/api/v1/listings', { withCredentials: true });

// Use:
import api from '@/lib/api';
api.get('/api/v1/listings');
```

Benefits:
- Centralized configuration
- Automatic base URL handling
- Consistent error handling
- Easier to add interceptors later

This is optional because the Vite proxy in development and VITE_API_URL in production will handle URL resolution either way.
