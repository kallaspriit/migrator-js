import * as path from 'path';
import Migrator, {ConnectionOptions, IMigration, MigrationStatus, MigratorTypeormStorage} from '../';

interface IMigrationContext {
	version: string;
}

interface IMigrationSnapshot {
	name: string;
	status: MigrationStatus;
	result?: string;
}

function preprocessSnapshot(migration: IMigration): IMigrationSnapshot {
	return {
		name: migration.name,
		status: migration.status,
		result: migration.result,
	};
}

describe('migrator-js', () => {
	it('should provide list of pending migrations', async () => {
		const connectionOptions: ConnectionOptions = {
			type: 'sqlite',
			database: `migrate-${Date.now()}.sqlite3`,
		};
		const migrator = new Migrator<IMigrationContext>({
			pattern: path.join(__dirname, 'migrations', '!(*.spec|*.test|*.d).{ts,js}'),
			storage: new MigratorTypeormStorage(connectionOptions),
			context: {
				version: '1.0.0',
			},
		});
		const pendingMigrations = await migrator.getPendingMigrations();

		expect(pendingMigrations.map(preprocessSnapshot)).toMatchSnapshot();
	});
});
