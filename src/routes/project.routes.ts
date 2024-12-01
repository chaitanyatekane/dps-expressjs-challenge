import { Router } from 'express';
import * as projectController from '../controllers/project.controller';
import authMiddleware from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authMiddleware, projectController.getAllProjects);
router.post('/', authMiddleware, projectController.createProject);
router.put('/:id', authMiddleware, projectController.updateProject);
router.delete('/:id', authMiddleware, projectController.deleteProject);

export default router;
