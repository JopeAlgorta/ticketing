import { OrderCreatedEvent, OrderStatus } from '@tickets-sh/common';
import { Types } from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Order } from '../../../models/order';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCreatedListener } from '../order-created-listener';

const setUp = async () => {
	const listener = new OrderCreatedListener(natsWrapper.client);

	const data: OrderCreatedEvent['data'] = {
		id: Types.ObjectId().toHexString(),
		version: 0,
		status: OrderStatus.Created,
		userId: '123',
		expiresAt: '123',
		ticket: {
			id: Types.ObjectId().toHexString(),
			price: 10
		}
	};

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn()
	};

	return { listener, data, msg };
};

it('Replicates order info.', async () => {
	const { listener, data, msg } = await setUp();

	await listener.onMessage(data, msg);

	const order = await Order.findById(data.id);

	expect(order!.id).toEqual(data.id);
	expect(order!.price).toEqual(data.ticket.price);
});

it('Acknowledges the message.', async () => {
	const { listener, data, msg } = await setUp();

	await listener.onMessage(data, msg);

	expect(msg.ack).toHaveBeenCalled();
});
