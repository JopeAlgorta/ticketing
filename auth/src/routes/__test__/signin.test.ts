import request from 'supertest';
import app from '../../app';

it('Returns 400 if user not signed up', async () => {
	return request(app)
		.post('/api/users/signin')
		.send({ email: 'test@test.com', password: 'test1234' })
		.expect(400);
});

it('Returns 400 if user sign in with an invalid password', async () => {
	await request(app)
		.post('/api/users/signup')
		.send({ email: 'test@test.com', password: 'test1234' })
		.expect(201);

	await request(app)
		.post('/api/users/signin')
		.send({ email: 'test@test.com', password: 'wrongpassword' })
		.expect(400);
});

it('Sets a cookie after successful signin.', async () => {
	await request(app)
		.post('/api/users/signup')
		.send({ email: 'test@test.com', password: 'test1234' })
		.expect(201);

	const res = await request(app)
		.post('/api/users/signin')
		.send({ email: 'test@test.com', password: 'test1234' })
		.expect(200);

	expect(res.get('Set-Cookie')).toBeDefined();
});
