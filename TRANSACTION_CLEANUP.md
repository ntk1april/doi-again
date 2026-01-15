# Transaction Cleanup System

This document explains how to automatically delete transactions older than 30 days.

## Overview

The system provides three ways to cleanup old transactions:

1. **Automated Cron Job** (Recommended for production)
2. **Manual API Call** (For testing or manual cleanup)
3. **Manual Script** (For local development)

---

## 1. Automated Cron Job (Vercel)

### Setup

If deploying to Vercel, the cleanup runs automatically every day at 2 AM.

**Configuration:** `vercel.json`
```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-transactions",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**Schedule Format:** Cron expression `0 2 * * *` means:
- `0` - Minute (0)
- `2` - Hour (2 AM)
- `*` - Day of month (every day)
- `*` - Month (every month)
- `*` - Day of week (every day)

### Security

Add `CRON_SECRET` to your environment variables:

```env
CRON_SECRET=your-random-secret-key-here
```

This prevents unauthorized access to the cleanup endpoint.

---

## 2. Manual API Call

### Preview Cleanup (GET)

See how many transactions would be deleted without actually deleting them:

```bash
curl http://localhost:3000/api/cron/cleanup-transactions
```

**Response:**
```json
{
  "success": true,
  "count": 42,
  "cutoffDate": "2025-12-16T02:00:00.000Z",
  "message": "42 transactions would be deleted"
}
```

### Execute Cleanup (DELETE)

Actually delete the old transactions:

```bash
curl -X DELETE \
  -H "Authorization: Bearer your-cron-secret" \
  http://localhost:3000/api/cron/cleanup-transactions
```

**Response:**
```json
{
  "success": true,
  "message": "Deleted 42 transactions",
  "deletedCount": 42,
  "cutoffDate": "2025-12-16T02:00:00.000Z"
}
```

---

## 3. Manual Script (Local Development)

### Run the Script

```bash
node scripts/cleanup-transactions.js
```

**Output:**
```
✓ Connected to MongoDB

Deleting transactions older than: 2025-12-16T02:00:00.000Z
Found 42 transactions to delete

Deleting in 3 seconds... Press Ctrl+C to cancel

✓ Successfully deleted 42 transactions
✓ Disconnected from MongoDB
```

---

## Alternative Cron Services

If not using Vercel, you can use other services:

### GitHub Actions

Create `.github/workflows/cleanup.yml`:

```yaml
name: Cleanup Old Transactions

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Call cleanup endpoint
        run: |
          curl -X DELETE \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://your-app.vercel.app/api/cron/cleanup-transactions
```

### Cron-job.org

1. Go to https://cron-job.org
2. Create a free account
3. Add a new cron job:
   - **URL:** `https://your-app.vercel.app/api/cron/cleanup-transactions`
   - **Method:** DELETE
   - **Schedule:** Daily at 2:00 AM
   - **Headers:** `Authorization: Bearer your-cron-secret`

### EasyCron

1. Go to https://www.easycron.com
2. Create a free account
3. Add a new cron job with similar settings

---

## Customizing the Cleanup Period

To change from 30 days to a different period, edit:

**File:** `src/app/api/cron/cleanup-transactions/route.ts`

```typescript
// Change this line:
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

// To your desired number of days:
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 60);  // 60 days
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 90);  // 90 days
```

---

## Monitoring

### Check Logs

**Vercel:**
- Go to your project dashboard
- Click "Deployments"
- Click on the latest deployment
- Go to "Functions" tab
- Look for `/api/cron/cleanup-transactions` logs

**Local:**
- Check your terminal output when running the script

### Verify Cleanup

Query your database to see remaining transactions:

```javascript
// In MongoDB shell or Compass
db.transactions.countDocuments({
  date: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
})
```

Should return `0` after cleanup runs.

---

## Important Notes

⚠️ **Data Loss Warning:** Deleted transactions cannot be recovered. Make sure you have backups if needed.

✅ **Realized P/L Preserved:** The cleanup only deletes transaction records. Realized P/L on stocks is preserved.

📊 **Portfolio Unaffected:** Current stock positions are not affected by transaction cleanup.

🔒 **Security:** Always use `CRON_SECRET` in production to prevent unauthorized cleanup.

---

## Testing

1. **Add test transactions:**
   ```javascript
   // Manually insert old transaction in MongoDB
   db.transactions.insertOne({
     userId: ObjectId("..."),
     symbol: "TEST",
     type: "BUY",
     units: 10,
     price: 100,
     date: new Date("2025-11-01"),  // Old date
     createdAt: new Date(),
     updatedAt: new Date()
   })
   ```

2. **Preview cleanup:**
   ```bash
   curl http://localhost:3000/api/cron/cleanup-transactions
   ```

3. **Execute cleanup:**
   ```bash
   curl -X DELETE http://localhost:3000/api/cron/cleanup-transactions
   ```

4. **Verify deletion:**
   Check that the test transaction is gone.

---

## FAQ

**Q: Will this delete my stock positions?**  
A: No, only transaction history is deleted. Your current stock holdings remain unchanged.

**Q: Will I lose my realized P/L data?**  
A: No, realized P/L is stored on the stock document itself, not in transactions.

**Q: Can I recover deleted transactions?**  
A: No, deletion is permanent. Consider database backups if you need transaction history.

**Q: How do I disable automatic cleanup?**  
A: Remove the cron configuration from `vercel.json` or disable the scheduled job in your cron service.

**Q: Can I change the 30-day period?**  
A: Yes, edit the calculation in the API route as shown in the "Customizing" section above.
