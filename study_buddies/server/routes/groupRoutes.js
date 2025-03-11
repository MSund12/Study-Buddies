import express from 'express';
const router = express.Router();

router.post('/create', async (req, res) => {
  const { course, groupName, maxMembers } = req.body;

  if (!course || !groupName || !maxMembers) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Simulate saving the group to your database (MongoDB)
  const newGroup = { course, groupName, maxMembers };
  console.log('Group Created:', newGroup);

  res.status(201).json({ message: 'Group created successfully!', newGroup });
});

export default router;
