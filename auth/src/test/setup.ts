import request from 'supertest';
import app from '../app';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

declare global {
	namespace NodeJS {
		interface Global {
			signIn(): Promise<string[]>;
		}
	}
}

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
	const collections = await mongoose.connection.db.collections();
	for (const collection of collections) {
		await collection.deleteMany({});
	}
});

afterAll(async () => {
	await mongo.stop();
	await mongoose.connection.close();
});

global.signIn = async () => {
	const email = 'test@test.com';
	const password = 'test1234';

	const res = await request(app).post('/api/users/signup').send({ email, password }).expect(201);

	return res.get('Set-Cookie');
};
