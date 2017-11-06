export enum MigrationStatus {
	PENDING = 'PENDING',
	RUNNING = 'RUNNING',
	COMPLETE = 'COMPLETE',
	FAILED = 'FAILED',
}

export interface IMigrationInfo {
	name: string;
	status: MigrationStatus;
	timeTaken: number;
	result: string;
	startDate: Date;
	endDate: Date;
}

export interface IMigrationStorage {
	getPerformedMigrations(): Promise<IMigrationInfo[]>;
	insertMigration(name: string): Promise<void>;
	updateMigration(name: string, status: MigrationStatus, result: string, timeTaken: number): Promise<void>;
}

export type MigrationExecutorFn<Context> = (context: Context) => Promise<string>;

export interface IMigratorOptions<Context> {
	pattern: string;
	storage: IMigrationStorage;
	context: Context;
}

export interface IMigration {
	timeTaken: number;
	result?: string;
	status: MigrationStatus;

	run(): Promise<string>;
}

export interface IMigrationResult {
	pendingMigrations: IMigration[];
	chosenMigrations: IMigration[];
	performedMigrations: IMigration[];
	failedMigrations: IMigration[];
}
