import request from 'supertest';
import app from '../index';
import db from '../services/db.service';
beforeEach(() => {
	db.run('DELETE FROM reports');
	db.run('DELETE FROM projects');

	db.run(
		'INSERT INTO projects (id, name, description) VALUES (@id, @name, @description)',
		{ id: 1, name: 'Test Project', description: 'A test project' },
	);

	db.run(
		'INSERT INTO reports (id, text, project_id) VALUES (@id, @text, @project_id)',
		{ id: 1, text: 'Test Report', project_id: 1 },
	);

	// console.log('Database seeded successfully');
});

afterEach(() => {
	const projects = db.query('SELECT * FROM projects');
	const reports = db.query('SELECT * FROM reports');
	// console.log('Projects:', projects);
	// console.log('Reports:', reports);
});

afterAll(() => {
	db.run('DELETE FROM reports');
	db.run('DELETE FROM projects');
});

describe('Projects API', () => {
	const authHeader = { Authorization: 'Password123' };

	it('should fetch all projects', async () => {
		const response = await request(app)
			.get('/api/projects')
			.set(authHeader);
		expect(response.status).toBe(200);
		expect(response.body).toBeInstanceOf(Array);
	});

	it('should create a new project', async () => {
		const response = await request(app)
			.post('/api/projects')
			.set(authHeader)
			.send({
				name: 'Another Project',
				description: 'Another description',
			});
		expect(response.status).toBe(201);
	});

	it('should update an existing project', async () => {
		const response = await request(app)
			.put('/api/projects/1')
			.set(authHeader)
			.send({
				name: 'Updated Project',
				description: 'Updated description',
			});
		expect(response.status).toBe(200);
	});

	it('should delete a project', async () => {
		const response = await request(app)
			.delete('/api/projects/1')
			.set(authHeader);
		expect(response.status).toBe(200);
	});
});

describe('Reports API', () => {
	const authHeader = { Authorization: 'Password123' };

	it('should fetch all reports', async () => {
		const response = await request(app).get('/api/reports').set(authHeader);
		expect(response.status).toBe(200);
		expect(response.body).toBeInstanceOf(Array);
	});

	it('should create a new report', async () => {
		const response = await request(app)
			.post('/api/reports')
			.set(authHeader)
			.send({ text: 'Another Test Report', project_id: 1 });
		// console.log('Create Report Response:', response.body);
		expect(response.status).toBe(201);
	});

	it('should update an existing report', async () => {
		const response = await request(app)
			.put('/api/reports/1')
			.set(authHeader)
			.send({ text: 'Updated Test Report', project_id: 1 });
		expect(response.status).toBe(200);
	});

	it('should delete a report', async () => {
		const response = await request(app)
			.delete('/api/reports/1')
			.set(authHeader);
		expect(response.status).toBe(200);
	});

	it('should fetch reports with frequent words', async () => {
		const response = await request(app)
			.get('/api/reports/frequent-words')
			.set(authHeader);
		expect(response.status).toBe(200);
		expect(response.body).toBeInstanceOf(Array);
	});
});
