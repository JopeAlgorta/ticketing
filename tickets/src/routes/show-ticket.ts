import { NotFoundError } from '@tickets-sh/common';
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import Ticket from '../models/ticket';

const router = express.Router();

router.get('/api/tickets/:id', async (req: Request, res: Response) => {
	const id = req.params.id;
	if (!mongoose.Types.ObjectId.isValid(id)) throw new NotFoundError();

	const ticket = await Ticket.findById(id);

	if (!ticket) throw new NotFoundError();

	res.status(200).json(ticket);
});

export { router as showTicketRouter };
