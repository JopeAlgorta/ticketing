import express, { Request, Response } from 'express';
import Ticket from '../models/ticket';

const router = express.Router();

router.get('/api/tickets', async (req: Request, res: Response) => {
	const tickets = await Ticket.find({});

	res.status(200).json({ results: tickets.length, data: tickets });
});

export { router as getTicketsRouter };
