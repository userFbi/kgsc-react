const Counter = require("../models/Counter");

async function getNextMembershipId() {
    const counter = await Counter.findOneAndUpdate(
        { name: "membershipId" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );

    const padded = String(counter.seq).padStart(4, "0");
    return `KGSC-${padded}`;
}

module.exports = getNextMembershipId;