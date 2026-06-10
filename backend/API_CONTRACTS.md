# HMS API Contracts (v1)

## 1. Authentication

### Register Patient

- **Endpoint:** `POST /auth/register`
- **Auth Required:** No

#### Request Body

```json
{
  "email": "patient@example.com",
  "password": "securepassword",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "1234567890",
  "gender": "Male",
  "date_of_birth": "1990-01-01T00:00:00Z",
  "address": "123 Main St",
  "emergency_contact": "0987654321"
}
```

#### Success Response (201)

```json
{
  "message": "Patient registered successfully",
  "user_id": "string"
}
```

---

### Login

- **Endpoint:** `POST /auth/login`
- **Auth Required:** No
- **Request Type:** `application/x-www-form-urlencoded`

#### Request Parameters

| Field    | Description           |
| -------- | --------------------- |
| username | Patient email address |
| password | Patient password      |

#### Success Response (200)

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5...",
  "token_type": "bearer",
  "role": "patient",
  "user_id": "string"
}
```

---

## 2. Patients & Doctors

### Get My Patient Profile

- **Endpoint:** `GET /patients/me`
- **Auth Required:** Yes (**Role:** `patient`)

#### Success Response (200)

Returns the complete **Patient JSON Object**.

---

### Get All Doctors

- **Endpoint:** `GET /doctors/`
- **Auth Required:** Yes

#### Success Response (200)

Returns an array of **Doctor JSON Objects**.

---

## 3. Appointments

### Book Appointment

- **Endpoint:** `POST /appointments/`
- **Auth Required:** Yes (**Role:** `patient`)

#### Request Body

```json
{
  "doctor_id": "string_id_of_doctor",
  "department": "Cardiology",
  "appointment_date": "2026-06-15T10:00:00Z",
  "time_slot": "10:00 AM - 10:30 AM",
  "notes": "Chest pain"
}
```

#### Success Response (201)

```json
{
  "message": "Appointment requested successfully",
  "appointment_id": "string"
}
```
