import { Router } from 'express';
import { requireSuperUser } from '../middlewares/auth.middleware.js';
import { getAllOrganizations , createOrganization ,deleteOrganization, updateOrganization} from '../controllers/organization.controller.js';
const organizationRouter = Router();

organizationRouter.get('/organizations', requireSuperUser, getAllOrganizations);

organizationRouter.post('/organization/:name', requireSuperUser, createOrganization);

organizationRouter.delete('/organization/:organizationID', requireSuperUser, deleteOrganization);

organizationRouter.patch('/organization/:organizationID', requireSuperUser, updateOrganization);

export default organizationRouter;