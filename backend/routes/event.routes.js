import { Router } from 'express';
import { requireAdmin, requireUser, verifyToken,requireOwnEvent } from '../middlewares/auth.middleware.js';

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
        lockEvent,
        deleteAssignments,
        disableUserChoiceInSlot,
        changeSlotAssignments
        } from '../controllers/event.controller.js';

const eventRouter = Router();


// Path: /api/v1/events/...(POST)

//--creation--

eventRouter.post('/create/event', requireAdmin, newEvent);
eventRouter.post('/create/:eventID/slot', requireAdmin, requireOwnEvent, newSlot);
eventRouter.post('/create/:eventID/:slotID/module', requireAdmin,requireOwnEvent, newModule);


//--aquisition--

eventRouter.get('/event/:eventID', verifyToken,requireOwnEvent, getEventJson);
eventRouter.get('/', requireAdmin, getOrganizationEvents);
eventRouter.get('/user', verifyToken, getEventsConnectedToUser);
eventRouter.get('/pref/:eventID', requireUser,requireOwnEvent, getEventPref );


//--updation--

eventRouter.patch('/update/:eventID', requireAdmin,requireOwnEvent, updateEvent);
eventRouter.patch('/update/:eventID/:slotID', requireAdmin, requireOwnEvent, updateSlot);
eventRouter.patch('/update/:eventID/:slotID/:moduleID', requireAdmin, requireOwnEvent, updateModule);
eventRouter.patch('/lock/:eventID', requireAdmin,requireOwnEvent, lockEvent);
eventRouter.patch('/disable-user-choice/:eventID/:slotID', requireAdmin, requireOwnEvent, disableUserChoiceInSlot);
eventRouter.patch('/assignments/:eventID/:slotID', requireAdmin,requireOwnEvent, changeSlotAssignments);

//--deletion--

eventRouter.delete('/event/:eventID', requireAdmin,requireOwnEvent, deleteEvent);
eventRouter.delete('/event/:eventID/:slotID', requireAdmin,requireOwnEvent, deleteSlot);
eventRouter.delete('/event/:eventID/:slotID/:moduleID',requireAdmin,requireOwnEvent, deleteModule);
eventRouter.delete('/assignments/:eventID', requireAdmin,requireOwnEvent, deleteAssignments)


export default eventRouter;