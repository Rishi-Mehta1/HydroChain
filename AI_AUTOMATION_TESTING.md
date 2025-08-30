# AI Automation Integration Testing Guide

## 🤖 Overview

Your AI automation system is now integrated with all major credit lifecycle events in the HydroChain platform. Here's how to test each webhook trigger.

## 🔗 Webhook Configuration

**URL**: `https://kaival1051.app.n8n.cloud/webhook-test/f48a7ede-656d-47c3-bd05-336fb397d0d4`

**Method**: `POST`  
**Content-Type**: `application/json`

## 📋 Event Types & JSON Formats

### 1. Credit Issuance/Production
**EventType**: `"Credit Issue"`

```json
{
  "EventType": "Credit Issue",
  "producer": "user_e1d6e72c@hydrochain.com",
  "producer_name": "User e1d6e72c",
  "isMockData": true,
  "description": "Green Hydrogen Credit produced - 50 kg H₂",
  "creditAmount": 50
}
```

### 2. Credit Purchase
**EventType**: `"credit_purchased"`

```json
{
  "EventType": "credit_purchased", 
  "producer": "seller@example.com",
  "producer_name": "Credit Seller",
  "isMockData": true,
  "description": "Green Hydrogen Credit purchased - 50 kg H₂",
  "creditAmount": 50
}
```

### 3. Credit Retirement
**EventType**: `"credit_retired"`

```json
{
  "EventType": "credit_retired",
  "producer": "owner@example.com", 
  "producer_name": "Credit Owner",
  "isMockData": true,
  "description": "Green Hydrogen Credit retired - 50 kg H₂. Reason: Voluntary retirement",
  "creditAmount": 50
}
```

## 🧪 How to Test Each Event

### Testing Credit Issuance

1. **Using Test Credit Service** (Recommended):
   ```javascript
   // Open browser console and run:
   import testCreditService from './src/services/testCreditService.js';
   
   // Create single test credit
   testCreditService.createTestCredit(100, "AI Automation Test Credit");
   
   // Create multiple test credits
   testCreditService.createMultipleTestCredits(3);
   ```

2. **Using Create Test Credit Button**:
   - Login to the app
   - Navigate to marketplace/dashboard
   - Click "Create Test Credit" button
   - Enter volume (e.g., 100)
   - Click create

**Expected Webhook**: Sends `"Credit Issue"` event

### Testing Credit Purchase

1. **Create a credit first** (using method above)
2. **Purchase the credit**:
   - Go to marketplace
   - Find an available credit (not your own)
   - Click "Purchase" button
   - Complete purchase flow

**Expected Webhook**: Sends `"credit_purchased"` event

### Testing Credit Retirement

1. **Purchase or own a credit first**
2. **Retire the credit**:
   - Navigate to your owned credits
   - Click "Retire" on a credit you own
   - Provide retirement reason
   - Complete retirement

**Expected Webhook**: Sends `"credit_retired"` event

## 🔍 Monitoring & Debugging

### Console Logging
All webhook calls are logged in the browser console:
```
🤖 Sending AI automation notification: {EventType: "Credit Issue", ...}
✅ AI automation notification sent successfully
```

### Network Tab
1. Open browser Developer Tools
2. Go to Network tab
3. Filter by the webhook URL
4. Perform test actions
5. Check POST requests to your webhook

### Webhook Response
- **Success**: HTTP 200 status
- **Failure**: HTTP error status with details

## 🎯 Complete Test Sequence

Here's a full test sequence to trigger all three event types:

```javascript
// 1. Create test credit (triggers Credit Issue webhook)
await testCreditService.createTestCredit(75, "Full Test Sequence Credit");

// 2. Purchase the credit (triggers credit_purchased webhook)
// - Use the UI to purchase from another user account
// - Or use the marketplace service directly

// 3. Retire the credit (triggers credit_retired webhook)
// - Use the UI to retire the purchased credit
// - Or use the marketplace service directly
```

## 📊 Expected Console Output

When testing, you should see:

```
🔧 Creating test credit directly in database...
✅ Test credit created successfully
🤖 Sending AI automation notification: {EventType: "Credit Issue", ...}
✅ AI automation notification sent successfully
🤖 AI automation notification sent for credit issuance
✅ Transaction recorded successfully
```

For purchases:
```
🛒 Processing simple purchase...
🔄 Attempting to transfer credit ownership...
✅ Purchase transaction recorded successfully
🤖 Sending AI automation notification: {EventType: "credit_purchased", ...}
✅ AI automation notification sent successfully
```

For retirements:
```
✅ Retirement prepared
🤖 Sending AI automation notification: {EventType: "credit_retired", ...}
✅ AI automation notification sent successfully
```

## 🚨 Troubleshooting

### Webhook Not Triggered
- Check console for error messages
- Verify webhook URL is correct
- Check network connectivity

### Wrong JSON Format
- All JSON strictly follows your specified format
- No extra fields added beyond requirements
- Volume always converted to number

### Authentication Issues
- Make sure user is logged in
- Check user permissions for actions

## 🔧 Cleanup

After testing, clean up test credits:
```javascript
testCreditService.cleanupTestCredits();
```

## 🎉 Integration Complete!

Your AI automation system is now fully integrated and will receive real-time notifications for:
- ✅ **Credit Production/Issuance** 
- ✅ **Credit Purchases**
- ✅ **Credit Retirements**

All events are sent with the exact JSON format you specified, ensuring seamless integration with your n8n workflow!
