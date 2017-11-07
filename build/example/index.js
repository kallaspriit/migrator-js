"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
const path = require("path");
const index_1 = require("../index");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        // you can use MySQL / MariaDB / Postgres / SQLite / Microsoft SQL Server / Oracle / WebSQL
        // see http://typeorm.io
        const connectionOptions = {
            type: 'sqlite',
            database: path.join(__dirname, '..', '..', 'migrate.sqlite3'),
        };
        const connection = yield index_1.createConnection(connectionOptions);
        // show an empty line between previous content
        console.log('');
        // notify of the location of the test database
        console.log(`Using ${connectionOptions.type} database at ${chalk_1.default.reset.bold(connectionOptions.database)}`);
        // attempt to run the migrator
        try {
            // run migrator providing pattern of migration files, storage to use and context to pass to each migration
            const result = yield index_1.migrate({
                pattern: path.join(__dirname, 'migrations', '!(*.spec|*.test|*.d).{ts,js}'),
                storage: new index_1.MigratorTypeormStorage(connectionOptions),
                context: {
                    connection,
                },
            });
            // extract results
            const { pendingMigrations, chosenMigrations, performedMigrations, failedMigrations } = result;
            // print results to console
            if (pendingMigrations.length === 0) {
                console.error(`${chalk_1.default.black.bgWhite(` NOTHING TO MIGRATE `)} `);
            }
            else if (chosenMigrations.length === 0) {
                console.error(`${chalk_1.default.black.bgWhite(` NO MIGRATIONS CHOSEN `)} `);
            }
            else if (performedMigrations.length > 0 && failedMigrations.length === 0) {
                console.error(`${chalk_1.default.black.bgGreen(` ALL MIGRATIONS SUCCEEDED `)} - ${performedMigrations.length} total`);
            }
            else if (performedMigrations.length === 0 && failedMigrations.length > 0) {
                console.error(`${chalk_1.default.black.bgRed(` ALL MIGRATIONS FAILED `)} - ${failedMigrations.length} total`);
            }
            else {
                console.error(`${chalk_1.default.black.bgYellow(` SOME MIGRATIONS FAILED `)} - ${performedMigrations.length} succeeded, ${failedMigrations.length} failed`);
            }
            // exit with a non-zero code if any of the migrations failed
            if (failedMigrations.length === 0) {
                process.exit(0);
            }
            else {
                process.exit(1);
            }
        }
        catch (e) {
            console.error(`${chalk_1.default.black.bgRed(` RUNNING MIGRATOR FAILED `)}`, e.stack);
        }
        finally {
            yield connection.close();
        }
    });
}
run().catch(e => console.error(chalk_1.default.black.bgRed(` RUNNING MIGRATOR FAILED `), e.stack));
//# sourceMappingURL=index.js.map