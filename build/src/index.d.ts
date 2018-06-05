import { MigrationInfo, MigrationResult, MigrationStatus, MigrationStorage, MigratorOptions } from "./common";
export { default as MigratorTypeormStorage } from "./storage/typeorm";
export { ConnectionOptions, Connection, createConnection } from "typeorm";
export { MigrationInfo, MigrationResult, MigrationStorage, MigratorOptions, MigrationExecutorFn, MigrationStatus, } from "./common";
export declare class Migration<Context> implements MigrationInfo {
    name: string;
    filename: string;
    private readonly context;
    private readonly storage;
    status: MigrationStatus;
    timeTaken?: number;
    result?: string;
    startDate?: Date;
    endDate?: Date;
    constructor(name: string, filename: string, context: Context, storage: MigrationStorage);
    run(): Promise<string>;
    toJSON(): MigrationInfo;
}
export declare class Migrator<Context> {
    private readonly context;
    private readonly options;
    constructor(context: Context, userOptions: Partial<MigratorOptions>);
    private static getMigrationName;
    getMigrationFilenames(): Promise<string[]>;
    getPerformedMigrations(): Promise<MigrationInfo[]>;
    getPendingMigrations(): Promise<Array<Migration<Context>>>;
}
export default function migrate<Context>(context: Context, options: Partial<MigratorOptions>): Promise<MigrationResult>;
