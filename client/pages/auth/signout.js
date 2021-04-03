import Router from 'next/router';
import { useEffect } from 'react';
import useRequest from '../../hooks/use-request';

const signOut = () => {
	const { doRequest } = useRequest({
		url: '/api/users/signout',
		body: {},
		method: 'post',
		onSuccess: () => Router.push('/')
	});

	useEffect(() => {
		doRequest();
	}, []);

	return <div>Signing you out...</div>;
};

export default signOut;
