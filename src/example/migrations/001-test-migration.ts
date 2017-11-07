import {IMigrationContext} from '../';

export default async (context: IMigrationContext): Promise<string> => {
	return `version: ${context.version}`;
};
