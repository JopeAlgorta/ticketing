import { Publisher, Subjects, TicketUpdatedEvent } from '@tickets-sh/common';

class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
	readonly subject = Subjects.TicketUpdated;
}

export default TicketUpdatedPublisher;
