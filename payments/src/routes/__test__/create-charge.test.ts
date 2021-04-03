import { OrderStatus } from '@tickets-sh/common';
import { Types } from 'mongoose';
import request from 'supertest';
import app from '../../app';
import { Order } from '../../models/order';
import { Payment } from '../../models/payment';
import { stripe } from '../../stripe';

it('Route POST /api/payments returns 404 if order does not exists.', async () => {
	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signIn())
		.send({ token: '123', orderId: Types.ObjectId().toHexString() })
		.expect(404);
});

it('Route POST /api/payments returns 404 if order does not belongs to the user.', async () => {
	const userId = Types.ObjectId().toHexString();
	const user = global.signIn(userId);
	const order = Order.build({
		id: Types.ObjectId().toHexString(),
		status: OrderStatus.Created,
		version: 0,
		userId,
		price: 10
	});

	await order.save();

	await request(app)
		.post('/api/payments')
		.set('Cookie', user)
		.send({ token: 'tok_visa', orderId: order.id })
		.expect(201);

	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signIn())
		.send({ token: 'tok_visa', orderId: order.id })
		.expect(404);
});

it('Route POST /api/payments returns 400 if a cancelled order wants to be purchased.', async () => {
	const userId = Types.ObjectId().toHexString();
	const user = global.signIn(userId);
	const order = Order.build({
		id: Types.ObjectId().toHexString(),
		status: OrderStatus.Cancelled,
		version: 0,
		userId,
		price: 10
	});

	await order.save();

	await request(app)
		.post('/api/payments')
		.set('Cookie', user)
		.send({ token: 'tok_visa', orderId: order.id })
		.expect(400);
});

it('Route POST /api/payments returns 201 if charge payload is correct.', async () => {
	const price = Math.floor(Math.random() * 100000);

	const userId = Types.ObjectId().toHexString();
	const user = global.signIn(userId);

	const order = Order.build({
		id: Types.ObjectId().toHexString(),
		status: OrderStatus.Created,
		version: 0,
		userId,
		price
	});

	await order.save();

	await request(app)
		.post('/api/payments')
		.set('Cookie', user)
		.send({ token: 'tok_visa', orderId: order.id })
		.expect(201);

	/* Implementation for mocking the stripe client 
	const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
	expect(chargeOptions.source).toEqual('tok_visa');
	expect(chargeOptions.currency).toEqual('usd');
	expect(chargeOptions.amount).toEqual(order.price * 100);
	*/

	const { data } = await stripe.charges.list({ limit: 50 });

	const charge = data.find(charge => charge.amount === price * 100);

	const payment = await Payment.findOne({ orderId: order.id, stripeId: charge!.id });

	expect(charge).toBeDefined();
	expect(charge!.currency).toEqual('usd');
	expect(charge!.amount).toEqual(order.price * 100);

	expect(payment).not.toBeNull();
});
