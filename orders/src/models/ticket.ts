import { OrderStatus } from '@tickets-sh/common';
import { Document, model, Model, Schema } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { Order } from './order';

interface TicketAttrs {
	id: string;
	title: string;
	price: number;
}

export interface TicketDoc extends Document {
	title: string;
	price: number;
	version: number;
	isReserved(): Promise<boolean>;
}

interface TicketModel extends Model<TicketDoc> {
	build(attrs: TicketAttrs): TicketDoc;
	findByIdAndVersion(event: { id: string; version: number }): Promise<TicketDoc | null>;
}

const ticketSchema = new Schema(
	{
		title: {
			type: String,
			required: true
		},
		price: {
			type: Number,
			required: true,
			min: 0
		}
	},
	{
		toJSON: {
			transform(doc, ret) {
				ret.id = ret._id;
				delete ret._id;
			}
		}
	}
);

ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.build = (attrs: TicketAttrs) =>
	new Ticket({
		_id: attrs.id,
		title: attrs.title,
		price: attrs.price
	});

ticketSchema.statics.findByIdAndVersion = (event: { id: string; version: number }) =>
	Ticket.findOne({ _id: event.id, version: event.version - 1 });

ticketSchema.methods.isReserved = async function () {
	const existingOrder = await Order.findOne({
		// @ts-ignore
		ticket: this,
		status: { $ne: OrderStatus.Cancelled }
	});

	return !!existingOrder;
};

const Ticket = model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };
