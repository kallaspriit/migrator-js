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
    toJSON(): IMigration;
}
export declare class Migrator<Context> {
    protected context: Context;
    protected options: IMigratorOptions;
    constructor(context: Context, userOptions: Partial<IMigratorOptions>);
    getMigrationFilenames(): Promise<string[]>;
    getPerformedMigrations(): Promise<IMigration[]>;
    getPendingMigrations(): Promise<Array<Migration<Context>>>;
    protected getMigrationName(migrationFilename: string): string;
}
export default function migrate<Context>(context: Context, options: Partial<IMigratorOptions>): Promise<IMigrationResult>;
