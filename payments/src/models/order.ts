import { OrderStatus } from '@tickets-sh/common';
import { Document, model, Model, Schema } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface OrderAttrs {
	id: string;
	status: OrderStatus;
	version: number;
	price: number;
	userId: string;
}

interface OrderDoc extends Document {
	status: OrderStatus;
	version: number;
	price: number;
	userId: string;
}

interface OrderModel extends Model<OrderDoc> {
	build(attrs: OrderAttrs): OrderDoc;
	findByIdAndVersion(event: { id: string; version: number }): Promise<OrderDoc | null>;
}

const orderSchema = new Schema(
	{
		price: {
			type: Number,
			required: true
		},
		version: {
			type: Number,
			required: true
		},
		userId: {
			type: String,
			required: true
		},
		status: {
			type: String,
			required: true,
			enum: Object.values(OrderStatus)
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

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: OrderAttrs) =>
	new Order({
		_id: attrs.id,
		version: attrs.version,
		price: attrs.price,
		userId: attrs.userId,
		status: attrs.status
	});

orderSchema.statics.findByIdAndVersion = (event: { id: string; version: number }) =>
	Order.findOne({ _id: event.id, version: event.version - 1 });

const Order = model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };
