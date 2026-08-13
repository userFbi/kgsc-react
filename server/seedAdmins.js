require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);

    const accounts = [
        {
            fullName: "Admin User",
            email: "admin@kgsc.com",
            phone: "9999999999",
            password: "Admin@123",
            role: "admin",
            status: "approved",
        },
        {
            fullName: "Manager User",
            email: "manager@kgsc.com",
            phone: "8888888888",
            password: "Manager@123",
            role: "manager",
            status: "approved",
        },
    ];

    for (const acc of accounts) {
        const exists = await User.findOne({ email: acc.email });
        if (exists) {
            console.log(`${acc.email} already exists, skipping.`);
            continue;
        }
        const hashedPassword = await bcrypt.hash(acc.password, 10);
        await User.create({ ...acc, password: hashedPassword });
        console.log(`${acc.role} created: ${acc.email}`);
    }

    mongoose.disconnect();
}

seed();