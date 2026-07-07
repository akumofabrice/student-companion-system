const Goal = require('../models/Goal');

exports.createGoal = async (req, res) => {
  const { goalDescription, goalCategory } = req.body;
  try {
    const goalId = 'GOAL_' + Date.now() + Math.floor(Math.random() * 1000);
    const goal = new Goal({
      goalId,
      userId: req.user.id,
      goalDescription,
      goalCategory,
      status: 'active'
    });

    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create goal', error: error.message });
  }
};

exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve goals', error: error.message });
  }
};

exports.updateGoal = async (req, res) => {
  const { id } = req.params;
  const { goalDescription, goalCategory, status } = req.body;
  try {
    const goal = await Goal.findOne({ goalId: id, userId: req.user.id });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (goalDescription !== undefined) goal.goalDescription = goalDescription;
    if (goalCategory !== undefined) goal.goalCategory = goalCategory;
    if (status !== undefined) goal.status = status;

    await goal.save();
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update goal', error: error.message });
  }
};

exports.deleteGoal = async (req, res) => {
  const { id } = req.params;
  try {
    const goal = await Goal.findOneAndDelete({ goalId: id, userId: req.user.id });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    res.json({ message: 'Goal deleted successfully', goal });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete goal', error: error.message });
  }
};
