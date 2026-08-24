import { Router } from 'express';

import { newEvent, newSlot ,newModule,getEventJson,updateModule,updateSlot,getOrganizationEvents} from '../controllers/event.controller.js';

const eventRouter = Router();


// Path: /api/v1/events/...(POST)
eventRouter.post('/event',newEvent);
eventRouter.post('/:eventID/slot',newSlot);
eventRouter.post('/:eventID/:slotID/module',newModule);

eventRouter.get('/:eventID',getEventJson);
eventRouter.get('/',getOrganizationEvents);

//authRouter.patch('/:eventID',updateEvent);
eventRouter.patch('/:eventID/:slotID',updateSlot);
eventRouter.patch('/:eventID/:slotID/:moduleID',updateModule);
export default eventRouter;