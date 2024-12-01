import { Request, Response } from 'express';
import db from '../services/db.service';

export const getAllReports = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const reports = db.query('SELECT * FROM reports');
		res.json(reports);
	} catch (error) {
		console.error('Error fetching reports:', error);
		res.status(500).send('Internal Server Error');
	}
};

export const getReportsWithFrequentWords = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const reports = db.query(`
            SELECT * FROM reports WHERE (
                SELECT COUNT(*) 
                FROM (
                    SELECT word 
                    FROM (
                        SELECT json_each.value AS word 
                        FROM json_each(json_array(text))
                    ) 
                    GROUP BY word 
                    HAVING COUNT(word) >= 3
                )
            ) > 0
        `);
		res.json(reports);
	} catch (error) {
		console.error('Error fetching reports with frequent words:', error);
		res.status(500).send('Internal Server Error');
	}
};

export const createReport = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { text, project_id } = req.body;

		if (!text || !project_id) {
			res.status(400).send('Missing required fields');
			return;
		}

		db.run(
			'INSERT INTO reports (text, project_id) VALUES (@text, @project_id)',
			{ text, project_id },
		);
		res.status(201).send('Report created');
	} catch (error) {
		console.error('Error creating report:', error);
		res.status(500).send('Internal Server Error');
	}
};

export const updateReport = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const { text, project_id } = req.body;

		if (!id || !text || !project_id) {
			res.status(400).send('Missing required fields');
			return;
		}

		const result = db.run(
			'UPDATE reports SET text = @text, project_id = @project_id WHERE id = @id',
			{ text, project_id, id },
		);

		if (result.changes === 0) {
			res.status(404).send('Report not found');
			return;
		}

		res.send('Report updated');
	} catch (error) {
		console.error('Error updating report:', error);
		res.status(500).send('Internal Server Error');
	}
};

export const deleteReport = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;

		if (!id) {
			res.status(400).send('Missing report ID');
			return;
		}

		const result = db.run('DELETE FROM reports WHERE id = @id', { id });

		if (result.changes === 0) {
			res.status(404).send('Report not found');
			return;
		}

		res.send('Report deleted');
	} catch (error) {
		console.error('Error deleting report:', error);
		res.status(500).send('Internal Server Error');
	}
};
