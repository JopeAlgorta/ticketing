import { PaymentCreatedEvent, Publisher, Subjects } from '@tickets-sh/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
}