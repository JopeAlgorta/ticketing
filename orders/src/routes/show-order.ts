import { NotFoundError, requireAuth } from '@tickets-sh/common';
import express, { Request, Response } from 'express';
import { Order } from '../models/order';

const router = express.Router();

router.get('/api/orders/:id', requireAuth, async (req: Request, res: Response) => {
	const order = await Order.findById(req.params.id).populate('ticket');
	if (!order || order.userId !== req.currentUser!.id) throw new NotFoundError();

	res.send(order);
});

export { router as showOrderRouter };
