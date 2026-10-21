
# Organization Events & Attendance API

## Description

A RESTful API built with Node.js and Express.js for managing
student organization events and recording student attendance.
It supports CRUD operations, input validation, and attendance
reports.

## Technologies Used

- Node.js
- Express.js
- Postman
- Git and GitHub
- Render

## Installation

1. Clone the repository.
2. Open the project directory.
3. Install dependencies:

   npm install

4. Start the API:

   npm start

5. Open http://localhost:3000/

## Event Endpoints

| Method | Endpoint | Purpose |
| GET | /api/events | Retrieve all events |
| GET | /api/events/:id | Retrieve one event |
| POST | /api/events | Create an event |
| PATCH | /api/events/:id | Update an event |
| DELETE | /api/events/:id | Delete an event |

## Attendance Endpoints

| Method | Endpoint | Purpose |
| GET | /api/attendance | Retrieve attendance records |
| GET | /api/attendance/:id | Retrieve one record |
| POST | /api/attendance | Record student attendance |
| PATCH | /api/attendance/:id | Update an attendance record |
| DELETE | /api/attendance/:id | Delete an attendance record |
| GET | /api/events/:id/attendance | View an event attendance report |

## Example: Create an Event

POST /api/events

Content-Type: application/json

{
  "title": "CCS Foundation Day",
  "description": "Student organization celebration",
  "date": "2026-12-10",
  "venue": "School Covered Court",
  "organizer": "College of Computer Studies",
  "status": "Upcoming"
}

## Example: Record Attendance

POST /api/attendance

Content-Type: application/json

{
  "eventId": 1,
  "studentId": "2024-002",
  "studentName": "Maria Santos",
  "status": "Present"
}

## Validation and Status Codes

- 200: Successful request
- 201: Resource created
- 400: Invalid input or ID
- 404: Resource not found
- 409: Duplicate attendance record

## Testing

Use Postman to test the endpoints.
Include successful CRUD requests and invalid requests.

## GitHub Repository

https://github.com/salmanmutia202400744-ops/organization-events-api1

## Render Deployment

https://organization-events-api1.onrender.com

## Limitations

The API uses in-memory arrays instead of a database.
Data is temporary and resets when the server restarts.
The project does not include user authentication or role-based
access control. It is intended for a basic academic activity.
