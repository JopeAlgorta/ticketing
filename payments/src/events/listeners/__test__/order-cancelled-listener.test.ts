import { OrderCancelledEvent, OrderStatus } from '@tickets-sh/common';
import { Types } from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Order } from '../../../models/order';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledListener } from '../order-cancelled-listener';

const setUp = async () => {
	const listener = new OrderCancelledListener(natsWrapper.client);

	const order = Order.build({
		id: Types.ObjectId().toHexString(),
		version: 0,
		status: OrderStatus.Created,
		price: 10,
		userId: '123'
	});
	await order.save();

	const data: OrderCancelledEvent['data'] = {
		id: order.id,
		version: order.version + 1,
		ticket: {
			id: Types.ObjectId().toHexString()
		}
	};

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn()
	};

	return { listener, order, data, msg };
};

it('Updates order status field.', async () => {
	const { listener, data, msg } = await setUp();

	await listener.onMessage(data, msg);

	const order = await Order.findById(data.id);

	expect(order!.status).toEqual(OrderStatus.Cancelled);
});

it('Acknowledges the message.', async () => {
	const { listener, data, msg } = await setUp();

	await listener.onMessage(data, msg);

	expect(msg.ack).toHaveBeenCalled();
});
