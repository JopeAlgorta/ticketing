import { Types } from 'mongoose';
import request from 'supertest';
import app from '../../app';
import Ticket from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('Route PUT /api/tickets returns 404 if ticket does not exist.', async () => {
	await request(app)
		.put('/api/tickets/not-found-ticket')
		.set('Cookie', global.signIn())
		.send({ title: 'Ticket updated', price: 34 })
		.expect(404);
});

it('Route PUT /api/tickets returns 401 if user does not owned that ticket.', async () => {
	const ticket = Ticket.build({ title: 'Ticket 1', price: 30, userId: 'other-user-id' });
	await ticket.save();

	await request(app)
		.put(`/api/tickets/${ticket.id}`)
		.set('Cookie', global.signIn())
		.send({ title: 'Ticket updated', price: 34 })
		.expect(401);
});

it('Route PUT /api/tickets returns 401 if user is not authenticated', async () => {
	await request(app)
		.put('/api/tickets/not-found-ticket')
		.send({ title: 'Ticket updated', price: 34 })
		.expect(401);
});

it('Route PUT /api/tickets returns 400 if user provides invalid title or price.', async () => {
	const ticket = Ticket.build({ title: 'Ticket 1', price: 30, userId: '12345' });
	await ticket.save();

	await request(app)
		.put(`/api/tickets/${ticket.id}`)
		.set('Cookie', global.signIn())
		.send({ title: '', price: 34 })
		.expect(400);

	await request(app)
		.put(`/api/tickets/${ticket.id}`)
		.set('Cookie', global.signIn())
		.send({ price: 34 })
		.expect(400);

	await request(app)
		.put(`/api/tickets/${ticket.id}`)
		.set('Cookie', global.signIn())
		.send({ title: 'Ticket updated', price: -1 })
		.expect(400);

	await request(app)
		.put(`/api/tickets/${ticket.id}`)
		.set('Cookie', global.signIn())
		.send({ title: 'Ticket updated' })
		.expect(400);
});

it('Route PUT /api/tickets returns 200 ', async () => {
	const cookie = global.signIn();
	const { body } = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({ title: 'Ticket 1', price: 10 })
		.expect(201);

	const title = 'Ticket updated';

	const res = await request(app)
		.put(`/api/tickets/${body.id}`)
		.set('Cookie', cookie)
		.send({ title, price: 34 })
		.expect(200);

	expect(res.body.title).toEqual(title);
});

it('Route PUT /api/tickets publishes an event.', async () => {
	const cookie = global.signIn();

	const response = await request(app).post('/api/tickets').set('Cookie', cookie).send({
		title: 'title',
		price: 20
	});

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: 'new title',
			price: 100
		})
		.expect(200);

	expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('Route PUT /api/tickets rejects updates if ticket is reserved.', async () => {
	const cookie = global.signIn();
	const { body } = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({ title: 'Ticket 1', price: 10 })
		.expect(201);

	const ticket = await Ticket.findById(body.id);
	await ticket!.set({ orderId: Types.ObjectId().toHexString() }).save();

	const title = 'Ticket updated';
	await request(app)
		.put(`/api/tickets/${body.id}`)
		.set('Cookie', cookie)
		.send({ title, price: 34 })
		.expect(400);
});
