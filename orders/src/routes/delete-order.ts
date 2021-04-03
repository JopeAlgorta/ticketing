import { NotFoundError, OrderStatus, requireAuth } from '@tickets-sh/common';
import express, { Request, Response } from 'express';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { Order } from '../models/order';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.delete('/api/orders/:id', requireAuth, async (req: Request, res: Response) => {
	const order = await Order.findById(req.params.id).populate('ticket');
	if (!order || order.userId !== req.currentUser!.id) throw new NotFoundError();

	await order.set({ status: OrderStatus.Cancelled }).save();

	new OrderCancelledPublisher(natsWrapper.client).publish({
		id: order.id,
		version: order.version,
		ticket: { id: order.ticket.id }
	});

	res.status(204).send({ message: 'Order cancelled.' });
});

export { router as deleteOrderRouter };
