import { Listener, Subjects, TicketUpdatedEvent } from '@tickets-sh/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
	readonly subject = Subjects.TicketUpdated;
	queueGroupName = 'orders-service';

	async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
		const { id, title, price, version } = data;

		const ticket = await Ticket.findByIdAndVersion({ id, version });

		if (!ticket) throw new Error('Ticket not found!');

		await ticket.set({ title, price }).save();
		
		msg.ack();
	}
}
