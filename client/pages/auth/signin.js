import { useState } from 'react';
import Router from 'next/router';
import useRequest from '../../hooks/use-request';

const signIn = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const { doRequest, errors } = useRequest({
		url: '/api/users/signin',
		method: 'post',
		body: { email, password },
		onSuccess: () => Router.push('/')
	});

	const handleSubmit = async e => {
		e.preventDefault();
		await doRequest();
	};

	return (
		<div className='d-flex justify-content-center align-items-start m-4' style={{ minHeight: '100vh' }}>
			<form className='card p-3' style={{ width: '40%' }} onSubmit={handleSubmit}>
				<div className='card-body'>
					<div className='card-title'>
						<h1>Sign In</h1>
					</div>
					<div className='form-group'>
						<label htmlFor='email-addr'>Email address</label>
						<input
							type='email'
							className='form-control'
							id='email-addr'
							onChange={e => setEmail(e.target.value)}
							value={email}
						/>
					</div>
					<div className='form-group'>
						<label htmlFor='password'>Password</label>
						<input
							type='password'
							className='form-control'
							id='password'
							onChange={e => setPassword(e.target.value)}
							value={password}
						/>
					</div>
					<button type='submit' className='btn btn-primary'>
						Sign in
					</button>
					<div className='mt-3'>{errors}</div>
				</div>
			</form>
		</div>
	);
};

export default signIn;
