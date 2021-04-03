import Link from 'next/link';

const Header = ({ currentUser }) => {
	const links = [
		!currentUser && { label: 'Sign up', href: '/auth/signup' },
		!currentUser && { label: 'Sign in', href: '/auth/signin' },
		currentUser && { label: 'Sell tickets', href: '/tickets/new' },
		currentUser && { label: 'My orders', href: '/orders' },
		currentUser && { label: 'Sign out', href: '/auth/signout' }
	]
		.filter(l => l)
		.map(({ label, href }) => (
			<li key={href} className='nav-item'>
				<Link href={href}>
					<a className='nav-link'>{label}</a>
				</Link>
			</li>
		));
	return (
		<nav className='navbar navbar-light bg-light'>
			<Link href='/'>
				<a className='navbar-brand'>Tickets.sh</a>
			</Link>
			<div className='d-flex flex-row justify-content-between'>
				<ul className='nav'>{links}</ul>
			</div>
		</nav>
	);
};

export default Header;
