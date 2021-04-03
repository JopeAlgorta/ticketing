import { ExpirationCompleteEvent, Publisher, Subjects } from '@tickets-sh/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
	readonly subject = Subjects.ExpirationComplete;
}
