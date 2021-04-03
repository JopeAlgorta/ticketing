import request from 'supertest';
import app from '../../app';
import Ticket from '../../models/ticket';

it('GET /api/tickets/:id returns 404 if the ticket is not found.', async () => {
	await request(app).get('/api/tickets/not-found-ticket').expect(404);
});

it('GET /api/tickets/:id returns 200 and the ticket if the ticket is found.', async () => {
	const ticket = Ticket.build({ title: 'Ticket 1', price: 30, userId: '12345' });
	await ticket.save();

	const res = await request(app).get(`/api/tickets/${ticket.id}`).expect(200);
	expect(res.body.title).toEqual(ticket.title);
	expect(res.body.price).toEqual(ticket.price);
	expect(res.body.userId).toEqual(ticket.userId);
});

it('GET /api/tickets/:id returns 404 if the ticket is not found.', async () => {});
