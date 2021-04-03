import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { BadRequestError, validateRequest } from '@tickets-sh/common';
import { User } from '../models/user';
import { Password } from '../utils/password';
import { body } from 'express-validator';

const router = express.Router();

router.post(
	'/api/users/signin',
	[
		body('email').isEmail().withMessage('Enter a valid email.'),
		body('password').trim().notEmpty().withMessage('Password field is required.')
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const { email, password } = req.body;

		const user = await User.findOne({ email });
		if (!user) throw new BadRequestError('Invalid email or password.');

		const passwordsMatch = await Password.compare(user.password, password);
		if (!passwordsMatch) throw new BadRequestError('Invalid email or password.');

		const token = jwt.sign({ id: user.id, email }, process.env.JWT_KEY!);
		req.session = { jwt: token };

		res.status(200).json({ message: 'User signed in successfully.' });
	}
);

export { router as signInRouter };
