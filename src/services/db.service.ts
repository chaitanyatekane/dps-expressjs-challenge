import sqlite from 'better-sqlite3';
import path from 'path';

const db = new sqlite(path.resolve('./db/db.sqlite3'), {
	fileMustExist: false,
});

db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL
    )
`);

function query(
	sql: string,
	params?:
		| { [key: string]: string | number | undefined }
		| (string | number | undefined)[],
) {
	return params ? db.prepare(sql).all(params) : db.prepare(sql).all();
}

function run(
	sql: string,
	params?:
		| { [key: string]: string | number | undefined }
		| (string | number | undefined)[],
) {
	return params ? db.prepare(sql).run(params) : db.prepare(sql).run();
}

export default { query, run };
