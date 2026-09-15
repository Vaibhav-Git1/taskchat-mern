const router = require('express').Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');

const withPopulate = (query) =>
  query
    .populate('assignedTo', 'name email')
    .populate('assignedBy', 'name email');

// My tasks (created by me or assigned to me)
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await withPopulate(
      Task.find({
        $or: [{ assignedBy: req.user.id }, { assignedTo: req.user.id }],
      }).sort({ createdAt: -1 })
    );
    res.json(tasks);
  } catch {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Search tasks
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const tasks = await withPopulate(
      Task.find({
        $and: [
          { $or: [{ assignedBy: req.user.id }, { assignedTo: req.user.id }] },
          {
            $or: [
              { title: { $regex: q, $options: 'i' } },
              { description: { $regex: q, $options: 'i' } },
            ],
          },
        ],
      })
    );
    res.json(tasks);
  } catch {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, dueDate, assignedTo } = req.body;
    if (!title) return res.status(400).json({ msg: 'Title is required' });

    const created = await Task.create({
      title,
      description,
      dueDate: dueDate || null,
      assignedTo: assignedTo || null,
      assignedBy: req.user.id,
    });

    const task = await withPopulate(Task.findById(created._id));
    res.json(task);
  } catch {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update task (with permission enforcement)
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: 'Task not found' });

    const isCreator = task.assignedBy.toString() === req.user.id;
    const isAssignee = task.assignedTo?.toString() === req.user.id;

    if (!isCreator && !isAssignee)
      return res.status(403).json({ msg: 'Not authorized to modify this task' });

    // Assigned user can ONLY update status
    if (isAssignee && !isCreator) {
      const forbidden = Object.keys(req.body).filter((k) => k !== 'status');
      if (forbidden.length > 0)
        return res.status(403).json({ msg: 'Assigned users can only update the status field' });
    }

    Object.assign(task, req.body);
    await task.save();

    const updated = await withPopulate(Task.findById(task._id));
    res.json(updated);
  } catch {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
