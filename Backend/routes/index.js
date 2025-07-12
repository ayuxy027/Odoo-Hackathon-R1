const express = require('express');
const users = require('./users');
const questions = require('./questions');
const answers = require('./answers');
const votes = require('./votes');
const tags = require('./tags');
const notifications = require('./notifications');

const router = express.Router();

router.use('/users', users);
router.use('/questions', questions);
router.use('/answers', answers);
router.use('/votes', votes);
router.use('/tags', tags);
router.use('/notifications', notifications);

module.exports = router; 