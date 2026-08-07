import { Router } from 'express';
import { getAllUsers , newTempUser ,newUser} from '../controllers/user.controller.js';
const userRouter = Router();

userRouter.get('/',getAllUsers);

userRouter.post('/temp',newTempUser);

userRouter.get('/:id', (req,res) => res.send({title:'GET user details'}));

userRouter.post('/user', newUser);

userRouter.put('/:id', (req,res) => res.send({title:'UPDATE user'}));

userRouter.delete('/:id', (req,res) => res.send({title:'DELETE user'}));

export default userRouter;