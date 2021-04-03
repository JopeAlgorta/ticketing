import { Types } from 'mongoose';
import request from 'supertest';
import app from '../../app';
import { Order } from '../../models/order';
import { Ticket } from '../../models/ticket';

it('Route GET /api/tickets fetches all the orders for a particular user.', async () => {
	const ticket1 = await Ticket.build({
		id: Types.ObjectId().toHexString(),
		title: 'Ticket 1',
		price: 10
	}).save();
	const ticket2 = await Ticket.build({
		id: Types.ObjectId().toHexString(),
		title: 'Ticket 2',
		price: 20
	}).save();
	const ticket3 = await Ticket.build({
		id: Types.ObjectId().toHexString(),
		title: 'Ticket 3',
		price: 30
	}).save();

	const user1 = global.signIn();

	const { body: order1 } = await request(app)
		.post('/api/orders')
		.set('Cookie', user1)
		.send({ ticketId: ticket1.id })
		.expect(201);

	const user2 = global.signIn();

	const { body: order2 } = await request(app)
		.post('/api/orders')
		.set('Cookie', user2)
		.send({ ticketId: ticket2.id })
		.expect(201);
	const { body: order3 } = await request(app)
		.post('/api/orders')
		.set('Cookie', user2)
		.send({ ticketId: ticket3.id })
		.expect(201);

	const res1 = await request(app).get('/api/orders').set('Cookie', user1).expect(200);
	const res2 = await request(app).get('/api/orders').set('Cookie', user2).expect(200);

	expect(res1.body.length).toEqual(1);
	expect(res2.body.length).toEqual(2);

	expect(res1.body[0].id).toEqual(order1.id);
	expect(res1.body[0].ticket.id).toEqual(ticket1.id);

	expect(res2.body[0].id).toEqual(order2.id);
	expect(res2.body[1].id).toEqual(order3.id);
});
