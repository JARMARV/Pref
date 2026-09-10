import { Router } from 'express';
import { requireAdmin, requireUser, verifyToken } from '../middlewares/auth.middleware.js';

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
        updateEvent,
        getEventsConnectedToUser,
        getEventPref,
        lockEvent
        } from '../controllers/event.controller.js';

const eventRouter = Router();


// Path: /api/v1/events/...(POST)

//--creation--

eventRouter.post('/create/event', requireAdmin, newEvent);
eventRouter.post('/create/:eventID/slot', requireAdmin, newSlot);
eventRouter.post('/create/:eventID/:slotID/module', requireAdmin, newModule);


//--aquisition--

eventRouter.get('/event/:eventID', verifyToken, getEventJson);
eventRouter.get('/', requireAdmin, getOrganizationEvents);
eventRouter.get('/user', verifyToken, getEventsConnectedToUser);
eventRouter.get('/pref/:eventID', requireUser, getEventPref );


//--updation--

eventRouter.patch('/update/:eventID', requireAdmin, updateEvent);
eventRouter.patch('/update/:eventID/:slotID', requireAdmin, updateSlot);
eventRouter.patch('/update/:eventID/:slotID/:moduleID', requireAdmin, updateModule);
eventRouter.patch('/lock/:eventID', requireAdmin, lockEvent);


//--deletion--

eventRouter.delete('/:eventID', requireAdmin, deleteEvent);
eventRouter.delete('/:eventID/:slotID', requireAdmin, deleteSlot);
eventRouter.delete('/:eventID/:slotID/:moduleID', requireAdmin, deleteModule);

export default eventRouter;