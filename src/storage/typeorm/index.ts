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
import {IMigrationInfo, IMigrationStorage, MigrationStatus} from '../../index';

export interface IDatabaseResult {
	[x: string]: string | number;
}

@Entity()
export class Migration {
	@PrimaryColumn({type: 'varchar', nullable: false, length: 256})
	public name: string;

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

	public async getPerformedMigrations(): Promise<IMigrationInfo[]> {
		const connection = await this.getConnection();

		const performedMigrations = connection.getRepository(Migration).find({
			where: {
				status: MigrationStatus.COMPLETE,
			},
		});

		await connection.close();

		return performedMigrations;
	}

	public async insertMigration(name: string): Promise<void> {
		const connection = await this.getConnection();

		connection.getRepository(Migration).save({
			name,
			status: MigrationStatus.RUNNING,
		});

		await connection.close();
	}

	public async updateMigration(
		name: string,
		status: MigrationStatus,
		result: string,
		timeTaken: number,
	): Promise<void> {
		const connection = await this.getConnection();
		const repository = connection.getRepository(Migration);
		const migration = await repository.findOneById(name);

		if (!migration) {
			throw new Error(`Migration called "${name}" was not found`);
		}

		migration.status = status;
		migration.result = result;
		migration.timeTaken = timeTaken;

		repository.save(migration);

		await connection.close();
	}

	protected async getConnection(): Promise<Connection> {
		return createConnection({
			...this.connectionOptions,
			name: `migrator-${++this.connectionCount}`,
			entities: [Migration],
			synchronize: true,
		});
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
