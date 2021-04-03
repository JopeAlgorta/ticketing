import express from 'express';
import 'express-async-errors';
import cookieSession from 'cookie-session';

import { currentUser, errorHandler, NotFoundError } from '@tickets-sh/common';
import { getTicketsRouter } from './routes/get-tickets';
import { createTicketsRouter } from './routes/create-ticket';
import { showTicketRouter } from './routes/show-ticket';
import { updateTicketRouter } from './routes/update-ticket';

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
app.use(getTicketsRouter);
app.use(showTicketRouter);
app.use(createTicketsRouter);
app.use(updateTicketRouter);

app.all('*', () => {
	throw new NotFoundError();
});

app.use(errorHandler);

export default app;
