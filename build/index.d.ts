export { default as MigratorTypeormStorage } from './storage/typeorm';
export declare enum MigrationStatus {
    PENDING = "PENDING",
    RUNNING = "RUNNING",
    COMPLETE = "COMPLETE",
    FAILED = "FAILED",
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
export declare type MigrationExecutorFn<Context> = (context: Context) => Promise<string>;
export interface IMigratorOptions<Context> {
    pattern: string;
    storage: IMigrationStorage;
    context: Context;
}
export interface IMigrationResult<Context> {
    pendingMigrations: Array<Migration<Context>>;
    chosenMigrations: Array<Migration<Context>>;
    performedMigrations: Array<Migration<Context>>;
    failedMigrations: Array<Migration<Context>>;
}
export declare class Migration<Context> {
    name: string;
    filename: string;
    context: Context;
    storage: IMigrationStorage;
    timeTaken: number;
    result?: string;
    status: MigrationStatus;
    constructor(name: string, filename: string, context: Context, storage: IMigrationStorage);
    run(): Promise<string>;
}
export default class Migrator<T> {
    protected options: IMigratorOptions<T>;
    constructor(options: IMigratorOptions<T>);
    getMigrationFilenames(): Promise<string[]>;
    getPerformedMigrations(): Promise<IMigrationInfo[]>;
    getPendingMigrations(): Promise<Array<Migration<T>>>;
    protected getMigrationName(migrationFilename: string): string;
}
export declare function migrate<Context>(options: IMigratorOptions<Context>): Promise<IMigrationResult<Context>>;
