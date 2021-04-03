import { OrderStatus } from '@tickets-sh/common';
import { Types } from 'mongoose';
import request from 'supertest';
import app from '../../app';
import { Order } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('Route DELETE /api/orders/:id cancel an order.', async () => {
	const ticket = Ticket.build({ id: Types.ObjectId().toHexString(), title: 'TIcket 1', price: 10 });
	await ticket.save();

	const user = global.signIn();

	const { body: order } = await request(app)
		.post('/api/orders')
		.set('Cookie', user)
		.send({ ticketId: ticket.id })
		.expect(201);

	await request(app).delete(`/api/orders/${order.id}`).set('Cookie', user).expect(204);

	const updatedOrder = await Order.findById(order.id);

	expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('Route DELETE /api/orders/:id emits an order cancelled event.', async () => {
	const ticket = Ticket.build({ id: Types.ObjectId().toHexString(), title: 'TIcket 1', price: 10 });
	await ticket.save();

	const user = global.signIn();

	const { body: order } = await request(app)
		.post('/api/orders')
		.set('Cookie', user)
		.send({ ticketId: ticket.id })
		.expect(201);

	await request(app).delete(`/api/orders/${order.id}`).set('Cookie', user).expect(204);

	const updatedOrder = await Order.findById(order.id);

	expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
	expect(natsWrapper.client.publish).toHaveBeenCalled();
});
