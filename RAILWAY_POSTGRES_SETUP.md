# 🚂 Add PostgreSQL to Railway Project

## Step 1: Add PostgreSQL Database

1. **Go to Railway Dashboard**: https://railway.app/dashboard
2. **Open your project**: `web3vault-production`
3. **Click "+ New"** button
4. **Select "Database" → "PostgreSQL"**
5. Railway will automatically provision a PostgreSQL database

## Step 2: Get DATABASE_URL

After PostgreSQL is added, Railway **automatically creates** a `DATABASE_URL` environment variable that looks like:

```
postgresql://postgres:password@hostname:5432/railway
```

You don't need to copy/paste anything! Railway handles this automatically.

## Step 3: Verify Connection

The connection is **automatic** between your Next.js app and PostgreSQL database on Railway.

To verify it's connected:
1. Deploy your code: `git push origin main`
2. Railway will auto-deploy
3. Check deployment logs for: `🗄️ PostgreSQL pool created`
4. First API call will show: `✅ Database tables initialized`

## Step 4: Test Token Burns

### Test Case: One-Time Link Across Devices

1. **Upload a file** → **Share** → **One-time access**
2. Copy the share link
3. Open link in **Chrome** → ✅ File downloads, token burns
4. Try same link in **Chrome again** → ❌ "Token has been burned"
5. Try same link in **Firefox** → ❌ "Token has been burned" (GLOBAL!)
6. Try same link on **mobile** → ❌ "Token has been burned" (GLOBAL!)

### Expected Console Output:

**First view (any browser):**
```
🔥✅ Token burned globally in database: abc123-xyz789
🌍 This token is now burned across ALL devices
```

**Subsequent views (any browser/device):**
```
❌ Token validation failed: This access token has been burned
```

## How It Works

### Architecture:

```
User opens link → access-tokens.ts checks → API /api/tokens/check
                                          ↓
                                    Railway PostgreSQL
                                  (burned_tokens table)
                                          ↓
                                   Returns: isBurned=true
                                          ↓
                            Shows error: "Token has been burned"
```

### Database Schema:

```sql
CREATE TABLE burned_tokens (
    token_id VARCHAR(255) PRIMARY KEY,
    burned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    burned_by VARCHAR(255),
    metadata JSONB
);
```

### Features:

✅ **Global burns** - Works across ALL devices, browsers, locations
✅ **Auto-creates tables** - No manual SQL needed
✅ **Connection pooling** - Efficient database connections
✅ **Fallback to localStorage** - Still works if database is down
✅ **SSL enabled** - Secure connection in production
✅ **Cleanup function** - Auto-deletes burns older than 30 days

## Troubleshooting

### If token burns don't work globally:

1. **Check DATABASE_URL is set**:
   - Go to Railway project → Settings → Variables
   - Should see `DATABASE_URL` auto-created by PostgreSQL service

2. **Check deployment logs**:
   ```
   🗄️ PostgreSQL pool created
   ✅ Database tables initialized
   ```

3. **Check API routes work**:
   - Test: `https://your-app.railway.app/api/tokens/check?tokenId=test123`
   - Should return: `{"tokenId":"test123","isBurned":false}`

### If you see "DATABASE_URL not set" error:

1. Make sure PostgreSQL service is added to Railway project
2. Redeploy: `git push origin main`
3. Railway auto-injects DATABASE_URL when both services are in same project

## Cost

**FREE for hackathon!** 🎉

Railway gives you **$5/month free credit**, which includes:
- PostgreSQL database (shared CPU)
- Unlimited queries for hackathon usage
- 1GB database storage

This is more than enough for testing and demos.

## Next Steps

After setup is complete:
1. Push code: `git push origin main` ← **DO THIS NOW**
2. Railway auto-deploys
3. Test one-time links across devices
4. Burns will work globally! 🌍
