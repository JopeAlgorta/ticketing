import { OrderCancelledEvent, OrderCreatedEvent, OrderStatus } from '@tickets-sh/common';
import { Types } from 'mongoose';
import { Message } from 'node-nats-streaming';
import Ticket from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledListener } from '../order-cancelled-listener';

const setUp = async () => {
	const listener = new OrderCancelledListener(natsWrapper.client);

	const orderId = Types.ObjectId().toHexString();
	const ticket = Ticket.build({
		title: 'Ticket 1',
		price: 10,
		userId: '123'
	});
	await ticket.set({ orderId }).save();

	const data: OrderCancelledEvent['data'] = {
		id: Types.ObjectId().toHexString(),
		version: 0,
		ticket: {
			id: ticket.id
		}
	};

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn()
	};

	return { listener, ticket, data, msg };
};

it('Unsets the orderId of the ticket.', async () => {
	const { listener, ticket, data, msg } = await setUp();

	await listener.onMessage(data, msg);

	const updatedTicket = await Ticket.findById(ticket.id);

	expect(updatedTicket?.orderId).toBeUndefined();
});

it('Acknowledges the message.', async () => {
	const { listener, data, msg } = await setUp();

	await listener.onMessage(data, msg);

	expect(msg.ack).toHaveBeenCalled();
});

it('Publishes a ticket cancelled event.', async () => {
	const { listener, ticket, data, msg } = await setUp();

	await listener.onMessage(data, msg);

	expect(natsWrapper.client.publish).toHaveBeenCalled();

	const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

	expect(ticket.id).toEqual(ticketUpdatedData.id);
	expect(ticketUpdatedData?.orderId).toBeUndefined();
});
