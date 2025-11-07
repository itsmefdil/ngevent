# Vercel Structured Logging Guide

## Overview
Email webhook (`/api/webhooks/email`) now uses structured JSON logging for better visibility in Vercel Runtime Logs.

## Log Format
All logs follow this structure:
```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": "info|warn|error",
  "message": "Human-readable description",
  "...additional_fields": "context-specific data"
}
```

## Log Levels

### INFO
- **Module initialization**: Environment variables check
- **Webhook invocation**: Request received
- **Email sending**: Successful email delivery
- **Performance metrics**: Duration tracking

### WARN
- **Missing configuration**: API keys not set
- **Skipped operations**: Email not sent due to config

### ERROR
- **Validation failures**: Invalid payload
- **API errors**: Resend API failures
- **Database errors**: Failed to log email
- **System errors**: Unexpected exceptions

## Viewing Logs in Vercel

### Access Runtime Logs
1. Go to Vercel Dashboard
2. Select your project
3. Click "Deployments"
4. Click on a deployment
5. Go to "Runtime Logs" tab

### Filter Logs
Use Vercel's search to filter by field:

**By log level:**
```
"level":"error"
"level":"warn"
"level":"info"
```

**By email type:**
```
"email_type":"welcome_email"
"email_type":"registration_confirmation"
```

**By recipient:**
```
"recipient":"user@example.com"
```

**By message:**
```
"message":"Email sent successfully"
"message":"Failed to send email"
```

## Common Log Patterns

### Successful Email
```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": "info",
  "message": "Email sent successfully",
  "resend_id": "abc123",
  "recipient": "user@example.com",
  "email_type": "welcome_email",
  "duration_ms": 1234
}
```

### Missing API Key
```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": "warn",
  "message": "RESEND_API_KEY not configured",
  "action": "skipping email send",
  "email_type": "welcome_email",
  "recipient": "user@example.com"
}
```

### API Error
```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": "error",
  "message": "Resend API error",
  "status": 401,
  "error": {"message": "Invalid API key"},
  "recipient": "user@example.com"
}
```

### System Error
```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": "error",
  "message": "Email webhook error",
  "error": "Database connection failed",
  "stack": "Error: Database connection failed\n  at ...",
  "duration_ms": 50
}
```

## Performance Monitoring

### Duration Metrics
Every request includes `duration_ms` field in final logs:
```json
{
  "duration_ms": 1234
}
```

**Normal ranges:**
- Fast: < 500ms
- Average: 500-2000ms
- Slow: > 2000ms

### Monitor Performance
Search for slow requests:
```
"duration_ms" AND "level":"info"
```

Then manually filter results where `duration_ms > 2000`.

## Troubleshooting

### No Logs Appearing
1. Check deployment is using latest code
2. Verify webhook is being called (check Supabase logs)
3. Check Vercel Runtime Logs, not Build Logs
4. Wait 30-60 seconds for log aggregation

### Missing Email Sends
Search for:
```
"message":"Email sent successfully"
```

If not found, check for errors:
```
"level":"error"
```

### API Key Issues
Search for:
```
"RESEND_API_KEY"
```

Check initialization logs:
```
"message":"Email webhook module initialization"
```

Expected:
```json
{
  "environment": {
    "resend_api_key": "present",
    "service_role_key": "present"
  }
}
```

### Validation Errors
Search for:
```
"message":"Invalid payload"
```

Check `missing_fields` array for required fields.

## Best Practices

### 1. Monitor Daily
Check logs daily for error patterns:
```
"level":"error"
```

### 2. Set Up Alerts
Use Vercel integrations (Slack, Discord) to alert on errors.

### 3. Track Performance
Monitor `duration_ms` weekly to spot degradation.

### 4. Correlate with Database
Use `timestamp` to correlate with Supabase `email_logs` table:
```sql
SELECT * FROM email_logs 
WHERE sent_at >= '2024-01-15T10:00:00Z' 
ORDER BY sent_at DESC;
```

### 5. Debug Flow
1. Check module initialization logs (environment vars)
2. Find webhook invocation log (request received)
3. Check validation (payload valid?)
4. Check API key availability
5. Check email send attempt
6. Check final result (success/error)

## Example Debug Session

**Problem**: Email not being sent

**Step 1**: Check if webhook called
```
"message":"Email webhook invoked"
```

**Step 2**: Check payload
```
"message":"Invalid payload"
```

**Step 3**: Check API key
```
"message":"RESEND_API_KEY not configured"
```

**Step 4**: Check send attempt
```
"message":"Sending email to Resend"
```

**Step 5**: Check result
```
"message":"Email sent successfully"
OR
"message":"Failed to send email via Resend"
```

## Migration from Old Logs

### Before (Plain Text)
```
📧 Sending email to: user@example.com
Subject: Welcome!
✅ Email sent successfully!
```

**Problems:**
- No timestamps
- Emojis cause encoding issues
- Hard to parse/filter
- Lost in Vercel aggregation

### After (Structured JSON)
```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": "info",
  "message": "Email sent successfully",
  "resend_id": "abc123",
  "recipient": "user@example.com",
  "email_type": "welcome_email",
  "duration_ms": 1234
}
```

**Benefits:**
- Precise timestamps
- Machine-readable
- Easy filtering/searching
- Reliable in Vercel
- Performance metrics included

## Future Enhancements

### Correlation IDs
Add request IDs to track full email lifecycle:
```json
{
  "correlation_id": "req_abc123",
  "message": "Email sent successfully"
}
```

### Log Aggregation
Integrate with external services:
- Datadog
- LogDNA
- Sentry
- Better Stack

### Metrics Dashboard
Create custom dashboard showing:
- Email send rate
- Success/failure ratio
- Average duration
- Error patterns

### Automated Alerts
Set up alerting for:
- Error rate > 5%
- Duration > 3000ms
- Failed API key validation
- Database connection issues

## Resources
- [Vercel Runtime Logs](https://vercel.com/docs/observability/runtime-logs)
- [JSON Logging Best Practices](https://www.loggly.com/ultimate-guide/node-logging-basics/)
- [Resend API Docs](https://resend.com/docs)
