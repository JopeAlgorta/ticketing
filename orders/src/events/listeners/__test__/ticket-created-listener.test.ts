import { TicketCreatedEvent } from '@tickets-sh/common';
import { Types } from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketCreatedListener } from '../ticket-created-listener';

const setUp = () => {
	const listener = new TicketCreatedListener(natsWrapper.client);
	const data: TicketCreatedEvent['data'] = {
		id: new Types.ObjectId().toHexString(),
		title: 'Ticket 1',
		price: 10,
		version: 0,
		userId: new Types.ObjectId().toHexString()
	};

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn()
	};

	return { listener, data, msg };
};

it('Creates and saves a ticket.', async () => {
    const { listener, data, msg } = setUp();

    await listener.onMessage(data, msg);

    const ticket = await Ticket.findById(data.id);

    expect(ticket).toBeDefined();
    expect(ticket?.title).toEqual(data.title);
    expect(ticket?.price).toEqual(data?.price);
});

it('Acknowledges the message.', async () => {
    const { listener, data, msg } = setUp();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled()
});
