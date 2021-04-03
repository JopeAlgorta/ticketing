import { OrderCancelledEvent, Publisher, Subjects } from '@tickets-sh/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
	readonly subject = Subjects.OrderCancelled;
}
