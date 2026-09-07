import { Router } from 'express';
import { requireAdmin, requireTempUser ,requireUser } from '../middlewares/auth.middleware.js';
import { getAllUsers, getEventUsers , newTempUser ,newUser,deleteUsers,savePref} from '../controllers/user.controller.js';
const userRouter = Router();

userRouter.get('/',requireAdmin,getAllUsers);

userRouter.get('/event/:eventID',requireAdmin, getEventUsers);

userRouter.post('/temp/:eventID', requireAdmin, newTempUser);

userRouter.post('/user', requireTempUser, newUser);

userRouter.post('/savepref', requireUser , savePref);

userRouter.delete('/', requireAdmin, deleteUsers); //needs an array of user ids to delete in the request





//userRouter.put('/:id', (req,res) => res.send({title:'UPDATE user'}));
//userRouter.get('/:id', (req,res) => res.send({title:'GET user details'}));
//userRouter.delete('/:id', (req,res) => res.send({title:'DELETE user'}));

export default userRouter;