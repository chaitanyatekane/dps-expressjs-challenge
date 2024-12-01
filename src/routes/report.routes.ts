import { Router } from 'express';
import * as reportController from '../controllers/report.controller';
import authMiddleware from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authMiddleware, reportController.getAllReports);
router.get(
	'/frequent-words',
	authMiddleware,
	reportController.getReportsWithFrequentWords,
);
router.post('/', authMiddleware, reportController.createReport);
router.put('/:id', authMiddleware, reportController.updateReport);
router.delete('/:id', authMiddleware, reportController.deleteReport);

export default router;
