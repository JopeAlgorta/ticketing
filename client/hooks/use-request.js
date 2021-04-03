import { useState } from 'react';
import axios from 'axios';

const useRequest = ({ url, method, body, onSuccess }) => {
	const [errors, setErrors] = useState(null);

	const doRequest = async (opts = {}) => {
		try {
			setErrors(null);
			const res = await axios[method](url, {...body, ...opts}, { credentials: 'include' });

			if (onSuccess) onSuccess(res.data);
			return res.data;
		} catch (error) {
			setErrors(
				<div className='alert alert-danger'>
					<h4 className='alert-heading'>Oops!</h4>
					<hr />
					<ul className='my-0'>
						{error.response.data.errors.map((err, i) => (
							<li key={i}>{err.message}</li>
						))}
					</ul>
				</div>
			);
		}
	};

	return { doRequest, errors };
};

export default useRequest;
