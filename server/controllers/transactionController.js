const Transaction = require("../models/Transaction");

// GET /api/transactions
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 });
    res.status(200).json({ data: transactions });
  } catch (error) {
    console.error("Get transactions error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

// POST /api/transactions
exports.createTransaction = async (req, res) => {
  try {
    const { type, amount, date, category, description } = req.body;

    if (!type || !amount || !date || !category) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const transaction = await Transaction.create({
      type,
      amount,
      date,
      category,
      description,
      createdBy: req.userId,
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error("Create transaction error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

// DELETE /api/transactions/:id
exports.deleteTransaction = async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Delete transaction error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
};
