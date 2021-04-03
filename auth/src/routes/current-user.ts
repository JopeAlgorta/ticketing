import express from 'express';
import 'cookie-session';
import { currentUser } from '@tickets-sh/common';

const router = express.Router();

router.get('/api/users/current', currentUser, (req, res) => {
	res.send({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };
