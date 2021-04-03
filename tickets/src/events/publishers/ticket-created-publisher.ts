import { Publisher, Subjects, TicketCreatedEvent } from '@tickets-sh/common';

class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;   
}

export default TicketCreatedPublisher;
