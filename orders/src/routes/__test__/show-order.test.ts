import { Types } from 'mongoose';
import request from 'supertest';
import app from '../../app';
import { Ticket } from '../../models/ticket';

it('Route GET /api/orders/:id fetches the correct order.', async () => {
	const ticket = Ticket.build({ id: Types.ObjectId().toHexString(), title: 'Ticket 1', price: 10 });
	await ticket.save();

	const user = global.signIn();

	const { body: order } = await request(app)
		.post('/api/orders')
		.set('Cookie', user)
		.send({ ticketId: ticket.id })
		.expect(201);

	const { body: fetchedOrder } = await request(app)
		.get(`/api/orders/${order.id}`)
		.set('Cookie', user)
		.expect(200);

	expect(fetchedOrder.id).toEqual(order.id);
});
