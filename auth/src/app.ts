import express from 'express';
import 'express-async-errors';
import cookieSession from 'cookie-session';

import { currentUserRouter } from './routes/current-user';
import { signOutRouter } from './routes/signout';
import { signUpRouter } from './routes/signup';
import { signInRouter } from './routes/signin';
import { errorHandler, NotFoundError } from '@tickets-sh/common';

const app = express();
app.set('trust proxy', true);
app.use(express.json());
app.use(
	cookieSession({
		signed: false,
		secure: process.env.NODE_ENV !== 'test'
	})
);

app.use(currentUserRouter);
app.use(signOutRouter);
app.use(signUpRouter);
app.use(signInRouter);

app.all('*', () => {
	throw new NotFoundError();
});

app.use(errorHandler);

export default app;
