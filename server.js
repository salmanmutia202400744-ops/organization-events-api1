
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Temporary in-memory data.
let events = [
    {
        id: 1,
        title: "CCS General Assembly",
        description: "Student organization general assembly",
        date: "2026-11-15",
        venue: "School AVR",
        organizer: "College of Computer Studies",
        status: "Upcoming"
    },
    {
        id: 2,
        title: "Community Outreach",
        description: "Student volunteer activity",
        date: "2026-11-20",
        venue: "Community Center",
        organizer: "Student Organization",
        status: "Upcoming"
    }
];

let attendance = [
    {
        id: 1,
        eventId: 1,
        studentId: "2024-001",
        studentName: "Juan Dela Cruz",
        status: "Present"
    }
];

let nextEventId = 3;
let nextAttendanceId = 2;

const eventFields = [
    "title",
    "description",
    "date",
    "venue",
    "organizer",
    "status"
];

const attendanceFields = [
    "eventId",
    "studentId",
    "studentName",
    "status"
];

const eventStatuses = ["Upcoming", "Ongoing", "Completed"];
const attendanceStatuses = ["Present", "Late", "Absent"];

// Validate a positive integer ID.
function validId(value) {
    return /^\d+$/.test(value) && Number(value) > 0;
}

// Validate event input.
function validateEvent(data, isCreate = false) {
    if (
        data === null ||
        typeof data !== "object" ||
        Array.isArray(data)
    ) {
        return "Request body must be a JSON object.";
    }

    const keys = Object.keys(data);

    if (keys.length === 0) {
        return "Request body cannot be empty.";
    }

    const invalid = keys.find(key => !eventFields.includes(key));

    if (invalid) {
        return `Invalid event field: ${invalid}.`;
    }

    if (isCreate) {
        const missing = eventFields.filter(
            field => data[field] === undefined
        );

        if (missing.length) {
            return `Missing required fields: ${missing.join(", ")}.`;
        }
    }

    for (const field of keys) {
        if (typeof data[field] !== "string" &&
            field !== "eventId") {
            return `${field} must be a string.`;
        }
    }

    for (const field of [
        "title",
        "description",
        "date",
        "venue",
        "organizer"
    ]) {
        if (data[field] !== undefined) {
            if (data[field].trim() === "") {
                return `${field} cannot be empty.`;
            }
        }
    }

    if (data.date !== undefined) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
            return "Date must use YYYY-MM-DD format.";
        }

        const parsed = new Date(`${data.date}T00:00:00Z`);

        if (
            Number.isNaN(parsed.getTime()) ||
            parsed.toISOString().slice(0, 10) !== data.date
        ) {
            return "Please provide a valid calendar date.";
        }
    }

    if (
        data.status !== undefined &&
        !eventStatuses.includes(data.status)
    ) {
        return "Status must be Upcoming, Ongoing, or Completed.";
    }

    return null;
}

// Validate attendance input.
function validateAttendance(data, isCreate = false) {
    if (
        data === null ||
        typeof data !== "object" ||
        Array.isArray(data)
    ) {
        return "Request body must be a JSON object.";
    }

    const keys = Object.keys(data);

    if (keys.length === 0) {
        return "Request body cannot be empty.";
    }

    const invalid = keys.find(
        key => !attendanceFields.includes(key)
    );

    if (invalid) {
        return `Invalid attendance field: ${invalid}.`;
    }

    if (isCreate) {
        const missing = attendanceFields.filter(
            field => data[field] === undefined
        );

        if (missing.length) {
            return `Missing required fields: ${missing.join(", ")}.`;
        }
    }

    if (data.eventId !== undefined) {
        if (!Number.isInteger(data.eventId) || data.eventId < 1) {
            return "eventId must be a positive integer.";
        }

        if (!events.some(event => event.id === data.eventId)) {
            return "The specified event does not exist.";
        }
    }

    for (const field of ["studentId", "studentName"]) {
        if (data[field] !== undefined) {
            if (
                typeof data[field] !== "string" ||
                data[field].trim() === ""
            ) {
                return `${field} must be a non-empty string.`;
            }
        }
    }

    if (
        data.status !== undefined &&
        !attendanceStatuses.includes(data.status)
    ) {
        return "Status must be Present, Late, or Absent.";
    }

    return null;
}

// Check duplicate attendance for the same student and event.
function duplicateAttendance(data, excludeId = null) {
    return attendance.some(record =>
        record.id !== excludeId &&
        record.eventId === data.eventId &&
        record.studentId.toLowerCase() ===
            data.studentId.toLowerCase()
    );
}

// Root endpoint.
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Organization Events & Attendance API is running.",
        endpoints: {
            events: "/api/events",
            attendance: "/api/attendance",
            attendanceReport: "/api/events/:id/attendance"
        }
    });
});

// =====================================
// EVENTS CRUD
// =====================================

// 1. GET all events.
app.get("/api/events", (req, res) => {
    res.status(200).json({
        count: events.length,
        data: events
    });
});

// 2. GET one event.
app.get("/api/events/:id", (req, res) => {
    if (!validId(req.params.id)) {
        return res.status(400).json({
            message: "Event ID must be a positive integer."
        });
    }

    const event = events.find(
        item => item.id === Number(req.params.id)
    );

    if (!event) {
        return res.status(404).json({
            message: "Event not found."
        });
    }

    res.status(200).json({ data: event });
});

// 3. CREATE an event.
app.post("/api/events", (req, res) => {
    const error = validateEvent(req.body, true);

    if (error) {
        return res.status(400).json({ message: error });
    }

    const event = {
        id: nextEventId++,
        ...Object.fromEntries(
            eventFields.map(field => [
                field,
                req.body[field].trim()
            ])
        )
    };

    events.push(event);

    res.status(201).json({
        message: "Event created successfully.",
        data: event
    });
});

