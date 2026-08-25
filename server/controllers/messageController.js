const Message = require("../models/Message");
const PushSubscription = require("../models/PushSubscription");  
const webpush = require("../config/webpush");                    

// GET /api/messages
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json({ data: messages }); // 👈 wrap kiya
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

// POST /api/messages
exports.createMessage = async (req, res) => {
  try {
    const { title, message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message can't be empty." });
    }

    const newMessage = await Message.create({
      title: title?.trim() || "",
      message: message.trim(),
      senderName: req.userFullName,
      senderRole: req.userRole,
    });

    // 👇 Push notification saare subscribers ko bhejo
    const subscriptions = await PushSubscription.find();
    const payload = JSON.stringify({
      title: title?.trim() || "New announcement",
      body: message.trim(),
    });

    await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush
          .sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, payload)
          .catch(async (err) => {
            // Agar subscription expire/invalid ho gayi ho, use delete kar do
            if (err.statusCode === 410 || err.statusCode === 404) {
              await PushSubscription.findByIdAndDelete(sub._id);
            }
          }),
      ),
    );

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Create message error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

// DELETE /api/messages/:id
exports.deleteMessage = async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
};
