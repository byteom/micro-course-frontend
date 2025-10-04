# MicroCourses Frontend - Render Deployment Guide

## 🚀 Deploy Frontend to Render

### Prerequisites
1. Backend deployed and running (https://micorcourses-backend.onrender.com)
2. Render account
3. GitHub repository with your code

### Step 1: Deploy to Render

#### Option A: Using Render Dashboard
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Static Site"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `microcourses-frontend`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
   - **Node Version**: `18` or higher

#### Option B: Using render.yaml (Recommended)
1. Push your code to GitHub with the `render.yaml` file
2. Go to Render Dashboard
3. Click "New +" → "Blueprint"
4. Connect your repository
5. Render will automatically detect and use the `render.yaml` configuration

### Step 2: Set Environment Variables (Optional)
The frontend is configured to use the production backend by default. You can optionally set:

```
VITE_API_BASE_URL=https://your-backend-domain.com/api
VITE_NODE_ENV=production
```

**Note:** If `VITE_API_BASE_URL` is not set, it will automatically use the production backend at `https://micorcourses-backend.onrender.com/api`.

### Step 3: Deploy
1. Click "Deploy" or push to your main branch
2. Wait for deployment to complete
3. Your frontend will be available at: `https://your-app-name.onrender.com`

### Step 4: Update Backend CORS
After deploying your frontend, update the backend CORS settings:

1. Go to your backend service in Render
2. Update the CORS origin to include your frontend URL
3. Or update the `app.js` file with your actual frontend domain

### Testing
1. Visit your deployed frontend URL
2. Test user registration/login
3. Test course browsing and enrollment
4. Check browser console for any API errors

### Troubleshooting
- Check Render build logs if deployment fails
- Ensure all environment variables are set
- Verify backend API is accessible
- Check CORS settings if API calls fail
- Monitor browser console for errors

### Security Best Practices
- ✅ **Never commit .env files** to version control
- ✅ **Use environment variables** for all sensitive configuration
- ✅ **Always use HTTPS** in production
- ✅ **Keep API URLs private** - don't expose them in code
- ✅ **Use strong JWT secrets** for authentication
- ✅ **Enable CORS properly** for your domain only
- ✅ **Monitor API usage** and set up rate limiting

### Production Notes
- Render free tier has sleep mode for static sites too
- Consider using a CDN for better performance
- Set up proper error monitoring
- Configure custom domain if needed
- Use environment variables for all configuration
