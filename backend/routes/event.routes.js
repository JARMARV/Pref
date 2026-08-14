import { Router } from 'express';

import { newEvent, newSlot ,newModule,getEventJson} from '../controllers/event.controller.js';

const authRouter = Router();


// Path: /api/v1/events/...(POST)
authRouter.post('/event',newEvent);
authRouter.post('/:eventID/slot',newSlot);
authRouter.post('/:eventID/:slotID/module',newModule);

authRouter.get('/:eventID',getEventJson);
//authRouter.patch('/:eventID',updateEvent);
//authRouter.patch('/:eventID/:slotID',updateSlot);
//authRouter.patch('/:eventID/:slotID/:moduleID',updateModule);
export default authRouter;