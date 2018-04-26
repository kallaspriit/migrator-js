import {
  Column,
  Connection,
  ConnectionOptions,
  createConnection,
  CreateDateColumn,
  Entity,
  getConnection,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { IMigration, IMigrationStorage, MigrationStatus } from "../../common";

export interface IDatabaseResult {
  [x: string]: string | number;
}

@Entity()
export class Migration {
  @PrimaryColumn({ type: "varchar", nullable: false, length: 255 })
  public name!: string;

  @Column({ type: "varchar", nullable: true })
  public filename!: string;

  @Column({ type: "varchar", nullable: false, default: MigrationStatus.RUNNING })
  public status!: MigrationStatus;

  @Column({ type: "int", nullable: true })
  public timeTaken!: number;

  @Column({ type: "text", nullable: true })
  public result!: string;

  @CreateDateColumn() public startDate!: Date;

  @UpdateDateColumn() public endDate!: Date;
}

export const DATABASE_CONNECTION_NAME = "migrator";

// tslint:disable-next-line:max-classes-per-file
export default class MigratorTypeormStorage implements IMigrationStorage {
  public constructor(private readonly connectionOptions: ConnectionOptions) {}

  private static getMigrationInfo(migration: Migration): IMigration {
    return {
      name: migration.name,
      filename: migration.filename,
      status: migration.status,
      timeTaken: migration.timeTaken,
      startDate: migration.startDate,
      endDate: migration.endDate,
      result: migration.result,
    };
  }

  public async getPerformedMigrations(): Promise<IMigration[]> {
    const connection = await this.getConnection();

    try {
      const repository = connection.getRepository(Migration);

      const migrations = await repository.find({
        where: {
          status: MigrationStatus.COMPLETE,
        },
      });

      return migrations.map(migration => MigratorTypeormStorage.getMigrationInfo(migration));
    } catch (e) {
      console.error("Fetching performed migrations failed", e.stack);

      return [];
    } finally {
      await connection.close();
    }
  }

  public async insertMigration(name: string, filename: string): Promise<void> {
    const connection = await this.getConnection();

    try {
      const repository = connection.getRepository(Migration);

      await repository.save({
        name,
        filename,
        status: MigrationStatus.RUNNING,
      });
    } catch (e) {
      console.error("Inserting migration failed", e.stack);
    } finally {
      await connection.close();
    }
  }

  public async updateMigration(
    name: string,
    status: MigrationStatus,
    result: string,
    timeTaken: number,
  ): Promise<void> {
    const connection = await this.getConnection();

    try {
      const repository = connection.getRepository(Migration);
      const migration = await repository.findOneById(name);

      if (!migration) {
        throw new Error(`Migration called "${name}" was not found`);
      }

      migration.status = status;
      migration.result = result;
      migration.timeTaken = timeTaken;

      await repository.save(migration);
    } catch (e) {
      console.error("Updating migration failed", e.stack);
    } finally {
      await connection.close();
    }
  }

  private async getConnection(): Promise<Connection> {
    // close existing connection if one exists
    try {
      // this will throw if no connection exists
      const existingConnection = getConnection(DATABASE_CONNECTION_NAME);

      await existingConnection.close();
    } catch (e) {
      // not having an existing connection is expected
    }

    // create a new connection
    const connection = await createConnection({
      ...this.connectionOptions,
      name: DATABASE_CONNECTION_NAME,
      entities: [Migration],
      synchronize: true,
    });

    // throw error if failed to actually connect
    if (!connection.isConnected) {
      throw new Error(`Connecting to migrator-js database failed (${JSON.stringify(this.connectionOptions)})`);
    }

    return connection;
  }
}
