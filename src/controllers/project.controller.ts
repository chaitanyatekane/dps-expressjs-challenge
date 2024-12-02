import { Request, Response } from 'express';
import db from '../services/db.service';

export const getAllProjects = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const projects = db.query('SELECT * FROM projects');
		res.json(projects);
	} catch (error) {
		console.error('Error fetching projects:', error);
		res.status(500).send('Internal Server Error');
	}
};

export const createProject = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { name, description } = req.body;

		if (!name || !description) {
			res.status(400).send('Missing required fields');
			return;
		}

		db.run(
			'INSERT INTO projects (name, description) VALUES (@name, @description)',
			{ name, description },
		);
		res.status(201).send('Project created');
	} catch (error) {
		console.error('Error creating project:', error);
		res.status(500).send('Internal Server Error');
	}
};

export const updateProject = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const { name, description } = req.body;

		if (!id || !name || !description) {
			res.status(400).send('Missing required fields');
			return;
		}

		const result = db.run(
			'UPDATE projects SET name = @name, description = @description WHERE id = @id',
			{ name, description, id },
		);

		if (result.changes === 0) {
			res.status(404).send('Project not found');
			return;
		}

		res.send('Project updated');
	} catch (error) {
		console.error('Error updating project:', error);
		res.status(500).send('Internal Server Error');
	}
};

export const deleteProject = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;

		if (!id) {
			res.status(400).send('Missing project ID');
			return;
		}

		const result = db.run('DELETE FROM projects WHERE id = @id', { id });

		if (result.changes === 0) {
			res.status(404).send('Project not found');
			return;
		}

		res.send('Project deleted');
	} catch (error) {
		console.error('Error deleting project:', error);
		res.status(500).send('Internal Server Error');
	}
};
