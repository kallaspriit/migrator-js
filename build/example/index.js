"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const src_1 = require("../src");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        // show an empty line between previous content
        console.log("");
        // create migrator
        const migrator = new src_1.Migrator(
        // this is the custom context matching MigrationContext
        {
            version: "1",
        }, 
        // migrator configuration
        {
            // pattern for finding the migration scripts
            pattern: path_1.default.join(__dirname, "migrations", "!(*.spec|*.test|*.d).{ts,js}"),
            // you can use MySQL / MariaDB / Postgres / SQLite / Microsoft SQL Server / Oracle / WebSQL
            // see http://typeorm.io
            storage: new src_1.MigratorTypeormStorage({
                type: "sqlite",
                database: path_1.default.join(__dirname, "..", "..", "migrate.sqlite3"),
            }),
        });
        // attempt to run the migrator
        try {
            // run migrator providing pattern of migration files, storage to use and context to pass to each migration
            // run the migrations and extract results
            const { pendingMigrations, chosenMigrations, performedMigrations, failedMigrations } = yield migrator.migrate();
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
            console.error(`${chalk_1.default.black.bgRed(` RUNNING MIGRATOR FAILED `)}`, e);
        }
        finally {
            // gracefully close the connection
            yield migrator.close();
        }
    });
}
run().catch((e) => console.error(chalk_1.default.black.bgRed(` RUNNING MIGRATOR FAILED `), e.stack));
//# sourceMappingURL=index.js.map