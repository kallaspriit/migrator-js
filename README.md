# Simple extensible node migrator library.

[![Travis](https://img.shields.io/travis/kallaspriit/migrator-js.svg)](https://travis-ci.org/kallaspriit/migrator-js)
[![Coverage](https://img.shields.io/coveralls/kallaspriit/migrator-js.svg)](https://coveralls.io/github/kallaspriit/migrator-js)
[![Downloads](https://img.shields.io/npm/dm/migrator-js.svg)](http://npm-stat.com/charts.html?package=migrator-js&from=2015-08-01)
[![Version](https://img.shields.io/npm/v/migrator-js.svg)](http://npm.im/migrator-js)
[![License](https://img.shields.io/npm/l/migrator-js.svg)](http://opensource.org/licenses/MIT)

**Simple extensible one-way migration tool for performing various tasks in order in multiple environments.**

![Example](https://raw.githubusercontent.com/kallaspriit/migrator-js/master/example/example.gif)

- Can be used for running any kind of tasks that need to be executed on multiple environments.
- Works great for migrating database schemas and data but also for changing image file formats etc.
- The storage method is extensive so the information about which migrations have been carried out can be stored anywhere (database, simple file etc).
- Has built-in [TypeORM](http://typeorm.io) storage that can use MySQL / MariaDB / Postgres / SQLite / Microsoft SQL Server / Oracle / WebSQL.
- Each migration is a simple async function receiving a custom context and returning anything serializable for success or throwing error on failure.
- Written in [TypeScript](https://www.typescriptlang.org/).
- Includes [100% test coverage](https://coveralls.io/github/kallaspriit/migrator-js).

## Installation

This package is distributed via npm

```cmd
npm install migrator-js
```

## Commands

- `yarn start` to start the example application.
- `yarn build` to build the production version.
- `yarn test` to run tests.
- `yarn coverage` to gather code coverage.
- `yarn lint` to lint the codebase.
- `yarn prettier` to run prettier.
- `yarn audit` to run all pre-commit checks (prettier, build, lint, test)

**Example migration script**

```javascript
import {IMigrationContext} from '../';

export default async (context: IMigrationContext): Promise<string> => {
  // run any query, crop images etc
  const sum = await context.connection.query('SELECT 1+1 AS sum');

  return `1+1=${sum}`;
};
```

**Example script that runs chosen migrations**
Store it in `src/scripts/migrate.ts` etc and add NPM script to run it.

`package.json`

```json
{
  "scripts": {
    "migrate": "yarn build && node build/example"
  }
}
```

`src/scripts/migrate.ts`

```javascript
import chalk from "chalk";
import * as path from "path";
import { Migrator, MigratorTypeormStorage } from "../src";

// the contents of this file is usually kept in scripts/migrate.ts etc file and run through NPM scripts

// any context resources passed on to all migrations
export interface MigrationContext {
  version: string;
}

async function run() {
  // show an empty line between previous content
  console.log("");

  // create migrator
  const migrator = new Migrator<MigrationContext>(
    // this is the custom context matching MigrationContext
    {
      version: "1",
    },
    // migrator configuration
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

  // attempt to run the migrator
  try {
    // run migrator providing pattern of migration files, storage to use and context to pass to each migration

    // run the migrations and extract results
    const { pendingMigrations, chosenMigrations, performedMigrations, failedMigrations } = await migrator.migrate();

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
  } finally {
    // gracefully close the connection
    await migrator.close();
  }
}

run().catch(e => console.error(chalk.black.bgRed(` RUNNING MIGRATOR FAILED `), e.stack));
```