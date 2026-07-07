const Plan = require('../models/Plan');

exports.createPlan = async (req, res) => {
  const { planDescription, planStart, planEnd } = req.body;
  try {
    const planId = 'PLAN_' + Date.now() + Math.floor(Math.random() * 1000);
    const plan = new Plan({
      planId,
      userId: req.user.id,
      planDescription,
      planStart,
      planEnd,
      status: 'pending'
    });

    await plan.save();
    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create plan', error: error.message });
  }
};

exports.getPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ userId: req.user.id }).sort({ planStart: 1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve plans', error: error.message });
  }
};

exports.updatePlan = async (req, res) => {
  const { id } = req.params;
  const { planDescription, planStart, planEnd, status } = req.body;
  try {
    const plan = await Plan.findOne({ planId: id, userId: req.user.id });
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    if (planDescription !== undefined) plan.planDescription = planDescription;
    if (planStart !== undefined) plan.planStart = planStart;
    if (planEnd !== undefined) plan.planEnd = planEnd;
    if (status !== undefined) plan.status = status;

    await plan.save();
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update plan', error: error.message });
  }
};

exports.deletePlan = async (req, res) => {
  const { id } = req.params;
  try {
    const plan = await Plan.findOneAndDelete({ planId: id, userId: req.user.id });
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    res.json({ message: 'Plan deleted successfully', plan });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete plan', error: error.message });
  }
};
