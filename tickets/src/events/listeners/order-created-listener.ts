import { Listener, OrderCreatedEvent, Subjects } from '@tickets-sh/common';
import { Message } from 'node-nats-streaming';
import Ticket from '../../models/ticket';
import TicketUpdatedPublisher from '../publishers/ticket-updated-publisher';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
	readonly subject = Subjects.OrderCreated;
	queueGroupName = 'tickets-service';

	async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
		const { ticket, id } = data;

		const orderedTicket = await Ticket.findById(ticket.id);
		if (!orderedTicket) throw new Error('Ticket not found.');

		await orderedTicket.set({ orderId: id }).save();

        await new TicketUpdatedPublisher(this.client).publish({
			id: orderedTicket.id,
			price: orderedTicket.price,
			title: orderedTicket.title,
			userId: orderedTicket.userId,
			version: orderedTicket.version,
			orderId: orderedTicket.orderId
		})

		msg.ack();
	}
}
