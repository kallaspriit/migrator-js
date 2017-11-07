import {
	Column,
	Connection,
	ConnectionOptions,
	createConnection,
	CreateDateColumn,
	Entity,
	PrimaryColumn,
	UpdateDateColumn,
} from 'typeorm';
import {IMigration, IMigrationStorage, MigrationStatus} from '../../common';

export interface IDatabaseResult {
	[x: string]: string | number;
}

@Entity()
export class Migration {
	@PrimaryColumn({type: 'varchar', nullable: false, length: 256})
	public name: string;

	@Column({type: 'varchar', nullable: true})
	public filename: string;

	@Column({type: 'varchar', nullable: false, default: MigrationStatus.RUNNING})
	public status: MigrationStatus;

	@Column({type: 'int', nullable: true})
	public timeTaken: number;

	@Column({type: 'text', nullable: true})
	public result: string;

	@CreateDateColumn() public startDate: Date;

	@UpdateDateColumn() public endDate: Date;
}

// tslint:disable-next-line:max-classes-per-file
export default class MigratorTypeormStorage implements IMigrationStorage {
	protected connectionCount: number = 0;

	constructor(protected connectionOptions: ConnectionOptions) {}

	public async getPerformedMigrations(): Promise<IMigration[]> {
		const connection = await this.getConnection();

		try {
			const repository = connection.getRepository(Migration);

			const migrations = await repository.find({
				where: {
					status: MigrationStatus.COMPLETE,
				},
			});

			return migrations.map(this.getMigrationInfo);
		} catch (e) {
			console.error('Fetching performed migrations failed', e.stack);

			return [];
		} finally {
			await connection.close();
		}
	}

	public async insertMigration(name: string, filename: string): Promise<void> {
		const connection = await this.getConnection();

		try {
			const repository = connection.getRepository(Migration);

			await repository.save({
				name,
				filename,
				status: MigrationStatus.RUNNING,
			});
		} catch (e) {
			console.error('Inserting migration failed', e.stack);
		} finally {
			await connection.close();
		}
	}

	public async updateMigration(
		name: string,
		status: MigrationStatus,
		result: string,
		timeTaken: number,
	): Promise<void> {
		const connection = await this.getConnection();

		try {
			const repository = connection.getRepository(Migration);
			const migration = await repository.findOneById(name);

			if (!migration) {
				throw new Error(`Migration called "${name}" was not found`);
			}

			migration.status = status;
			migration.result = result;
			migration.timeTaken = timeTaken;

			await repository.save(migration);
		} catch (e) {
			console.error('Updating migration failed', e.stack);
		} finally {
			await connection.close();
		}
	}

	protected async getConnection(): Promise<Connection> {
		const connection = await createConnection({
			...this.connectionOptions,
			name: `migrator-${++this.connectionCount}`,
			entities: [Migration],
			synchronize: true,
		});

		if (!connection.isConnected) {
			throw new Error(`Connecting to migrator-js database failed (${JSON.stringify(this.connectionOptions)})`);
		}

		return connection;
	}

	protected getMigrationInfo(migration: Migration): IMigration {
		return {
			name: migration.name,
			filename: migration.filename,
			status: migration.status,
			timeTaken: migration.timeTaken,
			startDate: migration.startDate,
			endDate: migration.endDate,
			result: migration.result,
		};
	}

	protected resolveStatus(statusName: string): MigrationStatus {
		switch (statusName) {
			case MigrationStatus.RUNNING:
				return MigrationStatus.RUNNING;

			case MigrationStatus.COMPLETE:
				return MigrationStatus.COMPLETE;

			case MigrationStatus.FAILED:
				return MigrationStatus.FAILED;

			default:
				return MigrationStatus.FAILED;
		}
	}
}
