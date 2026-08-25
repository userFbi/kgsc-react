const PushSubscription = require("../models/PushSubscription");

// POST /api/push/subscribe
exports.subscribe = async (req, res) => {
  try {
    const { endpoint, keys } = req.body;

    await PushSubscription.findOneAndUpdate(
      { endpoint },
      { userId: req.userId, endpoint, keys },
      { upsert: true, new: true },
    );

    res.status(201).json({ success: true });
  } catch (error) {
    console.error("Push subscribe error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

// POST /api/push/unsubscribe
exports.unsubscribe = async (req, res) => {
  try {
    const { endpoint } = req.body;
    await PushSubscription.findOneAndDelete({ endpoint });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Push unsubscribe error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
};
