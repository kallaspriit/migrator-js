import { IMigration, IMigrationInfo, IMigrationResult, IMigrationStorage, IMigratorOptions, MigrationStatus } from './common';
export { default as MigratorTypeormStorage } from './storage/typeorm';
export declare class Migration<Context> implements IMigration {
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
export declare function migrate<Context>(options: IMigratorOptions<Context>): Promise<IMigrationResult>;
