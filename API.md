# API Documentation

## Overview

The Call Reservation Tool API provides endpoints for managing call reservations, admin operations, and notification systems. All endpoints are prefixed with `/api`.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Currently, the API does not require authentication. In a production environment, consider implementing JWT-based authentication.

## Response Format

All responses follow a consistent format:

### Success Response

```json
{
  "status": "success",
  "record": { ... },
  "message": "Optional success message"
}
```

### Error Response

```json
{
  "status": "error",
  "message": "Error description",
  "record": null
}
```

## Endpoints

### Reservation Management

#### Create Reservation

**POST** `/reservation`

Creates a new call reservation.

**Request Body:**

```json
{
  "startTime": "13:15",
  "email": "user@example.com",
  "phone": "+1234567890",
  "pushNotificationKey": "user-push-key-123",
  "receiveEmail": true,
  "receiveSmsNotification": true,
  "receivePushNotification": true
}
```

**Validation Rules:**

- `startTime`: Must be in HH:mm format with minutes only 00, 15, 30, or 45
- `email`: Valid email address
- `phone`: Non-empty string
- `pushNotificationKey`: Non-empty string
- `receiveEmail`: Boolean
- `receiveSmsNotification`: Boolean
- `receivePushNotification`: Boolean

**Response:**

```json
{
  "status": "success",
  "record": {
    "id": "uuid",
    "startTime": "13:15",
    "email": "user@example.com",
    "phone": "+1234567890",
    "pushNotificationKey": "user-push-key-123",
    "endTime": "13:45",
    "status": "QUEUED",
    "createdTime": "2024-01-01T10:00:00.000Z"
  }
}
```

**Error Cases:**

- `409 Conflict`: Time slot already reserved
- `400 Bad Request`: Invalid input data

#### Get All Reservations

**GET** `/reservation`

Retrieves all reservations.

**Response:**

```json
{
  "records": [
    {
      "id": "uuid",
      "startTime": "13:15",
      "email": "user@example.com",
      "phone": "+1234567890",
      "pushNotificationKey": "user-push-key-123",
      "endTime": "13:45",
      "status": "QUEUED",
      "createdTime": "2024-01-01T10:00:00.000Z"
    }
  ]
}
```

#### Get Single Reservation

**GET** `/reservation/:id`

Retrieves a specific reservation by ID.

**Parameters:**

- `id`: Reservation UUID

**Response:**

```json
{
  "id": "uuid",
  "startTime": "13:15",
  "email": "user@example.com",
  "phone": "+1234567890",
  "pushNotificationKey": "user-push-key-123",
  "endTime": "13:45",
  "status": "QUEUED",
  "createdTime": "2024-01-01T10:00:00.000Z"
}
```

**Error Cases:**

- `404 Not Found`: Reservation not found

#### Cancel Reservation

**PUT** `/reservation/:id/cancel`

Cancels a reservation by the user.

**Request Body:**

```json
{
  "adminEmail": "admin@example.com"
}
```

**Response:**

```json
{
  "status": "success",
  "record": {
    "id": "uuid",
    "startTime": "13:15",
    "email": "user@example.com",
    "phone": "+1234567890",
    "pushNotificationKey": "user-push-key-123",
    "endTime": "13:45",
    "status": "CANCELLED",
    "createdTime": "2024-01-01T10:00:00.000Z"
  }
}
```

**Error Cases:**

- `404 Not Found`: Reservation not found
- `400 Bad Request`: Cannot cancel reservation (wrong status)

#### Update Reservation Time

**PUT** `/reservation/:id/time`

Updates the reservation time.

**Request Body:**

```json
{
  "startTime": "14:30"
}
```

**Validation Rules:**

- `startTime`: Must be in HH:mm format with minutes only 00, 15, 30, or 45

**Response:**

```json
{
  "status": "success",
  "record": {
    "id": "uuid",
    "startTime": "14:30",
    "email": "user@example.com",
    "phone": "+1234567890",
    "pushNotificationKey": "user-push-key-123",
    "endTime": "15:00",
    "status": "QUEUED",
    "createdTime": "2024-01-01T10:00:00.000Z"
  }
}
```

**Error Cases:**

- `404 Not Found`: Reservation not found
- `409 Conflict`: New time slot already reserved
- `400 Bad Request`: Cannot update reservation (wrong status)

#### Admin Action

**PUT** `/reservation/:id/admin-action`

Admin accepts or rejects a reservation.

**Request Body:**

```json
{
  "action": "accept",
  "adminEmail": "admin@example.com"
}
```

**Validation Rules:**

- `action`: Must be either "accept" or "reject"
- `adminEmail`: Valid email address

**Response:**

