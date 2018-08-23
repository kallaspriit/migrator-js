import { ConnectionOptions } from "typeorm";
import { MigrationInfo, MigrationStatus, MigrationStorage } from "../../common";
export interface DatabaseResult {
    [x: string]: string | number;
}
export declare const DEFAULT_DATABASE_CONNECTION_NAME = "migrator";
export declare class Migration {
    name: string;
    filename: string;
    status: MigrationStatus;
    timeTaken: number;
    result: string;
    startDate: Date;
    endDate: Date;
}
export default class MigratorTypeormStorage implements MigrationStorage {
    private readonly connectionOptions;
    constructor(connectionOptions: ConnectionOptions);
    private static getMigrationInfo;
    getPerformedMigrations(): Promise<MigrationInfo[]>;
    insertMigration(name: string, filename: string): Promise<void>;
    updateMigration(name: string, status: MigrationStatus, result: string, timeTaken: number): Promise<void>;
    close(): Promise<void>;
    private openConnection;
}
