import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Default route
app.get('/', (req: Request, res: Response) => {
	res.send('Welcome to the DPS Backend Challenge API!');
});

// Start the server
app.listen(port, () => {
	console.log(`[server]: Server is running at http://localhost:${port}`);
});

export default app;
