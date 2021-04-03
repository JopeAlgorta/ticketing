import 'bootstrap/dist/css/bootstrap.css';

import { Fragment } from 'react';
import buildClient from '../api/build-client';
import Header from '../components/header';

const CustomApp = ({ Component, pageProps, currentUser }) => {
	return (
		<Fragment>
			<Header currentUser={currentUser} />
			<div className='container'>
				<Component currentUser={currentUser} {...pageProps} />
			</div>
		</Fragment>
	);
};

CustomApp.getInitialProps = async context => {
	const client = buildClient(context.ctx);
	const { data } = await client.get('/api/users/current');

	let pageProps = {};
	if (context.Component.getInitialProps) {
		pageProps = await context.Component.getInitialProps(context.ctx, client, data.currentUser);
	}
	return { pageProps, ...data };
};

export default CustomApp;
