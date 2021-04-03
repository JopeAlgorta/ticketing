import request from 'supertest';
import app from '../../app';
import Ticket from '../../models/ticket';

const ticketSeeder = async () => {
	const ticket1 = Ticket.build({ title: 'Ticket 1', price: 30, userId: '12345' });
	await ticket1.save();
	const ticket2 = Ticket.build({ title: 'Ticket 2', price: 20, userId: '678910' });
	await ticket2.save();
	const ticket3 = Ticket.build({ title: 'Ticket 3', price: 10, userId: '1112131415' });
	await ticket3.save();
};

it('Route GET /api/tickets exists.', async () => {
	const res = await request(app).get('/api/tickets');
	expect(res.status).not.toEqual(404);
});

it('Route GET /api/tickets not require auth.', async () => {
	await request(app).get('/api/tickets').expect(200);
});

it('Route GET /api/tickets returns a list of tickets.', async () => {
	await ticketSeeder();

	const res = await request(app).get('/api/tickets').expect(200);
	expect(res.body.data.length).toEqual(3);
});
it('', async () => {});
it('', async () => {});
