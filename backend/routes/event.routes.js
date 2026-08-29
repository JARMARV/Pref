import { Router } from 'express';

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
        deleteModule
        } from '../controllers/event.controller.js';

const eventRouter = Router();


// Path: /api/v1/events/...(POST)

//--creation--

eventRouter.post('/event',newEvent);
eventRouter.post('/:eventID/slot',newSlot);
eventRouter.post('/:eventID/:slotID/module',newModule);


//--aquisition--

eventRouter.get('/:eventID',getEventJson);
eventRouter.get('/',getOrganizationEvents);


//--updation--

//eventRouter.patch('/:eventID',updateEvent);
eventRouter.patch('/:eventID/:slotID',updateSlot);
eventRouter.patch('/:eventID/:slotID/:moduleID',updateModule);


//--deletion--

//eventRouter.delete('/:eventID',deleteEvent);
eventRouter.delete('/:eventID/:slotID',deleteSlot);
eventRouter.delete('/:eventID/:slotID/:moduleID',deleteModule);

export default eventRouter;