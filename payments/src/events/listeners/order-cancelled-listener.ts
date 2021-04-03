import { Listener, OrderCancelledEvent, OrderStatus, Subjects } from '@tickets-sh/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
	readonly subject = Subjects.OrderCancelled;
	queueGroupName = 'payments-service';

	async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
		const { id, version } = data;
		const order = await Order.findByIdAndVersion({ id, version });

		if (!order) throw new Error('Order not found.');
		if (order.status === OrderStatus.Complete) return msg.ack();

		await order.set({ status: OrderStatus.Cancelled }).save();

		msg.ack();
	}
}
