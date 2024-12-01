import { Router } from 'express';
import {
	getAllReports,
	getReportsWithFrequentWords,
	createReport,
	updateReport,
	deleteReport,
} from '../controllers/report.controller';
import authMiddleware from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authMiddleware, getAllReports);
router.get('/frequent-words', authMiddleware, getReportsWithFrequentWords);
router.post('/', authMiddleware, createReport);
router.put('/:id', authMiddleware, updateReport);
router.delete('/:id', authMiddleware, deleteReport);

export default router;
