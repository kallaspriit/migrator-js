import path from "path";
import glob from "glob";
import inquirer from "inquirer";
import Listr from "listr";
import naturalSort from "string-natural-compare";
import { ConnectionOptions } from "typeorm";
import {
  MigrationExecutorFn,
  MigrationInfo,
  MigrationResult,
  MigrationStatus,
  MigrationStorage,
  MigratorOptions,
} from "./common";
import MigratorTypeormStorage from "./storage/typeorm";

export { default as MigratorTypeormStorage } from "./storage/typeorm";
export { ConnectionOptions, Connection, createConnection } from "typeorm";
export {
  MigrationInfo,
  MigrationResult,
  MigrationStorage,
  MigratorOptions,
  MigrationExecutorFn,
  MigrationStatus,
} from "./common";

interface MigrationPromptResult {
  chosenMigrations: string[];
}

export class Migration<Context> implements MigrationInfo {
  public status = MigrationStatus.PENDING;
  public timeTaken?: number;
  public result?: string;
  public startDate?: Date;
  public endDate?: Date;

  public constructor(
    public name: string,
    public filename: string,
    private readonly context: Context,
    private readonly storage: MigrationStorage,
  ) {}

  public async run(): Promise<string> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise<string>(async (resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const migration: MigrationExecutorFn<Context> = require(this.filename).default;

      await this.storage.insertMigration(this.name, this.filename);

      this.startDate = new Date();

      try {
        this.result = await migration(this.context);
        this.endDate = new Date();
        this.timeTaken = this.endDate.getTime() - this.startDate.getTime();
        this.status = MigrationStatus.COMPLETE;

        await this.storage.updateMigration(this.name, this.status, this.result, this.timeTaken);

        resolve(this.result);
      } catch (e) {
        const error = e as Error;

        this.result = error.message;
        this.endDate = new Date();
        this.timeTaken = this.endDate.getTime() - this.startDate.getTime();
        this.status = MigrationStatus.FAILED;

        await this.storage.updateMigration(this.name, this.status, error.stack ?? "", this.timeTaken);

        reject(e);
      }
    });
  }

  public toJSON(): MigrationInfo {
    return {
      name: this.name,
      filename: this.filename,
      status: this.status,
      timeTaken: this.timeTaken,
      startDate: this.startDate,
      endDate: this.endDate,
      result: this.result,
    };
  }
}

export class Migrator<Context> {
  private readonly options: MigratorOptions;

  public constructor(private readonly context: Context, userOptions: Partial<MigratorOptions>) {
    const connectionOptions: ConnectionOptions = {
      type: "sqlite",
      name: `migrator`,
      database: `migrator.sqlite3`,
    };

    this.options = {
      pattern: path.join(__dirname, "..", "..", "src", "migrations", "!(*.spec|*.test|*.d).{ts,js}"),
      storage: new MigratorTypeormStorage(connectionOptions),
      ...userOptions,
    };
  }

  private static getMigrationName(migrationFilename: string): string {
    return path.basename(migrationFilename, ".js");
  }

  public async getMigrationFilenames(): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      glob(this.options.pattern, (error, filenames) => {
        /* istanbul ignore if */
        if (error !== null) {
          reject(error);

          return;
        }

        resolve(filenames.sort(naturalSort));
      });
    });
  }

  public async getPerformedMigrations(): Promise<MigrationInfo[]> {
    return this.options.storage.getPerformedMigrations();
  }

  public async getPendingMigrations(): Promise<Array<Migration<Context>>> {
    const migrationFilenames = await this.getMigrationFilenames();
    const performedMigrations = await this.getPerformedMigrations();

    return migrationFilenames
      .filter(
        (migrationFilename) =>
          performedMigrations.find(
            (performedMigration) => performedMigration.name === Migrator.getMigrationName(migrationFilename),
          ) === undefined,
      )
      .map(
        (migrationFilename) =>
          new Migration(
            Migrator.getMigrationName(migrationFilename),
            migrationFilename,
            this.context,
            this.options.storage,
          ),
      );
  }

  public async migrate(autoRun = false): Promise<MigrationResult> {
    // eslint-disable-next-line no-async-promise-executor, promise/param-names
    return new Promise<MigrationResult>(async (resolve, _reject) => {
      const pendingMigrations = await this.getPendingMigrations();

      if (pendingMigrations.length === 0) {
        resolve({
          pendingMigrations,
          chosenMigrations: [],
          performedMigrations: [],
          failedMigrations: [],
        });

        return;
      }

      let chosenMigrationFilenames: string[] = [];

      /* istanbul ignore else  */
      if (autoRun) {
        chosenMigrationFilenames = pendingMigrations.map((pendingMigration) => pendingMigration.filename);
      } else {
        // this is very hard to test
        const choiceResult = await inquirer.prompt<MigrationPromptResult>([
          {
            type: "checkbox",
            name: "chosenMigrations",
            message: "Choose migrations to execute",
            choices: pendingMigrations.map((pendingMigration) => ({
              name: pendingMigration.name,
              value: pendingMigration.filename,
            })),
          },
        ]);
        chosenMigrationFilenames = choiceResult.chosenMigrations;
      }

      const chosenMigrations = pendingMigrations.filter(
        (pendingMigration) => chosenMigrationFilenames.indexOf(pendingMigration.filename) !== -1,
      );

      const taskRunner = new Listr<Context>(
        chosenMigrations.map((migration) => ({
          title: migration.name,
          async task() {
            try {
              await migration.run();

              this.title = `${this.title} - done in ${migration.timeTaken ?? "??"}ms`;
            } catch (e) {
              this.title = `${this.title} - failed in ${migration.timeTaken ?? "??"}ms`;

              throw e;
            }
          },
        })),
      );

      try {
        await taskRunner.run();
      } catch (_e) {
        // ignore error, states get updated
      }

      resolve({
        pendingMigrations,
        chosenMigrations,
        performedMigrations: chosenMigrations.filter((migration) => migration.status === MigrationStatus.COMPLETE),
        failedMigrations: chosenMigrations.filter((migration) => migration.status === MigrationStatus.FAILED),
      });
    });
  }

  public async close() {
    await this.options.storage.close();
  }
}
