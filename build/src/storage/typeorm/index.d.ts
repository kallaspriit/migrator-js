import { ConnectionOptions } from "typeorm";
import { IMigration, IMigrationStorage, MigrationStatus } from "../../common";
export interface IDatabaseResult {
    [x: string]: string | number;
}
export declare class Migration {
    name: string;
    filename: string;
    status: MigrationStatus;
    timeTaken: number;
    result: string;
    startDate: Date;
    endDate: Date;
}
export declare const DATABASE_CONNECTION_NAME = "migrator";
export default class MigratorTypeormStorage implements IMigrationStorage {
    private readonly connectionOptions;
    constructor(connectionOptions: ConnectionOptions);
    private static getMigrationInfo(migration);
    getPerformedMigrations(): Promise<IMigration[]>;
    insertMigration(name: string, filename: string): Promise<void>;
    updateMigration(name: string, status: MigrationStatus, result: string, timeTaken: number): Promise<void>;
    private getConnection();
}
