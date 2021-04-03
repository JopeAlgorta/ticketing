import Router from 'next/router';
import useRequest from '../../hooks/use-request';

const TicketShow = ({ ticket }) => {
	const { doRequest, errors } = useRequest({
		url: '/api/orders',
		method: 'post',
		body: { ticketId: ticket.id },
		onSuccess: order => Router.push('/orders/[orderId]', `/orders/${order.id}`)
	});

	return (
		<div className='d-flex justify-content-center align-items-start m-4' style={{ minHeight: '100vh' }}>
			<div className='card p-3' style={{ minWidth: '50%' }}>
				<div className='card-body'>
					<div className='card-title'>
						<h1 className='d-flex justify-content-between'>
							{ticket.title} <span className='badge badge-info'>$ {ticket.price}</span>
						</h1>
					</div>
					<div className='mt-3'>{errors}</div>
					<button onClick={() => doRequest()} className='btn btn-success mt-4'>
						Purchase{' '}
					</button>
				</div>
			</div>
		</div>
	);
};

TicketShow.getInitialProps = async (context, client) => {
	const { ticketId } = context.query;

	const { data } = await client.get(`/api/tickets/${ticketId}`);

	return { ticket: data };
};

export default TicketShow;
