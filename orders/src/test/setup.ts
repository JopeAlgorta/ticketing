import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global {
	namespace NodeJS {
		interface Global {
			signIn(): string[];
		}
	}
}

jest.mock('../nats-wrapper.ts');

let mongo: any;
beforeAll(async () => {
	process.env.JWT_KEY = 'qwerty';

	mongo = new MongoMemoryServer();
	const mongoUri = await mongo.getUri();
	await mongoose.connect(mongoUri, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	});
});

beforeEach(async () => {
	jest.clearAllMocks();
	const collections = await mongoose.connection.db.collections();
	for (const collection of collections) {
		await collection.deleteMany({});
	}
});

afterAll(async () => {
	await mongo.stop();
	await mongoose.connection.close();
});

global.signIn = () => {
	const base64 = Buffer.from(
		JSON.stringify({
			jwt: jwt.sign(
				{ email: 'test@test.com', id: new mongoose.Types.ObjectId().toHexString() },
				process.env.JWT_KEY!
			)
		})
	).toString('base64');

	return [`express:sess=${base64}`];
};
