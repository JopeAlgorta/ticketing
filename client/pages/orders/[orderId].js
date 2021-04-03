import Router from 'next/router';
import { useState, useEffect } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import useRequest from '../../hooks/use-request';

const OrderShow = ({ order, currentUser }) => {
	const [timeLeft, setTimeLeft] = useState(0);
	const { doRequest, errors } = useRequest({
		url: '/api/payments',
		method: 'post',
		body: { orderId: order.id },
		onSuccess: payment => Router.push('/orders')
	});

	useEffect(() => {
		const findTimeLeft = () => {
			const msLeft = new Date(order.expiresAt) - new Date();
			setTimeLeft(Math.round(msLeft / 1000));
		};
		findTimeLeft();
		const timerId = setInterval(findTimeLeft, 1000);

		return () => {
			clearInterval(timerId);
		};
	}, [order]);

	if(order.status === 'complete') return <div>Order already payed!</div>
	if (timeLeft < 0) return <div>Order expired!</div>;

	return (
		<div>
			You have {timeLeft} seconds to confirm your purchase or the ticket reservation will be lost.
			<div>
				<StripeCheckout
					token={({ id }) => doRequest({ token: id })}
					stripeKey='pk_test_51GxNVjKUgvjZ19y2kiqq5H0y2LlRql40MUFFIABka48Ll1Ss32diLcx5r4izTj2BGjxsp9SVjSsOD3RDGBtIgN8x00S55zQWt1'
					amount={order.ticket.price * 100}
					email={currentUser.email}
				/>
			</div>
			<div className='mt-3'>{errors}</div>
		</div>
	);
};

OrderShow.getInitialProps = async (context, client) => {
	const { orderId } = context.query;
	const { data } = await client.get(`/api/orders/${orderId}`);

	return { order: data };
};

export default OrderShow;
