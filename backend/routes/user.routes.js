import { Router } from 'express';
import { requireAdmin, requireTempUser } from '../middlewares/auth.middleware.js';
import { getAllUsers, getEventUsers , newTempUser ,newUser} from '../controllers/user.controller.js';
const userRouter = Router();

userRouter.get('/',requireAdmin,getAllUsers);

userRouter.get('/event/:eventID',requireAdmin, getEventUsers);

userRouter.post('/temp/:eventID', requireAdmin, newTempUser);

userRouter.get('/:id', (req,res) => res.send({title:'GET user details'}));

userRouter.post('/user', requireTempUser, newUser);

userRouter.put('/:id', (req,res) => res.send({title:'UPDATE user'}));

userRouter.delete('/:id', (req,res) => res.send({title:'DELETE user'}));

export default userRouter;