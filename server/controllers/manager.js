// controllers/managerController.js
const Member = require("../models/manager");

/* ============================================================
   DASHBOARD  →  Dashboard.jsx
   GET /api/manager/dashboard
   ============================================================ */
const getDashboardStats = async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        const totalMembers = await Member.countDocuments();
        const newThisMonth = await Member.countDocuments({
            joined: { $gte: startOfMonth, $lt: startOfNextMonth },
        });
        const existingMembers = totalMembers - newThisMonth;

        const recentMembers = await Member.find()
            .sort({ joined: -1 })
            .limit(5)
            .select("name phone joined")
            .lean();

        return res.status(200).json({
            success: true,
            data: { totalMembers, newThisMonth, existingMembers, recentMembers },
        });
    } catch (error) {
        console.error("Dashboard stats error:", error.message);
        return res.status(500).json({ success: false, message: "Failed to load dashboard stats" });
    }
};

/* ============================================================
   MEMBERS  →  AddMember.jsx / ViewMembers.jsx
   ============================================================ */

// GET /api/manager/members  (ViewMembers.jsx roster + search handled client-side, or ?q=)
const getMembers = async (req, res) => {
    try {
        const { q } = req.query;
        const filter = q
            ? {
                $or: [
                    { name: { $regex: q, $options: "i" } },
                    { phone: { $regex: q, $options: "i" } },
                    { address: { $regex: q, $options: "i" } },
                ],
            }
            : {};

        const members = await Member.find(filter).sort({ joined: -1 }).lean();
        return res.status(200).json({ success: true, data: members });
    } catch (error) {
        console.error("Get members error:", error.message);
        return res.status(500).json({ success: false, message: "Failed to load members" });
    }
};

// GET /api/manager/members/:id  (ViewMembers.jsx "view details" modal)
const getMemberById = async (req, res) => {
    try {
        const member = await Member.findById(req.params.id);
        if (!member) return res.status(404).json({ success: false, message: "Member not found" });
        return res.status(200).json({ success: true, data: member });
    } catch (error) {
        console.error("Get member error:", error.message);
        return res.status(500).json({ success: false, message: "Failed to load member" });
    }
};

// POST /api/manager/members  (AddMember.jsx)
const createMember = async (req, res) => {
    try {
        const { name, phone, aadhar, address, tshirtSize, shortsSize } = req.body;

        if (!name || !phone || !aadhar || !address || !tshirtSize || !shortsSize) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }
        if (!/^[0-9]{10}$/.test(phone)) {
            return res.status(400).json({ success: false, message: "Enter a valid 10-digit phone number." });
        }
        if (!/^[0-9]{12}$/.test(aadhar)) {
            return res.status(400).json({ success: false, message: "Enter a valid 12-digit Aadhar number." });
        }

        const existing = await Member.findOne({ phone });
        if (existing) {
            return res.status(409).json({ success: false, message: "A member with this phone number already exists." });
        }

        const member = await Member.create({
            name: name.trim(),
            phone: phone.trim(),
            aadhar: aadhar.trim(),
            address: address.trim(),
            tshirtSize,
            shortsSize,
            joined: new Date(),
        });

        return res.status(201).json({ success: true, message: "Member added to the roster.", data: member });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: "A member with this phone number already exists." });
        }
        console.error("Create member error:", error.message);
        return res.status(500).json({ success: false, message: "Failed to add member." });
    }
};

// PUT /api/manager/members/:id  (ViewMembers.jsx edit modal)
const updateMember = async (req, res) => {
    try {
        const { name, phone, aadhar, address, tshirtSize, shortsSize } = req.body;

        if (phone && !/^[0-9]{10}$/.test(phone)) {
            return res.status(400).json({ success: false, message: "Enter a valid 10-digit phone number." });
        }
        if (aadhar && !/^[0-9]{12}$/.test(aadhar)) {
            return res.status(400).json({ success: false, message: "Enter a valid 12-digit Aadhar number." });
        }

        if (phone) {
            const dupe = await Member.findOne({ phone, _id: { $ne: req.params.id } });
            if (dupe) {
                return res.status(409).json({ success: false, message: "Another member already uses this phone number." });
            }
        }

        const updated = await Member.findByIdAndUpdate(
            req.params.id,
            { name, phone, aadhar, address, tshirtSize, shortsSize },
            { new: true, runValidators: true }
        );

        if (!updated) return res.status(404).json({ success: false, message: "Member not found" });
        return res.status(200).json({ success: true, message: "Member updated.", data: updated });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: "Another member already uses this phone number." });
        }
        console.error("Update member error:", error.message);
        return res.status(500).json({ success: false, message: "Failed to update member." });
    }
};

// DELETE /api/manager/members/:id  (ViewMembers.jsx remove)
const deleteMember = async (req, res) => {
    try {
        const deleted = await Member.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ success: false, message: "Member not found" });
        return res.status(200).json({ success: true, message: "Member removed." });
    } catch (error) {
        console.error("Delete member error:", error.message);
        return res.status(500).json({ success: false, message: "Failed to delete member." });
    }
};

/* ============================================================
   INSURANCE  →  InsuranceMembers.jsx
   ============================================================ */

// GET /api/manager/members/insured  (insured table, ?q= for search)
const getInsuredMembers = async (req, res) => {
    try {
        const { q } = req.query;
        const filter = { insurance: true };
        if (q) {
            filter.$or = [
                { name: { $regex: q, $options: "i" } },
                { phone: { $regex: q, $options: "i" } },
            ];
        }
        const members = await Member.find(filter).sort({ joined: -1 }).lean();
        return res.status(200).json({ success: true, data: members });
    } catch (error) {
        console.error("Get insured members error:", error.message);
        return res.status(500).json({ success: false, message: "Failed to load insured members." });
    }
};

// PATCH /api/manager/members/:id/insurance  (add to insurance + nominee form)
const addInsurance = async (req, res) => {
    try {
        const { name, relation, phone } = req.body;

        if (!name || !relation || !/^[0-9]{10}$/.test(phone || "")) {
            return res.status(400).json({ success: false, message: "Enter a valid nominee name, relation, and 10-digit phone." });
        }

        const updated = await Member.findByIdAndUpdate(
            req.params.id,
            { insurance: true, nominee: { name: name.trim(), relation, phone: phone.trim() } },
            { new: true, runValidators: true }
        );

        if (!updated) return res.status(404).json({ success: false, message: "Member not found" });
        return res.status(200).json({ success: true, message: "Member added to insurance.", data: updated });
    } catch (error) {
        console.error("Add insurance error:", error.message);
        return res.status(500).json({ success: false, message: "Failed to add member to insurance." });
    }
};

// DELETE /api/manager/members/:id/insurance  (remove from insurance)
const removeInsurance = async (req, res) => {
    try {
        const updated = await Member.findByIdAndUpdate(
            req.params.id,
            { insurance: false, nominee: null },
            { new: true }
        );
        if (!updated) return res.status(404).json({ success: false, message: "Member not found" });
        return res.status(200).json({ success: true, message: "Insurance removed.", data: updated });
    } catch (error) {
        console.error("Remove insurance error:", error.message);
        return res.status(500).json({ success: false, message: "Failed to remove insurance." });
    }
};

module.exports = {
    getDashboardStats,
    getMembers,
    getMemberById,
    createMember,
    updateMember,
    deleteMember,
    getInsuredMembers,
    addInsurance,
    removeInsurance,
};