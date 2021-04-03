import request from 'supertest';
import app from '../../app';

it('Responds with details of current user.', async () => {
	const cookie = await global.signIn();
	const res = await request(app).get('/api/users/current').set('Cookie', cookie).send({}).expect(400);

	expect(res.body.currentUser.email).toEqual('test@test.com');
});

it('Responds with null currentUser if not user is logged in.', async () => {
	const res = await request(app).get('/api/users/current').send({}).expect(200);

	expect(res.body.currentUser).toBeNull();
});
