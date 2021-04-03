import Link from 'next/link';

const OrdersIndex = ({ orders }) => {
	const ordersList = orders.map(order => (
		<tr key={order.id}>
			<td>{order.ticket.title}</td>
			<td style={{ textAlign: 'right' }}>$ {order.ticket.price}</td>
			<td style={{ textAlign: 'right' }}>
				<Link href='/orders/[orderId]' as={`/orders/${order.id}`}>
					<a className='mx-2 btn btn-primary' style={{ width: '40px' }}>
						&#8594;
					</a>
				</Link>
			</td>
			<td style={{ textAlign: 'right' }}>
				{(() => {
					switch (order.status) {
						case 'complete':
							return (
								<h5 className='mb-0'>
									<span className='badge badge-success'>Complete</span>
								</h5>
							);
						case 'awaiting:payment':
							return (
								<h5 className='mb-0'>
									<span className='badge badge-warning'>Awaiting payment</span>
								</h5>
							);
						case 'cancelled':
							return (
								<h5 className='mb-0'>
									<span className='badge badge-danger'>Cancelled</span>
								</h5>
							);
					}
				})()}
			</td>
		</tr>
	));

	return (
		<div>
			<h1>My orders</h1>
			<table className='table table-hover'>
				<thead>
					<tr>
						<th scope='col'>Ticket</th>
						<th scope='col' style={{ textAlign: 'right' }}>
							Price
						</th>
						<th scope='col'></th>
						<th scope='col'></th>
					</tr>
				</thead>
				<tbody>{ordersList}</tbody>
			</table>
		</div>
	);
};

OrdersIndex.getInitialProps = async (context, client) => {
	const { data } = await client.get('/api/orders');

	return { orders: data };
};

export default OrdersIndex;