```json
{
  "status": "success",
  "record": {
    "id": "uuid",
    "startTime": "13:15",
    "email": "user@example.com",
    "phone": "+1234567890",
    "pushNotificationKey": "user-push-key-123",
    "endTime": "13:45",
    "status": "ACCEPTED",
    "createdTime": "2024-01-01T10:00:00.000Z"
  }
}
```

**Error Cases:**

- `404 Not Found`: Reservation not found
- `400 Bad Request`: Cannot perform action (wrong status)

#### Mark Reservation Successful

**PUT** `/reservation/:id/successful`

Marks a reservation as successful (internal endpoint).

**Response:**

```json
{
  "status": "success",
  "record": {
    "id": "uuid",
    "startTime": "13:15",
    "email": "user@example.com",
    "phone": "+1234567890",
    "pushNotificationKey": "user-push-key-123",
    "endTime": "13:45",
    "status": "SUCCESSFUL",
    "createdTime": "2024-01-01T10:00:00.000Z"
  }
}
```

### Admin Operations

#### Get All Reservations (Admin View)

**GET** `/admin/reservations`

Retrieves all reservations for admin view.

**Response:**

```json
[
  {
    "id": "uuid",
    "startTime": "13:15",
    "email": "user@example.com",
    "phone": "+1234567890",
    "pushNotificationKey": "user-push-key-123",
    "endTime": "13:45",
    "status": "QUEUED",
    "createdTime": "2024-01-01T10:00:00.000Z"
  }
]
```

#### Get Pending Reservations

**GET** `/admin/reservations/pending`

Retrieves only pending reservations (QUEUED status).

**Response:**

```json
{
  "records": [
    {
      "id": "uuid",
      "startTime": "13:15",
      "email": "user@example.com",
      "phone": "+1234567890",
      "pushNotificationKey": "user-push-key-123",
      "endTime": "13:45",
      "status": "QUEUED",
      "createdTime": "2024-01-01T10:00:00.000Z"
    }
  ]
}
```

#### Send Reminder Notifications

**PUT** `/admin/send-reminders`

Manually triggers reminder notifications for all eligible reservations.

**Response:**

```json
{
  "status": "success",
  "message": "Reminder notifications sent successfully"
}
```

## Data Models

### Reservation Status Enum

```typescript
enum ReservationStatus {
  QUEUED = 'QUEUED', // Waiting for reservation time
  ACCEPTED = 'ACCEPTED', // Accepted by admin
  SUCCESSFUL = 'SUCCESSFUL', // Reservation completed successfully
  CANCELLED = 'CANCELLED', // Cancelled by user
  REJECTED = 'REJECTED', // Rejected by admin
}
```

### Reservation Entity

```typescript
interface Reservation {
  id: string; // UUID
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format (calculated)
  email: string; // User email
  phone: string; // User phone
  pushNotificationKey: string; // Push notification key
  receiveEmail: boolean; // Email notification preference
  receiveSmsNotification: boolean; // SMS notification preference
  receivePushNotification: boolean; // Push notification preference
  status: ReservationStatus; // Current status
  reservationDate: string; // Date of reservation
  createdTime: Date; // Creation timestamp
  updatedTime: Date; // Last update timestamp
}
```

## Error Handling

### HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., time slot taken)
- `500 Internal Server Error`: Server error

### Error Response Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

## Rate Limiting

Currently, no rate limiting is implemented. Consider adding rate limiting for production use.

## CORS

CORS is enabled for development. Configure `FRONTEND_URL` environment variable for production.

## Webhooks

Webhook support is not currently implemented but can be added for external integrations.

## Examples

### Complete Workflow Example

1. **Create Reservation**

   ```bash
   curl -X POST http://localhost:3000/api/reservation \
     -H "Content-Type: application/json" \
     -d '{
       "startTime": "13:15",
       "email": "user@example.com",
       "phone": "+1234567890",
       "pushNotificationKey": "user-push-key-123",
       "receiveEmail": true,
       "receiveSmsNotification": true,
       "receivePushNotification": true
     }'
   ```

2. **Admin Accepts Reservation** (Status changes to ACCEPTED)

   ```bash
   curl -X PUT http://localhost:3000/api/reservation/{id}/admin-action \
     -H "Content-Type: application/json" \
     -d '{
       "action": "accept",
       "adminEmail": "admin@example.com"
     }'
   ```

3. **User Cancels Reservation**

   ```bash
   curl -X PUT http://localhost:3000/api/reservation/{id}/cancel \
     -H "Content-Type: application/json" \
     -d '{
       "adminEmail": "admin@example.com"
     }'
   ```

4. **Mark as Successful (after call)**
   ```bash
   curl -X PUT http://localhost:3000/api/reservation/{id}/successful
   ```
