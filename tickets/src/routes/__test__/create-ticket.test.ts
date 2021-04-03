import request from 'supertest';
import app from '../../app';
import Ticket from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('Route POST /api/tickets exists.', async () => {
	const res = await request(app).post('/api/tickets').send({});
	expect(res.status).not.toEqual(404);
});

it('Route POST /api/tickets require auth.', async () => {
	await request(app).post('/api/tickets').send({}).expect(401);
});

it('Route POST /api/tickets not returns 401 if user is logged in.', async () => {
	const cookie = global.signIn();
	const res = await request(app).post('/api/tickets').set('Cookie', cookie).send({});
	expect(res.status).not.toEqual(401);
});

it('Route POST /api/tickets returns 400 if invalid title.', async () => {
	const cookie = global.signIn();
	await request(app).post('/api/tickets').set('Cookie', cookie).send({ title: '', price: 10 }).expect(400);
	await request(app).post('/api/tickets').set('Cookie', cookie).send({ price: 10 }).expect(400);
});

it('Route POST /api/tickets returns 400 if invalid price.', async () => {
	const cookie = global.signIn();
	await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({ title: 'Ticket 1', price: -1 })
		.expect(400);
	await request(app).post('/api/tickets').set('Cookie', cookie).send({ title: 'Ticket 1' }).expect(400);
});

it('Route POST /api/tickets creates a ticket and returns 201.', async () => {
	let tickets = await Ticket.find();

	expect(tickets.length).toEqual(0);

	const title = 'Ticket 1';
	const price = 30;

	const cookie = global.signIn();
	const res = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({ title, price })
		.expect(201);

	tickets = await Ticket.find();

	expect(tickets.length).toEqual(1);
	expect(tickets[0].title).toEqual(title);
	expect(tickets[0].price).toEqual(price);
});

it('Route POST /api/tickets publishes an event.', async () => {
	const title = 'title';

	await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signIn())
		.send({
			title,
			price: 20
		})
		.expect(201);

	expect(natsWrapper.client.publish).toHaveBeenCalled();
});
