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
		// console.log('Fetching reports with frequent words...');
		type Report = { id: number; text: string; project_id: number };
		const allReports = db.query('SELECT * FROM reports') as Report[];
		// console.log('All Reports:', allReports);
		// Preprocess text data to extract words and count occurrences
		const wordCounts: Record<string, number> = {};
		allReports.forEach((report) => {
			const words = report.text
				.toLowerCase()
				.replace(/[.,!?]/g, '')
				.split(/\s+/);
			words.forEach((word) => {
				if (word) {
					wordCounts[word] = (wordCounts[word] || 0) + 1;
				}
			});
		});
		// console.log('Word Counts:', wordCounts);

		const frequentWords = Object.entries(wordCounts)
			.filter(([_, count]) => count >= 3)
			.map(([word]) => word);
		// console.log('Frequent Words:', frequentWords);

		if (frequentWords.length === 0) {
			console.log('No frequent words found.');
			res.json([]);
			return;
		}
		const reportsQuery = `
            SELECT *
            FROM reports
            WHERE ${frequentWords
				.map(
					(word, index) =>
						`lower(text) LIKE '%' || @word${index} || '%'`,
				)
				.join(' OR ')}
        `;
		// console.log('Reports Query:', reportsQuery);
		const reports = db.query(
			reportsQuery,
			Object.fromEntries(
				frequentWords.map((word, index) => [`word${index}`, word]),
			),
		);
		// console.log('Reports containing frequent words:', reports);

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
		let projectExists = db.query('SELECT id FROM projects WHERE id = @id', {
			id: project_id,
		});
		if (projectExists.length === 0) {
			console.log(
				`Project ID ${project_id} not found. Creating a new project.`,
			);
			db.run(
				'INSERT INTO projects (id, name, description) VALUES (@id, @name, @description)',
				{
					id: project_id,
					name: `Project ${project_id}`,
					description: 'Auto-created project',
				},
			);
			projectExists = db.query('SELECT id FROM projects WHERE id = @id', {
				id: project_id,
			});
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

		const reportExists = db.query('SELECT id FROM reports WHERE id = @id', {
			id,
		});
		// console.log('Report Check:', reportExists);

		if (reportExists.length === 0) {
			console.error('Report not found:', id);
			res.status(404).send('Report not found');
			return;
		}
		db.run(
			'UPDATE reports SET text = @text, project_id = @project_id WHERE id = @id',
			{ text, project_id, id },
		);

		res.status(200).send('Report updated');
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

		const reportExists = db.query('SELECT id FROM reports WHERE id = @id', {
			id,
		});
		// console.log('Report Check:', reportExists);

		if (reportExists.length === 0) {
			console.error('Report not found:', id);
			res.status(404).send('Report not found');
			return;
		}

		db.run('DELETE FROM reports WHERE id = @id', { id });
		res.status(200).send('Report deleted');
	} catch (error) {
		console.error('Error deleting report:', error);
		res.status(500).send('Internal Server Error');
	}
};
