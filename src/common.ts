export enum MigrationStatus {
	PENDING = 'PENDING',
	RUNNING = 'RUNNING',
	COMPLETE = 'COMPLETE',
	FAILED = 'FAILED',
}

export interface IMigration {
	name: string;
	filename: string;
	status: MigrationStatus;
	timeTaken?: number;
	startDate?: Date;
	endDate?: Date;
	result?: string;
}

export interface IMigrationStorage {
	getPerformedMigrations(): Promise<IMigration[]>;
	insertMigration(name: string, filename: string): Promise<void>;
	updateMigration(name: string, status: MigrationStatus, result: string, timeTaken: number): Promise<void>;
}

export type MigrationExecutorFn<Context> = (context: Context) => Promise<string>;

export interface IMigratorOptions<Context> {
	pattern: string;
	storage: IMigrationStorage;
	context: Context;
}

export interface IMigrationResult {
	pendingMigrations: IMigration[];
	chosenMigrations: IMigration[];
	performedMigrations: IMigration[];
	failedMigrations: IMigration[];
}
