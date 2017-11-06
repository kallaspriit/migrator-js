import { Connection } from 'typeorm';
export interface IMigrationContext {
    connection: Connection;
}
