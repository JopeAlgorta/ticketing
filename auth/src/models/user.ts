import mongoose, { Document, Model, Schema } from 'mongoose';
import { Password } from '../utils/password';

interface UserAttrs {
	email: string;
	password: string;
}

interface UserModel extends Model<UserDoc> {
	build(attrs: UserAttrs): UserDoc;
}

interface UserDoc extends Document {
	email: string;
	password: string;
}

const userSchema = new Schema<UserDoc>(
	{
		email: {
			type: String,
			required: [true, 'Please provide your email'],
			unique: true,
			lowercase: true
		},
		password: {
			type: String,
			required: [true, 'Please provide a password'],
			minlength: 4
		}
	},
	{
		toJSON: {
			transform(doc, ret) {
				ret.id = ret._id;
				delete ret._id;
				delete ret.password;
			},
			versionKey: false
		}
	}
);

userSchema.statics.build = (attrs: UserAttrs) => {
	return new User(attrs);
};

userSchema.pre('save', async function (done) {
	if (this.isModified('password')) {
		const hashed = await Password.toHash(this.get('password'));
		this.set('password', hashed);
	}

	done();
});

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };
