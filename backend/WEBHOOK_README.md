# Clerk Webhook Integration

This backend includes a webhook endpoint to handle events from Clerk authentication service.

## Setup

### 1. Environment Variables

Add the following to your `.env` file:

```env
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 2. Get Webhook Secret from Clerk

1. Go to your [Clerk Dashboard](https://dashboard.clerk.com/)
2. Navigate to "Webhooks" in the sidebar
3. Click "Add Endpoint"
4. Set the URL to: `https://yourdomain.com/api/webhooks/clerk`
5. Select the events you want to listen to:
   - `user.created`
   - `user.updated`
   - `user.deleted`
   - `session.created`
   - `session.removed`
   - `email.created`
6. Copy the "Signing Secret" and add it to your `.env` file as `CLERK_WEBHOOK_SECRET`

### 3. Webhook Events Handled

The webhook endpoint handles the following Clerk events:

- **`user.created`**: Creates or updates a user in the database
- **`user.updated`**: Updates user information in the database
- **`user.deleted`**: Marks user for deletion (soft delete)
- **`session.created`**: Logs session creation
- **`session.removed`**: Logs session removal
- **`email.created`**: Updates email verification status

### 4. Database Schema

The webhook expects the following User model fields:

```prisma
model User {
  id                  String        @id @default(cuid())
  clerkId             String        @unique
  email               String        @unique
  firstName           String?
  lastName            String?
  imageUrl            String?
  emailVerified       Boolean       @default(false)
  // ... other fields
}
```

### 5. Testing the Webhook

You can test the webhook using the provided test script:

```bash
cd backend
node test-webhook.js
```

This will generate sample webhook data that you can use with tools like Postman or curl to test the endpoint.

### 6. Webhook Endpoint

**URL**: `POST /api/webhooks/clerk`

**Headers Required**:
- `svix-id`: Unique message identifier
- `svix-timestamp`: Unix timestamp
- `svix-signature`: HMAC signature for verification

**Example Request**:

```bash
curl -X POST http://localhost:3001/api/webhooks/clerk \
  -H "Content-Type: application/json" \
  -H "svix-id: msg_123" \
  -H "svix-timestamp: 1775661069" \
  -H "svix-signature: v1,fds6zR6bWLqTxlLZAt7UxqPOvtWrfq+NAjmImP5BKG4=" \
  -d '{
    "type": "user.created",
    "data": {
      "id": "user_123",
      "email_addresses": [{"email_address": "test@example.com"}],
      "first_name": "John",
      "last_name": "Doe"
    }
  }'
```

### 7. Security

The webhook endpoint includes signature verification using the Svix library's algorithm to ensure requests are genuinely from Clerk. The signature is verified using HMAC-SHA256.

### 8. Error Handling

The webhook endpoint includes comprehensive error handling:
- Invalid signatures are rejected with 400 status
- Missing headers return 400 status
- Database errors are logged and return 500 status
- Successful processing returns 200 status

### 9. Logging

All webhook events are logged to the console with relevant information for debugging and monitoring.