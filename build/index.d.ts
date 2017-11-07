import { IMigration, IMigrationResult, IMigrationStorage, IMigratorOptions, MigrationStatus } from './common';
export { default as MigratorTypeormStorage } from './storage/typeorm';
export { ConnectionOptions, Connection, createConnection } from 'typeorm';
export { IMigration, IMigrationResult, IMigrationStorage, IMigratorOptions, MigrationExecutorFn, MigrationStatus } from './common';
export declare class Migration<Context> implements IMigration {
    name: string;
    filename: string;
    protected context: Context;
    protected storage: IMigrationStorage;
    status: MigrationStatus;
    timeTaken?: number;
    result?: string;
    startDate?: Date;
    endDate?: Date;
    constructor(name: string, filename: string, context: Context, storage: IMigrationStorage);
    run(): Promise<string>;
}
export default class Migrator<T> {
    protected options: IMigratorOptions<T>;
    constructor(options: IMigratorOptions<T>);
    getMigrationFilenames(): Promise<string[]>;
    getPerformedMigrations(): Promise<IMigration[]>;
    getPendingMigrations(): Promise<Array<Migration<T>>>;
    protected getMigrationName(migrationFilename: string): string;
}
export declare function migrate<Context>(options: IMigratorOptions<Context>): Promise<IMigrationResult>;
