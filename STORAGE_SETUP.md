# Whop Storage Setup Guide

This guide explains how to set up persistent storage for your video experience app using Whop's storage API.

## 🚀 Quick Setup

### 1. Get Your Whop API Key

1. Go to [Whop Settings > API](https://whop.com/settings/api)
2. Create a new API key or use an existing one
3. Copy the API key (starts with `whop_live_` or `whop_test_`)

### 2. Configure Environment Variables

#### Local Development
Create a `.env.local` file in your project root:
```bash
WHOP_API_KEY=your_whop_api_key_here
```

#### Production (Vercel)
1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add a new variable:
   - **Name**: `WHOP_API_KEY`
   - **Value**: Your Whop API key
   - **Environment**: Production, Preview, Development

### 3. Deploy and Test

Once configured, your app will automatically:
- ✅ Save video pages, titles, and links to Whop storage
- ✅ Persist data across page refreshes
- ✅ Allow admins to manage stored content
- ✅ Provide fallback data when storage is unavailable

## 📁 Storage Structure

Your data is stored in Whop's cloud storage with this structure:
```
video-experience-data/
├── experience-{experienceId1}.json
├── experience-{experienceId2}.json
└── ...
```

Each file contains:
```json
{
  "title": "Welcome to Your Video Experience",
  "subtitle": "Share, react, and engage with videos like never before",
  "videos": [
    {
      "id": "1",
      "title": "Introduction to Whop",
      "url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
      "duration": "3:32",
      "createdAt": "2024-01-15T00:00:00.000Z"
    }
  ]
}
```

## 🔧 API Endpoints

### Main Storage API
- `GET /api/experience-data?experienceId={id}` - Load experience data
- `PUT /api/experience-data?experienceId={id}` - Save experience data (admin only)

### Admin Management API
- `GET /api/experience-data/admin?experienceId={id}` - List stored files (admin only)
- `DELETE /api/experience-data/admin?experienceId={id}` - Delete stored data (admin only)

## 🛡️ Security Features

- **Admin-only access**: Only Whop owners and admins can save/edit data
- **Access control**: Uses Whop SDK to verify user permissions
- **Data validation**: All data is validated before saving
- **Error handling**: Graceful fallbacks when storage is unavailable

## 🐛 Troubleshooting

### Storage Not Working?
1. ✅ Check your `WHOP_API_KEY` is set correctly
2. ✅ Verify the API key has storage permissions
3. ✅ Check browser console for error messages
4. ✅ Ensure you're logged in as an admin/owner

### Data Not Persisting?
1. ✅ Check network tab for API call failures
2. ✅ Verify admin permissions in Whop
3. ✅ Check server logs for storage errors
4. ✅ Try refreshing the page after saving

### Development Issues?
- The app includes mock data fallbacks for local development
- Storage API calls will fail locally without proper Whop authentication
- This is expected behavior and won't affect production

## 📝 Usage Examples

### Loading Data
```typescript
const data = await clientStorage.loadExperienceData('your-experience-id');
```

### Saving Data
```typescript
const result = await clientStorage.saveExperienceData('your-experience-id', {
  title: 'New Title',
  subtitle: 'New Subtitle',
  videos: [...]
});
```

### Admin Management
```typescript
// List all stored files
const files = await clientStorage.listStoredFiles('your-experience-id');

// Delete stored data
await clientStorage.deleteExperienceData('your-experience-id');
```

## 🔄 Migration from Local Storage

If you were previously using local storage, your data will automatically migrate to Whop storage once configured. The app will:

1. Load from Whop storage if available
2. Fall back to default data if no storage is configured
3. Save new changes to Whop storage automatically

## 📊 Storage Limits

Whop storage provides generous limits for typical usage:
- File size: Up to 10MB per experience file
- Total storage: Varies by Whop plan
- API calls: Reasonable rate limits for normal usage

For high-volume applications, consider implementing additional caching or database solutions.
