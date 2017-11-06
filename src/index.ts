import * as glob from 'glob';
import * as inquirer from 'inquirer';
import * as Listr from 'listr';
import * as path from 'path';
import * as naturalSort from 'string-natural-compare';
import {
	IMigration,
	IMigrationInfo,
	IMigrationResult,
	IMigrationStorage,
	IMigratorOptions,
	MigrationExecutorFn,
	MigrationStatus,
} from './common';

export {default as MigratorTypeormStorage} from './storage/typeorm';

export class Migration<Context> implements IMigration {
	public timeTaken: number = 0;
	public result?: string;
	public status = MigrationStatus.PENDING;

	constructor(
		public name: string,
		public filename: string,
		public context: Context,
		public storage: IMigrationStorage,
	) {}

	public async run(): Promise<string> {
		return new Promise<string>(async (resolve, reject) => {
			const migration: MigrationExecutorFn<Context> = require(this.filename).default;

			let startTime: number = Date.now();

			await this.storage.insertMigration(this.name);

			try {
				startTime = Date.now();
				this.result = await migration(this.context);
				this.timeTaken = Date.now() - startTime;
				this.status = MigrationStatus.COMPLETE;

				await this.storage.updateMigration(this.name, this.status, this.result, this.timeTaken);

				resolve(this.result);
			} catch (e) {
				this.result = e.message;
				this.timeTaken = Date.now() - startTime;
				this.status = MigrationStatus.FAILED;

				await this.storage.updateMigration(this.name, this.status, e.stack, this.timeTaken);

				reject(e);
			}
		});
	}
}

// tslint:disable-next-line:max-classes-per-file
export default class Migrator<T> {
	constructor(protected options: IMigratorOptions<T>) {}

	public async getMigrationFilenames(): Promise<string[]> {
		return new Promise<string[]>((resolve, reject) => {
			glob(this.options.pattern, (error, filenames) => {
				if (error) {
					reject(error);

					return;
				}

				resolve(filenames.sort(naturalSort));
			});
		});
	}

	public async getPerformedMigrations(): Promise<IMigrationInfo[]> {
		return this.options.storage.getPerformedMigrations();
	}

	public async getPendingMigrations(): Promise<Array<Migration<T>>> {
		const migrationFilenames = await this.getMigrationFilenames();
		const performedMigrations = await this.getPerformedMigrations();

		return migrationFilenames
			.filter(
				migrationFilename =>
					performedMigrations.find(
						performedMigration => performedMigration.name === this.getMigrationName(migrationFilename),
					) === undefined,
			)
			.map(
				migrationFilename =>
					new Migration(
						this.getMigrationName(migrationFilename),
						migrationFilename,
						this.options.context,
						this.options.storage,
					),
			);
	}

	protected getMigrationName(migrationFilename: string): string {
		return path.basename(migrationFilename, '.js');
	}
}

export async function migrate<Context>(options: IMigratorOptions<Context>): Promise<IMigrationResult> {
	return new Promise<IMigrationResult>(async (resolve, _reject) => {
		const migrator = new Migrator<Context>(options);
		const pendingMigrations = await migrator.getPendingMigrations();

		if (pendingMigrations.length === 0) {
			resolve({
				pendingMigrations,
				chosenMigrations: [],
				performedMigrations: [],
				failedMigrations: [],
			});

			return;
		}

		const choiceResult = await inquirer.prompt([
			{
				type: 'checkbox',
				name: 'chosenMigrations',
				message: 'Choose migrations to execute',
				choices: pendingMigrations.map(pendingMigration => ({
					name: pendingMigration.name,
					value: pendingMigration.filename,
				})),
			},
		]);

		const chosenMigrationFilenames: string[] = choiceResult.chosenMigrations;
		const chosenMigrations = pendingMigrations.filter(
			pendingMigration => chosenMigrationFilenames.indexOf(pendingMigration.filename) !== -1,
		);

		const taskRunner = new Listr<Context>(
			chosenMigrations.map(migration => ({
				title: migration.name,
				async task() {
					try {
						await migration.run();

						this.title = `${this.title} - done in ${migration.timeTaken}ms`;
					} catch (e) {
						this.title = `${this.title} - failed in ${migration.timeTaken}ms`;

						throw e;
					}
				},
			})),
		);

		try {
			await taskRunner.run();
		} catch (_e) {
			// ignore error, states get updated
		}

		resolve({
			pendingMigrations,
			chosenMigrations,
			performedMigrations: chosenMigrations.filter(migration => migration.status === MigrationStatus.COMPLETE),
			failedMigrations: chosenMigrations.filter(migration => migration.status === MigrationStatus.FAILED),
		});
	});
}
