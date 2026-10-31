import { Router } from 'express';
import { requireAdmin, requireTempUser ,requireUser } from '../middlewares/auth.middleware.js';
import { getAllUsers, getEventUsers , newTempUser ,newUser,deleteUsers,savePref,getAssignedUsers,newUserPassword} from '../controllers/user.controller.js';
const userRouter = Router();

userRouter.get('/organization/:organizationID',requireAdmin,getAllUsers);

userRouter.get('/event/:eventID',requireAdmin, getEventUsers);

userRouter.post('/temp/:ID', requireAdmin, newTempUser);

userRouter.post('/user', requireTempUser, newUser);

userRouter.post('/savepref', requireUser , savePref);

userRouter.delete('/organization/:organizationID', requireAdmin, deleteUsers); //needs an array of user ids to delete in the request

userRouter.get('/assigned/:moduleID', requireAdmin,getAssignedUsers);

userRouter.post('/newPassword/:userID', requireAdmin,newUserPassword);

//userRouter.put('/:id', (req,res) => res.send({title:'UPDATE user'}));
//userRouter.get('/:id', (req,res) => res.send({title:'GET user details'}));
//userRouter.delete('/:id', (req,res) => res.send({title:'DELETE user'}));

export default userRouter;