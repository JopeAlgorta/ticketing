import express from 'express';
import 'express-async-errors';
import cookieSession from 'cookie-session';

import { currentUser, errorHandler, NotFoundError } from '@tickets-sh/common';
import { getOrdersRouter } from './routes/get-orders';
import { showOrderRouter } from './routes/show-order';
import { createOrderRouter } from './routes/create-order';
import { deleteOrderRouter } from './routes/delete-order';


const app = express();
app.set('trust proxy', true);
app.use(express.json());
app.use(
	cookieSession({
		signed: false,
		secure: process.env.NODE_ENV !== 'test'
	})
);

app.use(currentUser);
app.use(getOrdersRouter);
app.use(showOrderRouter);
app.use(createOrderRouter);
app.use(deleteOrderRouter);

app.all('*', () => {
	throw new NotFoundError();
});

app.use(errorHandler);

export default app;
