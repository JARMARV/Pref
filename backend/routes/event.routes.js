import { Router } from 'express';
import { requireAdmin, verifyToken } from '../middlewares/auth.middleware.js';

import { 
        newEvent,
        newSlot ,
        newModule,
        getEventJson,
        updateModule,
        updateSlot,
        getOrganizationEvents,
        deleteSlot,
        deleteEvent,
        deleteModule,
        updateEvent
        } from '../controllers/event.controller.js';

const eventRouter = Router();


// Path: /api/v1/events/...(POST)

//--creation--

eventRouter.post('/event', requireAdmin, newEvent);
eventRouter.post('/:eventID/slot', requireAdmin, newSlot);
eventRouter.post('/:eventID/:slotID/module', requireAdmin, newModule);


//--aquisition--

eventRouter.get('/:eventID', verifyToken, getEventJson);
eventRouter.get('/', requireAdmin, getOrganizationEvents);


//--updation--

eventRouter.patch('/:eventID', requireAdmin, updateEvent);
eventRouter.patch('/:eventID/:slotID', requireAdmin, updateSlot);
eventRouter.patch('/:eventID/:slotID/:moduleID', requireAdmin, updateModule);


//--deletion--

eventRouter.delete('/:eventID', requireAdmin, deleteEvent);
eventRouter.delete('/:eventID/:slotID', requireAdmin, deleteSlot);
eventRouter.delete('/:eventID/:slotID/:moduleID', requireAdmin, deleteModule);

export default eventRouter;