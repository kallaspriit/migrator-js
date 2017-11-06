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
const glob = require("glob");
const inquirer = require("inquirer");
const Listr = require("listr");
const path = require("path");
const naturalSort = require("string-natural-compare");
const common_1 = require("./common");
var typeorm_1 = require("./storage/typeorm");
exports.MigratorTypeormStorage = typeorm_1.default;
class Migration {
    constructor(name, filename, context, storage) {
        this.name = name;
        this.filename = filename;
        this.context = context;
        this.storage = storage;
        this.timeTaken = 0;
        this.status = common_1.MigrationStatus.PENDING;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const migration = require(this.filename).default;
                let startTime = Date.now();
                yield this.storage.insertMigration(this.name);
                try {
                    startTime = Date.now();
                    this.result = yield migration(this.context);
                    this.timeTaken = Date.now() - startTime;
                    this.status = common_1.MigrationStatus.COMPLETE;
                    yield this.storage.updateMigration(this.name, this.status, this.result, this.timeTaken);
                    resolve(this.result);
                }
                catch (e) {
                    this.result = e.message;
                    this.timeTaken = Date.now() - startTime;
                    this.status = common_1.MigrationStatus.FAILED;
                    yield this.storage.updateMigration(this.name, this.status, e.stack, this.timeTaken);
                    reject(e);
                }
            }));
        });
    }
}
exports.Migration = Migration;
// tslint:disable-next-line:max-classes-per-file
class Migrator {
    constructor(options) {
        this.options = options;
    }
    getMigrationFilenames() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                glob(this.options.pattern, (error, filenames) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(filenames.sort(naturalSort));
                });
            });
        });
    }
    getPerformedMigrations() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.options.storage.getPerformedMigrations();
        });
    }
    getPendingMigrations() {
        return __awaiter(this, void 0, void 0, function* () {
            const migrationFilenames = yield this.getMigrationFilenames();
            const performedMigrations = yield this.getPerformedMigrations();
            return migrationFilenames
                .filter(migrationFilename => performedMigrations.find(performedMigration => performedMigration.name === this.getMigrationName(migrationFilename)) === undefined)
                .map(migrationFilename => new Migration(this.getMigrationName(migrationFilename), migrationFilename, this.options.context, this.options.storage));
        });
    }
    getMigrationName(migrationFilename) {
        return path.basename(migrationFilename, '.js');
    }
}
exports.default = Migrator;
function migrate(options) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, _reject) => __awaiter(this, void 0, void 0, function* () {
            const migrator = new Migrator(options);
            const pendingMigrations = yield migrator.getPendingMigrations();
            if (pendingMigrations.length === 0) {
                resolve({
                    pendingMigrations,
                    chosenMigrations: [],
                    performedMigrations: [],
                    failedMigrations: [],
                });
                return;
            }
            const choiceResult = yield inquirer.prompt([
                {
                    type: 'checkbox',
                    name: 'chosenMigrations',
                    message: 'Choose migrations to execute',
                    choices: pendingMigrations.map(pendingMigration => ({
                        name: pendingMigration.name,
                        value: pendingMigration.filename,
                    })),
                },
            ]);
            const chosenMigrationFilenames = choiceResult.chosenMigrations;
            const chosenMigrations = pendingMigrations.filter(pendingMigration => chosenMigrationFilenames.indexOf(pendingMigration.filename) !== -1);
            const taskRunner = new Listr(chosenMigrations.map(migration => ({
                title: migration.name,
                task() {
                    return __awaiter(this, void 0, void 0, function* () {
                        try {
                            yield migration.run();
                            this.title = `${this.title} - done in ${migration.timeTaken}ms`;
                        }
                        catch (e) {
                            this.title = `${this.title} - failed in ${migration.timeTaken}ms`;
                            throw e;
                        }
                    });
                },
            })));
            try {
                yield taskRunner.run();
            }
            catch (_e) {
                // ignore error, states get updated
            }
            resolve({
                pendingMigrations,
                chosenMigrations,
                performedMigrations: chosenMigrations.filter(migration => migration.status === common_1.MigrationStatus.COMPLETE),
                failedMigrations: chosenMigrations.filter(migration => migration.status === common_1.MigrationStatus.FAILED),
            });
        }));
    });
}
exports.migrate = migrate;
//# sourceMappingURL=index.js.map