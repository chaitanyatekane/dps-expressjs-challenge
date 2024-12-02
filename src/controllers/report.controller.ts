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
		const allReports = db.query('SELECT * FROM reports');
		// console.log('All Reports:', allReports);
		type FrequentWord = { word: string; count: number };
		const frequentWordsQuery = `
            SELECT lower(trim(word)) AS word, COUNT(*) as count
            FROM (
                SELECT 
                    json_each.value AS word
                FROM reports,
                json_each(
                    json_array(
                        replace(replace(replace(text, '.', ''), ',', ''), '  ', ' ')
                    )
                )
            )
            GROUP BY word
            HAVING COUNT(*) >= 3
        `;
		// console.log('Executing frequent words query...');
		const frequentWords = db.query(frequentWordsQuery) as FrequentWord[];
		// console.log('Frequent Words:', frequentWords);

		if (frequentWords.length === 0) {
			console.log('No frequent words found.');
			res.json([]);
			return;
		}
		const words = frequentWords.map((w) => w.word);
		// console.log('Frequent Words Array:', words);
		const reportsQuery = `
            SELECT *
            FROM reports
            WHERE ${words
				.map(
					(word, index) =>
						`lower(text) LIKE '%' || @word${index} || '%'`,
				)
				.join(' OR ')}
        `;
		// console.log('Executing reports query...');
		const reports = db.query(
			reportsQuery,
			Object.fromEntries(
				words.map((word, index) => [`word${index}`, word]),
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
