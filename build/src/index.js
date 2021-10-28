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
exports.Migrator = exports.Migration = exports.MigrationStatus = exports.createConnection = exports.Connection = exports.MigratorTypeormStorage = void 0;
const path_1 = __importDefault(require("path"));
const glob_1 = __importDefault(require("glob"));
const inquirer_1 = __importDefault(require("inquirer"));
const listr_1 = __importDefault(require("listr"));
const string_natural_compare_1 = __importDefault(require("string-natural-compare"));
const common_1 = require("./common");
const typeorm_1 = __importDefault(require("./storage/typeorm"));
var typeorm_2 = require("./storage/typeorm");
Object.defineProperty(exports, "MigratorTypeormStorage", { enumerable: true, get: function () { return __importDefault(typeorm_2).default; } });
var typeorm_3 = require("typeorm");
Object.defineProperty(exports, "Connection", { enumerable: true, get: function () { return typeorm_3.Connection; } });
Object.defineProperty(exports, "createConnection", { enumerable: true, get: function () { return typeorm_3.createConnection; } });
var common_2 = require("./common");
Object.defineProperty(exports, "MigrationStatus", { enumerable: true, get: function () { return common_2.MigrationStatus; } });
class Migration {
    constructor(name, filename, context, storage) {
        this.name = name;
        this.filename = filename;
        this.context = context;
        this.storage = storage;
        this.status = common_1.MigrationStatus.PENDING;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            // eslint-disable-next-line no-async-promise-executor
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const migration = require(this.filename).default;
                yield this.storage.insertMigration(this.name, this.filename);
                this.startDate = new Date();
                try {
                    this.result = yield migration(this.context);
                    this.endDate = new Date();
                    this.timeTaken = this.endDate.getTime() - this.startDate.getTime();
                    this.status = common_1.MigrationStatus.COMPLETE;
                    yield this.storage.updateMigration(this.name, this.status, this.result, this.timeTaken);
                    resolve(this.result);
                }
                catch (e) {
                    const error = e;
                    this.result = error.message;
                    this.endDate = new Date();
                    this.timeTaken = this.endDate.getTime() - this.startDate.getTime();
                    this.status = common_1.MigrationStatus.FAILED;
                    yield this.storage.updateMigration(this.name, this.status, (_a = error.stack) !== null && _a !== void 0 ? _a : "", this.timeTaken);
                    reject(e);
                }
            }));
        });
    }
    toJSON() {
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
exports.Migration = Migration;
class Migrator {
    constructor(context, userOptions) {
        this.context = context;
        const connectionOptions = {
            type: "sqlite",
            name: `migrator`,
            database: `migrator.sqlite3`,
        };
        this.options = Object.assign({ pattern: path_1.default.join(__dirname, "..", "..", "src", "migrations", "!(*.spec|*.test|*.d).{ts,js}"), storage: new typeorm_1.default(connectionOptions) }, userOptions);
    }
    static getMigrationName(migrationFilename) {
        return path_1.default.basename(migrationFilename, ".js");
    }
    getMigrationFilenames() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                (0, glob_1.default)(this.options.pattern, (error, filenames) => {
                    /* istanbul ignore if */
                    if (error !== null) {
                        reject(error);
                        return;
                    }
                    resolve(filenames.sort(string_natural_compare_1.default));
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
                .filter((migrationFilename) => performedMigrations.find((performedMigration) => performedMigration.name === Migrator.getMigrationName(migrationFilename)) === undefined)
                .map((migrationFilename) => new Migration(Migrator.getMigrationName(migrationFilename), migrationFilename, this.context, this.options.storage));
        });
    }
    migrate(autoRun = false) {
        return __awaiter(this, void 0, void 0, function* () {
            // eslint-disable-next-line no-async-promise-executor, promise/param-names
            return new Promise((resolve, _reject) => __awaiter(this, void 0, void 0, function* () {
                const pendingMigrations = yield this.getPendingMigrations();
                if (pendingMigrations.length === 0) {
                    resolve({
                        pendingMigrations,
                        chosenMigrations: [],
                        performedMigrations: [],
                        failedMigrations: [],
                    });
                    return;
                }
                let chosenMigrationFilenames = [];
                /* istanbul ignore else  */
                if (autoRun) {
                    chosenMigrationFilenames = pendingMigrations.map((pendingMigration) => pendingMigration.filename);
                }
                else {
                    // this is very hard to test
                    const choiceResult = yield inquirer_1.default.prompt([
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
                const chosenMigrations = pendingMigrations.filter((pendingMigration) => chosenMigrationFilenames.indexOf(pendingMigration.filename) !== -1);
                const taskRunner = new listr_1.default(chosenMigrations.map((migration) => ({
                    title: migration.name,
                    task() {
                        var _a, _b;
                        return __awaiter(this, void 0, void 0, function* () {
                            try {
                                yield migration.run();
                                this.title = `${this.title} - done in ${(_a = migration.timeTaken) !== null && _a !== void 0 ? _a : "??"}ms`;
                            }
                            catch (e) {
                                this.title = `${this.title} - failed in ${(_b = migration.timeTaken) !== null && _b !== void 0 ? _b : "??"}ms`;
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
                    performedMigrations: chosenMigrations.filter((migration) => migration.status === common_1.MigrationStatus.COMPLETE),
                    failedMigrations: chosenMigrations.filter((migration) => migration.status === common_1.MigrationStatus.FAILED),
                });
            }));
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.options.storage.close();
        });
    }
}
exports.Migrator = Migrator;
//# sourceMappingURL=index.js.map