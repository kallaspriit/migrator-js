import * as path from 'path';
import Migrator, {
	Connection,
	ConnectionOptions,
	createConnection,
	IMigration,
	MigrationStatus,
	MigratorTypeormStorage,
} from '../';

interface IMigrationContext {
	connection: Connection;
}

interface IMigrationSnapshot {
	name: string;
	status: MigrationStatus;
	result?: string;
}

let migratorCount = 0;

async function setupMigrator(): Promise<Migrator<IMigrationContext>> {
	const connectionOptions: ConnectionOptions = {
		type: 'sqlite',
		name: `migrator-test-${++migratorCount}`,
		database: `migrate-${Date.now()}.sqlite3`,
	};
	const connection = await createConnection(connectionOptions);

	return new Migrator<IMigrationContext>({
		pattern: path.join(__dirname, 'migrations', '!(*.spec|*.test|*.d).{ts,js}'),
		storage: new MigratorTypeormStorage(connectionOptions),
		context: {
			connection,
		},
	});
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
		const migrator = await setupMigrator();
		const pendingMigrations = await migrator.getPendingMigrations();

		expect(pendingMigrations.map(preprocessSnapshot)).toMatchSnapshot();
	});

	it('should run a single migration', async () => {
		const migrator = await setupMigrator();
		const pendingMigrations1 = await migrator.getPendingMigrations();
		expect(pendingMigrations1).toHaveLength(2);

		const result = await pendingMigrations1[0].run();
		expect(result).toMatchSnapshot();

		const pendingMigrations2 = await migrator.getPendingMigrations();
		expect(pendingMigrations2).toHaveLength(1);
	});

	it('should handle failing migration', async () => {
		const migrator = await setupMigrator();
		const pendingMigrations1 = await migrator.getPendingMigrations();
		expect(pendingMigrations1).toHaveLength(2);

		await expect(pendingMigrations1[1].run()).rejects.toHaveProperty('message', `Example failure message`);

		const pendingMigrations2 = await migrator.getPendingMigrations();
		expect(pendingMigrations2).toHaveLength(2);
	});
});
