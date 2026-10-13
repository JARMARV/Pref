import { Router } from 'express';
import { requireSuperUser } from '../middlewares/auth.middleware.js';
import { getAllOrganizations} from '../controllers/organization.controller.js';
const organizationRouter = Router();


organizationRouter.get('/organizations', requireSuperUser, getAllOrganizations);

export default organizationRouter;