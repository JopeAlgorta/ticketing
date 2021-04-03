import { BadRequestError, NotAuthorizedError, NotFoundError, requireAuth, validateRequest } from '@tickets-sh/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import mongoose from 'mongoose';
import TicketUpdatedPublisher from '../events/publishers/ticket-updated-publisher';
import Ticket from '../models/ticket';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.put(
	'/api/tickets/:id',
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

		const id = req.params.id;
		if (!mongoose.Types.ObjectId.isValid(id)) throw new NotFoundError();

		const ticket = await Ticket.findById(id);

		if (!ticket) throw new NotFoundError();
		if (ticket.userId !== req.currentUser!.id) throw new NotAuthorizedError();
		if (ticket.orderId) throw new BadRequestError('Ticket not available to update. Is reserved.');

		await ticket.set({ title, price }).save();
		new TicketUpdatedPublisher(natsWrapper.client).publish({
			id: ticket.id,
			title: ticket.title,
			price: ticket.price,
			userId: ticket.userId,
			version: ticket.version
		});

		res.status(200).json(ticket);
	}
);

export { router as updateTicketRouter };
