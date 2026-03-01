# Render Deployment Checklist ✅

Use this checklist to ensure smooth deployment to Render.

## Pre-Deployment (Do Once)

- [ ] Create MongoDB Atlas account and cluster
  - [ ] Create database user
  - [ ] Add IP whitelist: 0.0.0.0/0
  - [ ] Get connection string

- [ ] Create Cloudinary account  
  - [ ] Get Cloud Name
  - [ ] Get API Key
  - [ ] Get API Secret

- [ ] Push code to GitHub
  - [ ] All changes committed
  - [ ] Pushed to main branch
  - [ ] Verify render.yaml is in repository root

## Render Setup

- [ ] Create Render account (render.com)

- [ ] Deploy using Blueprint
  - [ ] New → Blueprint
  - [ ] Connect GitHub repo
  - [ ] Review detected services (should see backend + frontend)

- [ ] Configure Backend Environment Variables
  - [ ] MONGODB_URI (from Atlas)
  - [ ] CLOUDINARY_CLOUD_NAME
  - [ ] CLOUDINARY_API_KEY
  - [ ] CLOUDINARY_API_SECRET
  - [ ] JWT_SECRET (auto-generated)
  - [ ] JWT_REFRESH_SECRET (auto-generated)
  - [ ] FRONTEND_URL (will update after frontend deploys)

- [ ] Configure Frontend Environment Variables
  - [ ] VITE_API_URL (will update after backend deploys)

- [ ] Click "Apply" to start deployment

## Post-Deployment (Important!)

- [ ] Copy backend URL from Render dashboard
  - Format: `https://thriftify-backend.onrender.com`

- [ ] Update Frontend env var
  - [ ] Go to Frontend service
  - [ ] Environment → VITE_API_URL
  - [ ] Paste backend URL
  - [ ] Save changes

- [ ] Copy frontend URL from Render dashboard
  - Format: `https://thriftify-frontend.onrender.com`

- [ ] Update Backend env var
  - [ ] Go to Backend service  
  - [ ] Environment → FRONTEND_URL
  - [ ] Paste frontend URL
  - [ ] Save changes

- [ ] Trigger redeployment
  - [ ] Backend: Manual Deploy → Deploy latest commit
  - [ ] Frontend: Manual Deploy → Deploy latest commit

- [ ] Wait for both services to rebuild (~3-5 minutes)

## Testing

- [ ] Visit frontend URL
- [ ] Test user registration
- [ ] Test user login
- [ ] Test creating a listing (verifies Cloudinary)
- [ ] Test bookmarking
- [ ] Test chat functionality (verifies Socket.io)
- [ ] Test making a purchase/order
- [ ] Test searching listings

## Troubleshooting

If signup/login doesn't work:
- [ ] Check backend logs for database connection errors
- [ ] Verify MongoDB connection string is correct
- [ ] Check MongoDB Atlas Network Access

If images don't upload:
- [ ] Verify all 3 Cloudinary env vars are set
- [ ] Check backend logs for Cloudinary errors
- [ ] Test Cloudinary credentials

If CORS errors occur:
- [ ] Verify FRONTEND_URL is set in backend
- [ ] Check URL has no trailing slash
- [ ] Redeploy backend after updating

If chat doesn't work:
- [ ] Check Socket.io connection in browser console
- [ ] Verify VITE_API_URL is correct in frontend
- [ ] Check backend logs for socket errors

## Monitoring

- [ ] Bookmark Render dashboard URLs
  - Backend logs: https://dashboard.render.com/web/[backend-service-id]
  - Frontend logs: https://dashboard.render.com/static/[frontend-service-id]

- [ ] Monitor first-time page load (may be slow on free tier)
- [ ] Check MongoDB Atlas usage/metrics
- [ ] Check Cloudinary storage usage

## Notes

- Free tier services sleep after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds to wake up
- Consider upgrading to paid tier for production use
- Set up monitoring/alerts for production deployments

---

**Need help?** Check [RENDER_DEPLOY.md](./RENDER_DEPLOY.md) for quick start guide or [DEPLOY.md](./DEPLOY.md) for detailed instructions.
