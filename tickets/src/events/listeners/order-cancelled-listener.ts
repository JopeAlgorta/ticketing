import { Listener, OrderCancelledEvent, Subjects } from '@tickets-sh/common';
import { Message } from 'node-nats-streaming';
import Ticket from '../../models/ticket';
import TicketUpdatedPublisher from '../publishers/ticket-updated-publisher';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
	readonly subject = Subjects.OrderCancelled;
	queueGroupName = 'tickets-service';

	async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
		const { ticket } = data;

		const cancelledTicket = await Ticket.findById(ticket.id);
		if (!cancelledTicket) throw new Error('Ticket not found.');

		await cancelledTicket.set({ orderId: undefined }).save();

		await new TicketUpdatedPublisher(this.client).publish({
			id: cancelledTicket.id,
			price: cancelledTicket.price,
			title: cancelledTicket.title,
			userId: cancelledTicket.userId,
			version: cancelledTicket.version,
			orderId: cancelledTicket.orderId
		});

		msg.ack();
	}
}
