import { OrderCreatedEvent, OrderStatus } from '@tickets-sh/common';
import { Types } from 'mongoose';
import { Message } from 'node-nats-streaming';
import Ticket from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCreatedListener } from '../order-created-listener';

const setUp = async () => {
	const listener = new OrderCreatedListener(natsWrapper.client);

	const ticket = Ticket.build({
		title: 'Ticket 1',
		price: 10,
		userId: '123'
	});

	await ticket.save();

	const data: OrderCreatedEvent['data'] = {
		id: Types.ObjectId().toHexString(),
		version: 0,
		status: OrderStatus.Created,
		userId: '123',
		expiresAt: '123',
		ticket: {
			id: ticket.id,
			price: ticket.price
		}
	};

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn()
	};

	return { listener, ticket, data, msg };
};

it('Sets the orderId of the ticket.', async () => {
	const { listener, ticket, data, msg } = await setUp();

	await listener.onMessage(data, msg);

	const updatedTicket = await Ticket.findById(ticket.id);

	expect(updatedTicket?.orderId).toEqual(data.id);
});

it('Acknowledges the message.', async () => {
	const { listener, ticket, data, msg } = await setUp();

	await listener.onMessage(data, msg);

	expect(msg.ack).toHaveBeenCalled();
});

it('Publishes a ticket updated event.', async () => {
	const { listener, ticket, data, msg } = await setUp();

	await listener.onMessage(data, msg);

	expect(natsWrapper.client.publish).toHaveBeenCalled();

	const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

	expect(ticket.id).toEqual(ticketUpdatedData.id);
});
