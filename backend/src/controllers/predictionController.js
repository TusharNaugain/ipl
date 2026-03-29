const Prediction = require("../models/Prediction");

exports.createPrediction = async (req, res) => {
  try {
    const { matchId, matchLabel, ballNo, prediction, confidence, isVIP } = req.body;
    if (!matchId || !matchLabel || !prediction) {
      return res.status(400).json({ error: "matchId, matchLabel, prediction required" });
    }
    const pred = await Prediction.create({
      matchId, matchLabel, ballNo, prediction,
      confidence: confidence || 75,
      isVIP: isVIP || false,
      createdBy: req.user.id
    });
    res.status(201).json(pred);
  } catch (err) {
    res.status(500).json({ error: "Failed to create prediction" });
  }
};

exports.getPredictions = async (req, res) => {
  try {
    const { matchId } = req.query;
    const filter = matchId ? { matchId } : {};
    const preds = await Prediction.find(filter).sort({ createdAt: -1 }).limit(100);
    res.json(preds);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch predictions" });
  }
};

exports.updateResult = async (req, res) => {
  try {
    const { result } = req.body;
    const pred = await Prediction.findByIdAndUpdate(
      req.params.id,
      { result },
      { new: true }
    );
    if (!pred) return res.status(404).json({ error: "Prediction not found" });
    res.json(pred);
  } catch (err) {
    res.status(500).json({ error: "Failed to update prediction" });
  }
};

exports.deletePrediction = async (req, res) => {
  try {
    await Prediction.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete prediction" });
  }
};
