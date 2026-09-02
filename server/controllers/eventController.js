const Event = require("../models/Event");

// GET /api/events — upcoming events, sabhi logged-in users ke liye
exports.getEvents = async (req, res) => {
    try {
        const events = await Event.find({ date: { $gte: new Date() } }).sort({ date: 1 });
        res.status(200).json({ data: events });
    } catch (error) {
        console.error("Get events error:", error);
        res.status(500).json({ error: "Something went wrong." });
    }
};

// POST /api/events — sirf admin/manager
exports.createEvent = async (req, res) => {
    try {
        const { title, description, date, location } = req.body;

        if (!title || !date) {
            return res.status(400).json({ error: "Title and date are required." });
        }

        const event = await Event.create({
            title,
            description,
            date,
            location,
            createdBy: req.userId,
        });

        res.status(201).json({ data: event });
    } catch (error) {
        console.error("Create event error:", error);
        res.status(500).json({ error: "Something went wrong." });
    }
};

// DELETE /api/events/:id — sirf admin/manager
exports.deleteEvent = async (req, res) => {
    try {
        await Event.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Delete event error:", error);
        res.status(500).json({ error: "Something went wrong." });
    }
};