// 4. UPDATE 
app.put("/api/events/:id", (req, res) => {
    if (!validId(req.params.id)) {
        return res.status(400).json({
            message: "Event ID must be a positive integer."
        });
    }

    const event = events.find(
        item => item.id === Number(req.params.id)
    );

    if (!event) {
        return res.status(404).json({
            message: "Event not found."
        });
    }

    const error = validateEvent(req.body, true);

    if (error) {
        return res.status(400).json({
            message: error
        });
    }

    for (const field of eventFields) {
        event[field] = req.body[field].trim();
    }

    return res.status(200).json({
        message: "Event updated successfully.",
        data: event
    });
});

// 5. DELETE an event and its attendance records.
app.delete("/api/events/:id", (req, res) => {
    if (!validId(req.params.id)) {
        return res.status(400).json({
            message: "Event ID must be a positive integer."
        });
    }

    const id = Number(req.params.id);
    const index = events.findIndex(event => event.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Event not found."
        });
    }

    const deleted = events.splice(index, 1)[0];

    attendance = attendance.filter(
        record => record.eventId !== id
    );

    res.status(200).json({
        message: "Event and its attendance records deleted.",
        data: deleted
    });
});

// =====================================
// ATTENDANCE CRUD
// =====================================

// 6. GET all attendance records.
// Optional filter: /api/attendance?eventId=1
app.get("/api/attendance", (req, res) => {
    let results = attendance;

    if (req.query.eventId !== undefined) {
        if (!validId(req.query.eventId)) {
            return res.status(400).json({
                message: "eventId must be a positive integer."
            });
        }

        results = attendance.filter(
            record => record.eventId === Number(req.query.eventId)
        );
    }

    res.status(200).json({
        count: results.length,
        data: results
    });
});

// 7. GET one attendance record.
app.get("/api/attendance/:id", (req, res) => {
    if (!validId(req.params.id)) {
        return res.status(400).json({
            message: "Attendance ID must be a positive integer."
        });
    }

    const record = attendance.find(
        item => item.id === Number(req.params.id)
    );

    if (!record) {
        return res.status(404).json({
            message: "Attendance record not found."
        });
    }

    res.status(200).json({ data: record });
});

// 8. CREATE an attendance record.
app.post("/api/attendance", (req, res) => {
    const error = validateAttendance(req.body, true);

    if (error) {
        return res.status(400).json({ message: error });
    }

    if (duplicateAttendance(req.body)) {
        return res.status(409).json({
            message: "Attendance for this student and event already exists."
        });
    }

    const record = {
        id: nextAttendanceId++,
        eventId: req.body.eventId,
        studentId: req.body.studentId.trim(),
        studentName: req.body.studentName.trim(),
        status: req.body.status
    };

    attendance.push(record);

    res.status(201).json({
        message: "Attendance recorded successfully.",
        data: record
    });
});

// 9. UPDATE an attendance record using PUT.
app.put("/api/attendance/:id", (req, res) => {
    if (!validId(req.params.id)) {
        return res.status(400).json({
            message: "Attendance ID must be a positive integer."
        });
    }

    const id = Number(req.params.id);

    const record = attendance.find(
        item => item.id === id
    );

    if (!record) {
        return res.status(404).json({
            message: "Attendance record not found."
        });
    }

    // Validate all required attendance fields.
    const error = validateAttendance(req.body, true);

    if (error) {
        return res.status(400).json({
            message: error
        });
    }

    // Prevent duplicate attendance for the same event and student.
    if (duplicateAttendance(req.body, id)) {
        return res.status(409).json({
            message: "Attendance for this student and event already exists."
        });
    }

    // Replace the entire attendance record.
    record.eventId = req.body.eventId;
    record.studentId = req.body.studentId.trim();
    record.studentName = req.body.studentName.trim();
    record.status = req.body.status;

    return res.status(200).json({
        message: "Attendance updated successfully.",
        data: record
    });
});

// 10. DELETE an attendance record.
app.delete("/api/attendance/:id", (req, res) => {
    if (!validId(req.params.id)) {
        return res.status(400).json({
            message: "Attendance ID must be a positive integer."
        });
    }

    const index = attendance.findIndex(
        item => item.id === Number(req.params.id)
    );

    if (index === -1) {
        return res.status(404).json({
            message: "Attendance record not found."
        });
    }

    const deleted = attendance.splice(index, 1)[0];

    res.status(200).json({
        message: "Attendance record deleted successfully.",
        data: deleted
    });
});

// BONUS: Attendance report for a specific event.
app.get("/api/events/:id/attendance", (req, res) => {
    if (!validId(req.params.id)) {
        return res.status(400).json({
            message: "Event ID must be a positive integer."
        });
    }

    const event = events.find(
        item => item.id === Number(req.params.id)
    );

    if (!event) {
        return res.status(404).json({
            message: "Event not found."
        });
    }

    const records = attendance.filter(
        item => item.eventId === event.id
    );

    res.status(200).json({
        event: event.title,
        totalRecords: records.length,
        present: records.filter(r => r.status === "Present").length,
        late: records.filter(r => r.status === "Late").length,
        absent: records.filter(r => r.status === "Absent").length,
        data: records
    });
});

// Return JSON for malformed JSON requests.
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({
            message: "Invalid JSON request body."
        });
    }

    next(err);
});

// Unknown endpoint handler.
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found."
    });
});

app.listen(PORT, () => {
    console.log(`Organization Events API running on port ${PORT}`);
});
