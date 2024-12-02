import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
	const token = req.headers.authorization;

	// Hardcoded token
	const validToken = 'Password123';

	if (token === validToken) {
		next();
	} else {
		res.status(401).json({
			status: 'error',
			code: 401,
			message:
				'Unauthorized access. Please provide a valid Authorization token.',
		});
	}
};

export default authMiddleware;
