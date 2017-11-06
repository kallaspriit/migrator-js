import {IMigrationContext} from '../';

export default async (context: IMigrationContext): Promise<string> => {
	// run any query, crop images etc
	const tables = await context.connection.query('SELECT 1+1 AS sum');

	return JSON.stringify(tables);
};
