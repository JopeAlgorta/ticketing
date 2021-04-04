import Link from 'next/link';

const LandingPage = ({ currentUser, tickets }) => {
	const ticketList = tickets.data.map(ticket => (
		<tr key={ticket.id}>
			<td>{ticket.title}</td>
			<td style={{ textAlign: 'right' }}>$ {ticket.price}</td>
			<td style={{ textAlign: 'right' }}>
				<Link href='/tickets/[ticketId]' as={`/tickets/${ticket.id}`}>
					<a className='mx-2 btn btn-primary' style={{ width: '40px' }}>
						&#8594;
					</a>
				</Link>
			</td>
			<td style={{ textAlign: 'right' }}>
				{ticket.orderId ? (
					<h5 className='mb-0'>
						<span className='badge badge-danger'>Reserved</span>
					</h5>
				) : (
					<h5 className='mb-0'>
						<span className='badge badge-success'>Available</span>
					</h5>
				)}
			</td>
		</tr>
	));

	return (
		<div>
			<h2>Tickets</h2>
			<table className='table table-hover'>
				<thead>
					<tr>
						<th scope='col'>Title</th>
						<th scope='col' style={{ textAlign: 'right' }}>
							Price
						</th>
						<th scope='col'></th>
						<th scope='col'></th>
					</tr>
				</thead>
				<tbody>{ticketList}</tbody>
			</table>
		</div>
	);
};

LandingPage.getInitialProps = async (context, client, currentUser) => {
	const { data } = await client.get('/api/tickets');

	return { tickets: data };
};

export default LandingPage;
