import request from 'supertest';
import app from '../../app';
import mongoose, { Types } from 'mongoose';
import { Ticket } from '../../models/ticket';
import { Order } from '../../models/order';
import { OrderStatus } from '@tickets-sh/common';
import { natsWrapper } from '../../nats-wrapper';

it('Route POST /api/orders returns 404 if the ticket does not exists.', async () => {
	const ticketId = Types.ObjectId();
	await request(app).post('/api/orders').set('Cookie', global.signIn()).send({ ticketId }).expect(404);
});

it('Route POST /api/orders returns 400 if the ticket is already reserved.', async () => {
	const ticket = Ticket.build({ id: Types.ObjectId().toHexString(), title: 'Ticket 1', price: 10 });
	await ticket.save();

	const order = Order.build({
		ticket,
		userId: 'qwerty',
		status: OrderStatus.Created,
		expiresAt: new Date()
	});

	await order.save();

	await request(app)
		.post('/api/orders')
		.set('Cookie', global.signIn())
		.send({ ticketId: ticket.id })
		.expect(400);
});

it('Route POST /api/orders returns 201 if the order is created successfully.', async () => {
	const ticket = Ticket.build({ id: Types.ObjectId().toHexString(), title: 'Ticket 1', price: 10 });
	await ticket.save();

	await request(app)
		.post('/api/orders')
		.set('Cookie', global.signIn())
		.send({ ticketId: ticket.id })
		.expect(201);
});

it('Route POST /api/orders emits an order created event.', async () => {
	const ticket = Ticket.build({ id: Types.ObjectId().toHexString(), title: 'Ticket 1', price: 10 });
	await ticket.save();

	await request(app)
		.post('/api/orders')
		.set('Cookie', global.signIn())
		.send({ ticketId: ticket.id })
		.expect(201);

	expect(natsWrapper.client.publish).toHaveBeenCalled();
});
