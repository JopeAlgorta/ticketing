import { Schema } from 'mongoose';
import Ticket from '../ticket';

it('Implements OCC correctly.', async done => {
	const ticket = Ticket.build({ title: 'Ticket 1', price: 10, userId: '123' });
	await ticket.save();

	const ticket1 = await Ticket.findById(ticket.id);
	const ticket2 = await Ticket.findById(ticket.id);

	const updatedTicket1 = ticket1!.set({ title: 'Updated ticket 1' });
	const updatedTicket2 = ticket2!.set({ title: 'Updated ticket 2' });

	await updatedTicket1.save();

	try {
		await updatedTicket2.save();
	} catch (e) {
		return done();
	}
});

it('Increments the version number on multiple saves.', async ()=> {
	const ticket = Ticket.build({ title: 'Ticket 1', price: 10, userId: '123' });
    await ticket.save();

    expect(ticket.version).toEqual(0);
    
    await ticket.save();
    
    expect(ticket.version).toEqual(1);
    
    await ticket.save();

    expect(ticket.version).toEqual(2);

})