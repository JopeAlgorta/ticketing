import { TicketUpdatedEvent } from '@tickets-sh/common';
import { Types } from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketUpdatedListener } from '../ticket-updated-listener';

const setUp = async () => {
	const listener = new TicketUpdatedListener(natsWrapper.client);

	const ticket = Ticket.build({
		id: new Types.ObjectId().toHexString(),
		title: 'Ticket 1',
		price: 10
	});
	await ticket.save();

	const data: TicketUpdatedEvent['data'] = {
		id: ticket.id,
		title: 'Updated title',
		price: ticket.price,
		version: ticket.version + 1,
		userId: '123'
	};

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn()
	};

	return { listener, data, msg, ticket };
};

it('Finds, updates, and saves a ticket.', async () => {
	const { listener, data, msg, ticket } = await setUp();

	await listener.onMessage(data, msg);

	const updatedTicket = await Ticket.findById(ticket.id);

	expect(updatedTicket!.title).toEqual(data.title);
	expect(updatedTicket!.price).toEqual(data.price);
	expect(updatedTicket!.version).toEqual(data.version);
});

it('Acknowledges the message.', async () => {
	const { listener, data, msg } = await setUp();

	await listener.onMessage(data, msg);

	expect(msg.ack).toHaveBeenCalled();
});

it('Does not call ack if the event has a skipped version.', async () => {
	const { listener, data, msg } = await setUp();

	data.version = 10;
	try {
		await listener.onMessage(data, msg);
	} catch (e) {}

	expect(msg.ack).not.toHaveBeenCalled();
});
