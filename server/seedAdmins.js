require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Member = require("./models/Member");


const accounts = [
    {
        fullName: "Tushar Pawar",
        email: "tusharpawar20049@gmail.com",
        phone: "9725720612",      
        password: "Admin@kgsc1988",
        role: "admin",
        status: "approved",
        membershipId: "KGSC-0001",
    },
    {
        fullName: "Nayan Nirmal",
        email: "nayannirmal04@gmail.com",
        phone: "9081818035",       
        password: "Manager@kgsc", 
        role: "manager",
        status: "approved",
        membershipId: "KGSC-0002",
    },
];

// Run as `node seedAdmin.js --reset` to wipe ALL existing users + members first.
// Run as plain `node seedAdmin.js` to just create/update the accounts above
// without touching anyone else's data.
const RESET = process.argv.includes("--reset");

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected.\n");

    if (RESET) {
        const deletedUsers = await User.deleteMany({});
        const deletedMembers = await Member.deleteMany({});
        console.log(
            `⚠ --reset flag used: deleted ${deletedUsers.deletedCount} users and ${deletedMembers.deletedCount} members.\n`
        );
    }

    for (const acc of accounts) {
        if (acc.password.startsWith("CHANGE_ME")) {
            console.log(
                `Skipping ${acc.role} — please edit the password placeholder in this file first.`
            );
            continue;
        }

        const hashedPassword = await bcrypt.hash(acc.password, 10);

        // Upsert by phone number, so re-running this script updates the
        // same account instead of erroring on duplicates.
        const user = await User.findOneAndUpdate(
            { phone: acc.phone },
            {
                fullName: acc.fullName,
                email: acc.email.toLowerCase(),
                phone: acc.phone,
                password: hashedPassword,
                role: acc.role,
                status: acc.status,
                membershipId: acc.membershipId,
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        console.log(`✔ ${acc.role} ready: ${user.fullName} (${user.membershipId})`);
    }

    await mongoose.disconnect();
    console.log("\nDone.");
}

seed().catch((err) => {
    console.error("Seed failed:", err.message);
    process.exit(1);
});