import {
	BadRequestError,
	NotFoundError,
	OrderStatus,
	requireAuth,
	validateRequest
} from '@tickets-sh/common';
import { Request, Response, Router } from 'express';
import { body } from 'express-validator';
import { PaymentCreatedPublisher } from '../events/publishers/payment.-created-publisher';
import { Order } from '../models/order';
import { Payment } from '../models/payment';
import { natsWrapper } from '../nats-wrapper';
import { stripe } from '../stripe';

const router = Router();

router.post(
	'/api/payments',
	requireAuth,
	[body('token').not().isEmpty(), body('orderId').not().isEmpty()],
	validateRequest,
	async (req: Request, res: Response) => {
		const { token, orderId } = req.body;

		const order = await Order.findById(orderId);

		if (!order || order.userId !== req.currentUser!.id) throw new NotFoundError();
		if (order.status === OrderStatus.Cancelled)
			throw new BadRequestError('The order you want to pay for had been cancelled.');

		const charge = await stripe.charges.create({
			currency: 'usd',
			amount: order.price * 100,
			source: token,
			description: `Charge of $${order.price} for order: ${order.id}.`
		});

		const payment = Payment.build({ orderId: order.id, stripeId: charge.id });
		payment.save();

		new PaymentCreatedPublisher(natsWrapper.client).publish({
			id: payment.id,
			orderId: payment.orderId,
			stripeId: payment.stripeId
		});

		res.status(201).send({ id: payment.id });
	}
);

export { router as createChargeRouter };
