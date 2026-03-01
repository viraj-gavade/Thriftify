# 🚀 Quick Start Guide for Render Deployment

## Option 1: Blueprint Deployment (Recommended - Easiest)

This is the fastest way to deploy both services at once.

### Steps:

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Render deployment"
   git push origin main
   ```

2. **Go to Render Dashboard**
   - Visit https://dashboard.render.com/
   - Click "New +" → "Blueprint"

3. **Connect Repository**
   - Select your GitHub repository
   - Render will auto-detect `render.yaml`
   - Click "Apply"

4. **Set Environment Variables**
   
   During setup, you'll need to provide:
   
   **For Backend:**
   - `MONGODB_URI` - Get from MongoDB Atlas
   - `CLOUDINARY_CLOUD_NAME` - Get from Cloudinary
   - `CLOUDINARY_API_KEY` - Get from Cloudinary  
   - `CLOUDINARY_API_SECRET` - Get from Cloudinary
   
   (JWT secrets will be auto-generated)

5. **Wait for Deployment**
   - Backend and Frontend will deploy automatically
   - This takes 5-10 minutes

6. **Update URLs** (Important!)
   
   After deployment completes:
   - Copy your backend URL (e.g., `https://thriftify-backend.onrender.com`)
   - Update **Frontend** environment variable `VITE_API_URL` with this URL
   - Copy your frontend URL (e.g., `https://thriftify-frontend.onrender.com`)  
   - Update **Backend** environment variable `FRONTEND_URL` with this URL
   - Click "Manual Deploy" → "Deploy latest commit" on both services

## MongoDB Atlas Setup

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free M0 cluster
3. Create Database Access user (username + password)
4. Network Access: Add IP `0.0.0.0/0` (allow all)
5. Connect → Get connection string
6. Format: `mongodb+srv://username:password@cluster.xxx.mongodb.net/thriftify`

## Cloudinary Setup

1. Go to https://cloudinary.com/users/register_free
2. Sign up for free account
3. Dashboard → Copy:
   - Cloud Name
   - API Key  
   - API Secret

## Testing Your Deployment

1. Visit your frontend URL
2. Try signing up/logging in
3. Test creating a listing (uploads image to Cloudinary)
4. Test the chat feature

## Common Issues

### "Cannot connect to database"
- Check MongoDB Atlas Network Access allows 0.0.0.0/0
- Verify connection string has correct username/password

### "CORS error"
- Make sure `FRONTEND_URL` is set correctly in backend
- Redeploy backend after updating

### "Images not uploading"
- Verify all 3 Cloudinary env vars are set correctly
- Check Cloudinary dashboard for quota

### "Site loads slowly"
- Normal on free tier (services sleep after 15 min idle)
- First request wakes service (takes 30-60 seconds)

## 📝 For Detailed Instructions

See [DEPLOY.md](./DEPLOY.md) for comprehensive deployment guide.

## 💰 Costs

- **Render Free Tier**: $0 (750 hours/month)
- **MongoDB Atlas Free**: $0 (512MB storage)  
- **Cloudinary Free**: $0 (25GB storage, 25GB bandwidth/month)

All services used are completely free! 🎉
