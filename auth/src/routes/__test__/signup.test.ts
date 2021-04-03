import request from 'supertest';
import app from '../../app';

it('Returns 201 on successful sign up.', async () => {
	return request(app)
		.post('/api/users/signup')
		.send({ email: 'test@test.com', password: 'test1234' })
		.expect(201);
});

it('Returns 400 if incorrect email.', async () => {
	return request(app)
		.post('/api/users/signup')
		.send({ email: 'invalid-email', password: 'test1234' })
		.expect(400);
});

it('Returns 400 if incorrect password.', async () => {
	return request(app)
		.post('/api/users/signup')
		.send({ email: 'test@test.com', password: 'tes' })
		.expect(400);
});

it('Returns 400 if incorrect email or password.', async () => {
	await request(app)
		.post('/api/users/signup')
		.send({ email: 'test@test.com', password: 'tes' })
		.expect(400);

	await request(app)
		.post('/api/users/signup')
		.send({ email: 'test.com', password: 'test1234' })
		.expect(400);
});

it('Returns 4000 if duplicate email.', async () => {
	await request(app)
		.post('/api/users/signup')
		.send({ email: 'test@test.com', password: 'test1234' })
		.expect(201);

	await request(app)
		.post('/api/users/signup')
		.send({ email: 'test@test.com', password: 'test1234' })
		.expect(400);
});

it('Sets a cookie after successful signup.', async () => {
	const res = await request(app)
		.post('/api/users/signup')
		.send({ email: 'test@test.com', password: 'test1234' })
		.expect(201);

	expect(res.get('Set-Cookie')).toBeDefined();
});
