import { Connection } from 'typeorm';
export { default as MigratorTypeormStorage } from '../storage/typeorm';
export interface IMigrationContext {
    connection: Connection;
}
