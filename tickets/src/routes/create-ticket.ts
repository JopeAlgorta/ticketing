import { requireAuth, validateRequest } from '@tickets-sh/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import Ticket from '../models/ticket';
import TicketCreatedPublisher from '../events/publishers/ticket-created-publisher'
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
	'/api/tickets',
	requireAuth,
	[
		body('title').not().isEmpty().withMessage('A title must be provided.'),
		body('title').isString().withMessage('The title must be a string.'),
		body('price').not().isEmpty().withMessage('A price must be provided.'),
		body('price').isFloat({ gt: 0 }).withMessage('The price must be greater than zero.')
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const { title, price } = req.body;

		const ticket = Ticket.build({ title, price, userId: req.currentUser!.id });
		await ticket.save();
		await new TicketCreatedPublisher(natsWrapper.client).publish({
			id: ticket.id,
			title: ticket.title,
			price: ticket.price,
			userId: ticket.userId,
			version: ticket.version
		})

		res.status(201).send(ticket);
	}
);

export { router as createTicketsRouter };
