import * as path from 'path';
import migrate, {
	Connection,
	ConnectionOptions,
	createConnection,
	IMigratorOptions,
	Migration,
	MigrationStatus,
	Migrator,
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

function getConnectionOptions(): ConnectionOptions {
	return {
		type: 'sqlite',
		name: `migrator-test-${++migratorCount}`,
		database: path.join(__dirname, '..', '..', `migrate-${Date.now()}-${migratorCount}.sqlite3`),
	};
}

function getMigratorOptions(): IMigratorOptions {
	return {
		pattern: path.join(__dirname, 'migrations', '!(*.spec|*.test|*.d).{ts,js}'),
		storage: new MigratorTypeormStorage(getConnectionOptions()),
		autorunAll: false,
	};
}

async function setupMigrator(): Promise<Migrator<IMigrationContext>> {
	const connection = await createConnection(getConnectionOptions());

	return new Migrator<IMigrationContext>(
		{
			connection,
		},
		getMigratorOptions(),
	);
}

function preprocessSnapshot(migration: Migration<IMigrationContext>): IMigrationSnapshot {
	const info = migration.toJSON();

	return {
		name: info.name,
		status: info.status,
		result: info.result,
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
		expect(pendingMigrations1.map(preprocessSnapshot)).toMatchSnapshot();

		const result = await pendingMigrations1[0].run();
		expect(result).toMatchSnapshot();

		const pendingMigrations2 = await migrator.getPendingMigrations();
		expect(pendingMigrations2).toHaveLength(1);
		expect(pendingMigrations2.map(preprocessSnapshot)).toMatchSnapshot();
	});

	it('should handle failing migration', async () => {
		const migrator = await setupMigrator();
		const pendingMigrations1 = await migrator.getPendingMigrations();
		expect(pendingMigrations1).toHaveLength(2);
		expect(pendingMigrations1.map(preprocessSnapshot)).toMatchSnapshot();
		await expect(pendingMigrations1[1].run()).rejects.toHaveProperty('message', `Example failure message`);

		const pendingMigrations2 = await migrator.getPendingMigrations();
		expect(pendingMigrations2).toHaveLength(2);
		expect(pendingMigrations2.map(preprocessSnapshot)).toMatchSnapshot();
	});

	it('provides interactive migrator', async () => {
		const connection = await createConnection(getConnectionOptions());
		const results = await migrate<IMigrationContext>(
			{
				connection,
			},
			{
				...getMigratorOptions(),
				autorunAll: true,
			},
		);

		expect({
			pendingMigrations: results.pendingMigrations.map(preprocessSnapshot),
			chosenMigrations: results.chosenMigrations.map(preprocessSnapshot),
			performedMigrations: results.performedMigrations.map(preprocessSnapshot),
			failedMigrations: results.failedMigrations.map(preprocessSnapshot),
		}).toMatchSnapshot();
	});

	it('handles empty list of pending migrations', async () => {
		const connection = await createConnection(getConnectionOptions());
		const results = await migrate<IMigrationContext>(
			{
				connection,
			},
			{
				...getMigratorOptions(),
				autorunAll: true,
				pattern: 'xxx', // won't find any migrations
			},
		);

		expect({
			pendingMigrations: results.pendingMigrations.map(preprocessSnapshot),
			chosenMigrations: results.chosenMigrations.map(preprocessSnapshot),
			performedMigrations: results.performedMigrations.map(preprocessSnapshot),
			failedMigrations: results.failedMigrations.map(preprocessSnapshot),
		}).toMatchSnapshot();
	});
});
