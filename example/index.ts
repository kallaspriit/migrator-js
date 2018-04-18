import chalk from "chalk";
import * as path from "path";
import migrate, { MigratorTypeormStorage } from "../src";

// the contents of this file is usually kept in scripts/migrate.ts etc file and run through NPM scripts

// any context resources passed on to all migrations
export interface IMigrationContext {
  version: string;
}

async function run() {
  // show an empty line between previous content
  console.log("");

  // attempt to run the migrator
  try {
    // run migrator providing pattern of migration files, storage to use and context to pass to each migration
    const result = await migrate<IMigrationContext>(
      {
        version: "1",
      },
      {
        // pattern for finding the migration scripts
        pattern: path.join(__dirname, "migrations", "!(*.spec|*.test|*.d).{ts,js}"),

        // you can use MySQL / MariaDB / Postgres / SQLite / Microsoft SQL Server / Oracle / WebSQL
        // see http://typeorm.io
        storage: new MigratorTypeormStorage({
          type: "sqlite",
          database: path.join(__dirname, "..", "..", "migrate.sqlite3"),
        }),
      },
    );

    // extract results
    const { pendingMigrations, chosenMigrations, performedMigrations, failedMigrations } = result;

    // print results to console
    if (pendingMigrations.length === 0) {
      console.error(`${chalk.black.bgWhite(` NOTHING TO MIGRATE `)} `);
    } else if (chosenMigrations.length === 0) {
      console.error(`${chalk.black.bgWhite(` NO MIGRATIONS CHOSEN `)} `);
    } else if (performedMigrations.length > 0 && failedMigrations.length === 0) {
      console.error(`${chalk.black.bgGreen(` ALL MIGRATIONS SUCCEEDED `)} - ${performedMigrations.length} total`);
    } else if (performedMigrations.length === 0 && failedMigrations.length > 0) {
      console.error(`${chalk.black.bgRed(` ALL MIGRATIONS FAILED `)} - ${failedMigrations.length} total`);
    } else {
      console.error(
        `${chalk.black.bgYellow(` SOME MIGRATIONS FAILED `)} - ${performedMigrations.length} succeeded, ${
          failedMigrations.length
        } failed`,
      );
    }

    // exit with a non-zero code if any of the migrations failed
    if (failedMigrations.length === 0) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (e) {
    console.error(`${chalk.black.bgRed(` RUNNING MIGRATOR FAILED `)}`, e.stack);
  }
}

run().catch(e => console.error(chalk.black.bgRed(` RUNNING MIGRATOR FAILED `), e.stack));
