require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Member = require("../models/Member");
const Counter = require("../models/Counter");

async function seedCounter() {
    await mongoose.connect(process.env.MONGO_URI); // apna DB connection string yahan use hoga

    // 1. User collection se sabse badi membershipId dhoondo
    const users = await User.find({ membershipId: { $ne: null } }, "membershipId");

    // 2. Member collection se bhi dhoondo (agar kuch already set hain)
    const members = await Member.find({ membershipId: { $ne: null } }, "membershipId");

    const allIds = [...users, ...members]
        .map((doc) => doc.membershipId)
        .filter(Boolean)
        .map((id) => {
            const match = id.match(/KGSC-(\d+)/);
            return match ? parseInt(match[1], 10) : 0;
        });

    const maxSeq = allIds.length > 0 ? Math.max(...allIds) : 0;

    await Counter.findOneAndUpdate(
        { name: "membershipId" },
        { $set: { seq: maxSeq } },
        { upsert: true }
    );

    console.log(`Counter seeded successfully. Current max seq = ${maxSeq}`);
    console.log(`Next member will get: KGSC-${String(maxSeq + 1).padStart(4, "0")}`);

    await mongoose.disconnect();
}

seedCounter().catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
});