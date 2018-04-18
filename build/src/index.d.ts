import { IMigration, IMigrationResult, IMigrationStorage, IMigratorOptions, MigrationStatus } from "./common";
export { default as MigratorTypeormStorage } from "./storage/typeorm";
export { ConnectionOptions, Connection, createConnection } from "typeorm";
export { IMigration, IMigrationResult, IMigrationStorage, IMigratorOptions, MigrationExecutorFn, MigrationStatus } from "./common";
export declare class Migration<Context> implements IMigration {
    name: string;
    filename: string;
    private readonly context;
    private readonly storage;
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
    private readonly context;
    private readonly options;
    constructor(context: Context, userOptions: Partial<IMigratorOptions>);
    private static getMigrationName(migrationFilename);
    getMigrationFilenames(): Promise<string[]>;
    getPerformedMigrations(): Promise<IMigration[]>;
    getPendingMigrations(): Promise<Array<Migration<Context>>>;
}
export default function migrate<Context>(context: Context, options: Partial<IMigratorOptions>): Promise<IMigrationResult>;
