const User = require("../models/User");
const Member = require("../models/Member");

// POST /api/manager/members
exports.addMember = async (req, res) => {
  try {
    const { name, phone, aadhar, address, tshirtSize, shortsSize } = req.body;

    if (!name || !phone || !aadhar || !address || !tshirtSize || !shortsSize) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const member = await Member.create({
      name,
      phone,
      aadhar,
      address,
      tshirtSize,
      shortsSize,
      addedBy: req.userId,
    });

    res.status(201).json({ data: member });
  } catch (error) {
    console.error("Add member error:", error);
    res.status(500).json({ error: "Something went wrong. Try again." });
  }
};

// GET /api/manager/members
exports.getMembers = async (req, res) => {
  try {
    const members = await Member.find().sort({ joined: -1 });
    res.status(200).json({ data: members });
  } catch (error) {
    console.error("Get members error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

// GET /api/manager/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const members = await Member.find().sort({ joined: -1 });

    const now = new Date();
    const newThisMonth = members.filter((m) => {
      const d = new Date(m.joined);
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    }).length;

    const insuredCount = members.filter((m) => m.insurance).length;

    res.status(200).json({
      data: {
        totalMembers: members.length,
        newThisMonth,
        existingMembers: members.length - newThisMonth,
        insuredCount,
        recentMembers: members.slice(0, 5),
      },
    });
  } catch (error) {
    console.error("Get dashboard error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

// PATCH /api/manager/members/:id/insurance
exports.addInsurance = async (req, res) => {
  try {
    const { name, relation, phone } = req.body;

    if (!name || !relation || !phone) {
      return res.status(400).json({ error: "Nominee details are required." });
    }

    const member = await Member.findByIdAndUpdate(
      req.params.id,
      { insurance: true, nominee: { name, relation, phone } },
      { new: true },
    );

    if (!member) {
      return res.status(404).json({ error: "Member not found." });
    }

    res.status(200).json({ data: member });
  } catch (error) {
    console.error("Add insurance error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

// DELETE /api/manager/members/:id/insurance
exports.removeInsurance = async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(
      req.params.id,
      { insurance: false, nominee: null },
      { new: true },
    );

    if (!member) {
      return res.status(404).json({ error: "Member not found." });
    }

    res.status(200).json({ data: member });
  } catch (error) {
    console.error("Remove insurance error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

// PUT /api/manager/members/:id  (edit)
exports.updateMember = async (req, res) => {
  try {
    const { name, phone, aadhar, address, tshirtSize, shortsSize } = req.body;
    const member = await Member.findByIdAndUpdate(
      req.params.id,
      { name, phone, aadhar, address, tshirtSize, shortsSize },
      { new: true }
    );
    if (!member) return res.status(404).json({ error: "Member not found." });

    // 👇 Agar ye member kisi User account se linked hai, User bhi sync karo
    if (member.userId) {
      const isProfileComplete = Boolean(aadhar && address);
      await User.findByIdAndUpdate(member.userId, {
        fullName: name,
        aadharNumber: aadhar,
        address,
        tshirtSize,
        shortsSize,
        isProfileComplete,
      });
    }

    res.status(200).json({ data: member });
  } catch (error) {
    console.error("Update member error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

// DELETE /api/manager/members/:id  (delete — ViewMembers.jsx ke liye)
exports.deleteMember = async (req, res) => {
  try {
    await Member.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Delete member error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
};
