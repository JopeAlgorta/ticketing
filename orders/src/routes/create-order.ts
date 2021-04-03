import {
	BadRequestError,
	NotFoundError,
	OrderStatus,
	requireAuth,
	validateRequest
} from '@tickets-sh/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { Order } from '../models/order';
import { Ticket } from '../models/ticket';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 60;

router.post(
	'/api/orders',
	requireAuth,
	[body('ticketId').not().isEmpty().withMessage('THe order must have a reference to a ticket.')],
	validateRequest,
	async (req: Request, res: Response) => {
		const { ticketId } = req.body;

		const ticket = await Ticket.findById(ticketId);
		if (!ticket) throw new NotFoundError();

		if (await ticket.isReserved()) throw new BadRequestError('Ticket is already reserved.');

		const expiration = new Date();
		expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

		const order = Order.build({
			userId: req.currentUser!.id,
			status: OrderStatus.AwaitingPayment,
			expiresAt: expiration,
			ticket
		});

		await order.save();

		new OrderCreatedPublisher(natsWrapper.client).publish({
			id: order.id,
			status: order.status,
			userId: order.userId,
			expiresAt: order.expiresAt.toISOString(),
			version: order.version,
			ticket: { id: ticket.id, price: ticket.price }
		});

		res.status(201).send(order);
	}
);

export { router as createOrderRouter };
