import { ExpirationCompleteEvent, OrderStatus } from '@tickets-sh/common';
import { Types } from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Order } from '../../../models/order';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { ExpirationCompleteListener } from '../expiration-complete-listener';

const setUp = async () => {
	const listener = new ExpirationCompleteListener(natsWrapper.client);

	const ticket = Ticket.build({ title: 'Ticket 1', price: 10, id: Types.ObjectId().toHexString() });
	await ticket.save();

	const order = Order.build({
		status: OrderStatus.Created,
		userId: '123',
		expiresAt: new Date(),
		ticket
	});
	await order.save();

	const data: ExpirationCompleteEvent['data'] = {
		orderId: order.id
	};

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn()
	};

	return { listener, ticket, order, data, msg };
};

it('Updates the order status to cancelled.', async () => {
	const { listener, order, data, msg } = await setUp();

	await listener.onMessage(data, msg);

	const updatedOrder = await Order.findById(order.id);

	expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('Emit an OrderCancelled event.', async () => {
	const { listener, order, data, msg } = await setUp();

	await listener.onMessage(data, msg);

	expect(natsWrapper.client.publish).toHaveBeenCalled();
	expect(JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]).id).toEqual(order.id);
});

it('Acknowledge the message.', async () => {
	const { listener, data, msg } = await setUp();

	await listener.onMessage(data, msg);

	expect(msg.ack).toHaveBeenCalled();
});
