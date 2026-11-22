import { Router } from 'express';
import { requireAdmin, requireTempUser ,requireUser,requireOwnEvent } from '../middlewares/auth.middleware.js';
import { getAllUsers, getEventUsers , newTempUser ,newUser,deleteUsers,savePref,getAssignedUsers,newUserPassword,getUserPasswordID} from '../controllers/user.controller.js';
const userRouter = Router();

userRouter.get('/organization/:organizationID',requireAdmin,getAllUsers);

userRouter.get('/event/:eventID',requireAdmin, getEventUsers);

userRouter.post('/temp/:ID', requireAdmin, newTempUser);

userRouter.post('/user', requireTempUser, newUser);

userRouter.post('/savepref/:eventID', requireUser , savePref);

userRouter.delete('/organization/:organizationID', requireAdmin, deleteUsers); //needs an array of user ids to delete in the request

userRouter.get('/assigned/:eventID/:moduleID', requireAdmin,requireOwnEvent,getAssignedUsers);

userRouter.post('/newPassword/:userID', requireAdmin,newUserPassword);

userRouter.get('/passwordID/:userID',requireAdmin, getUserPasswordID);



export default userRouter;