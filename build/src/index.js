"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var glob = require("glob");
var inquirer = require("inquirer");
var Listr = require("listr");
var path = require("path");
var naturalSort = require("string-natural-compare");
var common_1 = require("./common");
var typeorm_1 = require("./storage/typeorm");
var typeorm_2 = require("./storage/typeorm");
exports.MigratorTypeormStorage = typeorm_2.default;
var typeorm_3 = require("typeorm");
exports.Connection = typeorm_3.Connection;
exports.createConnection = typeorm_3.createConnection;
var common_2 = require("./common");
exports.MigrationStatus = common_2.MigrationStatus;
var Migration = /** @class */ (function () {
    function Migration(name, filename, context, storage) {
        this.name = name;
        this.filename = filename;
        this.context = context;
        this.storage = storage;
        this.status = common_1.MigrationStatus.PENDING;
    }
    Migration.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var migration, _a, e_1;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    migration = require(this.filename).default;
                                    return [4 /*yield*/, this.storage.insertMigration(this.name, this.filename)];
                                case 1:
                                    _b.sent();
                                    this.startDate = new Date();
                                    _b.label = 2;
                                case 2:
                                    _b.trys.push([2, 5, , 7]);
                                    _a = this;
                                    return [4 /*yield*/, migration(this.context)];
                                case 3:
                                    _a.result = _b.sent();
                                    this.endDate = new Date();
                                    this.timeTaken = this.endDate.getTime() - this.startDate.getTime();
                                    this.status = common_1.MigrationStatus.COMPLETE;
                                    return [4 /*yield*/, this.storage.updateMigration(this.name, this.status, this.result, this.timeTaken)];
                                case 4:
                                    _b.sent();
                                    resolve(this.result);
                                    return [3 /*break*/, 7];
                                case 5:
                                    e_1 = _b.sent();
                                    this.result = e_1.message;
                                    this.endDate = new Date();
                                    this.timeTaken = this.endDate.getTime() - this.startDate.getTime();
                                    this.status = common_1.MigrationStatus.FAILED;
                                    return [4 /*yield*/, this.storage.updateMigration(this.name, this.status, e_1.stack, this.timeTaken)];
                                case 6:
                                    _b.sent();
                                    reject(e_1);
                                    return [3 /*break*/, 7];
                                case 7: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    Migration.prototype.toJSON = function () {
        return {
            name: this.name,
            filename: this.filename,
            status: this.status,
            timeTaken: this.timeTaken,
            startDate: this.startDate,
            endDate: this.endDate,
            result: this.result,
        };
    };
    return Migration;
}());
exports.Migration = Migration;
// tslint:disable-next-line:max-classes-per-file
var Migrator = /** @class */ (function () {
    function Migrator(context, userOptions) {
        this.context = context;
        var connectionOptions = {
            type: "sqlite",
            name: "migrator",
            database: "migrator.sqlite3",
        };
        this.options = __assign({ pattern: path.join(__dirname, "..", "..", "src", "migrations", "!(*.spec|*.test|*.d).{ts,js}"), storage: new typeorm_1.default(connectionOptions), autorunAll: false }, userOptions);
    }
    Migrator.getMigrationName = function (migrationFilename) {
        return path.basename(migrationFilename, ".js");
    };
    Migrator.prototype.getMigrationFilenames = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        glob(_this.options.pattern, function (error, filenames) {
                            /* istanbul ignore if */
                            if (error !== null) {
                                reject(error);
                                return;
                            }
                            resolve(filenames.sort(naturalSort));
                        });
                    })];
            });
        });
    };
    Migrator.prototype.getPerformedMigrations = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.options.storage.getPerformedMigrations()];
            });
        });
    };
    Migrator.prototype.getPendingMigrations = function () {
        return __awaiter(this, void 0, void 0, function () {
            var migrationFilenames, performedMigrations;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getMigrationFilenames()];
                    case 1:
                        migrationFilenames = _a.sent();
                        return [4 /*yield*/, this.getPerformedMigrations()];
                    case 2:
                        performedMigrations = _a.sent();
                        return [2 /*return*/, migrationFilenames
                                .filter(function (migrationFilename) {
                                return performedMigrations.find(function (performedMigration) { return performedMigration.name === Migrator.getMigrationName(migrationFilename); }) === undefined;
                            })
                                .map(function (migrationFilename) {
                                return new Migration(Migrator.getMigrationName(migrationFilename), migrationFilename, _this.context, _this.options.storage);
                            })];
                }
            });
        });
    };
    return Migrator;
}());
exports.Migrator = Migrator;
function migrate(context, options) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, _reject) { return __awaiter(_this, void 0, void 0, function () {
                    var migrator, pendingMigrations, chosenMigrationFilenames, choiceResult, chosenMigrations, taskRunner, _e_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                migrator = new Migrator(context, options);
                                return [4 /*yield*/, migrator.getPendingMigrations()];
                            case 1:
                                pendingMigrations = _a.sent();
                                if (pendingMigrations.length === 0) {
                                    resolve({
                                        pendingMigrations: pendingMigrations,
                                        chosenMigrations: [],
                                        performedMigrations: [],
                                        failedMigrations: [],
                                    });
                                    return [2 /*return*/];
                                }
                                chosenMigrationFilenames = [];
                                if (!(options.autorunAll === true)) return [3 /*break*/, 2];
                                chosenMigrationFilenames = pendingMigrations.map(function (pendingMigration) { return pendingMigration.filename; });
                                return [3 /*break*/, 4];
                            case 2: return [4 /*yield*/, inquirer.prompt([
                                    {
                                        type: "checkbox",
                                        name: "chosenMigrations",
                                        message: "Choose migrations to execute",
                                        choices: pendingMigrations.map(function (pendingMigration) { return ({
                                            name: pendingMigration.name,
                                            value: pendingMigration.filename,
                                        }); }),
                                    },
                                ])];
                            case 3:
                                choiceResult = _a.sent();
                                chosenMigrationFilenames = choiceResult.chosenMigrations;
                                _a.label = 4;
                            case 4:
                                chosenMigrations = pendingMigrations.filter(function (pendingMigration) { return chosenMigrationFilenames.indexOf(pendingMigration.filename) !== -1; });
                                taskRunner = new Listr(chosenMigrations.map(function (migration) { return ({
                                    title: migration.name,
                                    task: function () {
                                        return __awaiter(this, void 0, void 0, function () {
                                            var e_2;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        _a.trys.push([0, 2, , 3]);
                                                        return [4 /*yield*/, migration.run()];
                                                    case 1:
                                                        _a.sent();
                                                        this.title = this.title + " - done in " + migration.timeTaken + "ms";
                                                        return [3 /*break*/, 3];
                                                    case 2:
                                                        e_2 = _a.sent();
                                                        this.title = this.title + " - failed in " + migration.timeTaken + "ms";
                                                        throw e_2;
                                                    case 3: return [2 /*return*/];
                                                }
                                            });
                                        });
                                    },
                                }); }));
                                _a.label = 5;
                            case 5:
                                _a.trys.push([5, 7, , 8]);
                                return [4 /*yield*/, taskRunner.run()];
                            case 6:
                                _a.sent();
                                return [3 /*break*/, 8];
                            case 7:
                                _e_1 = _a.sent();
                                return [3 /*break*/, 8];
                            case 8:
                                resolve({
                                    pendingMigrations: pendingMigrations,
                                    chosenMigrations: chosenMigrations,
                                    performedMigrations: chosenMigrations.filter(function (migration) { return migration.status === common_1.MigrationStatus.COMPLETE; }),
                                    failedMigrations: chosenMigrations.filter(function (migration) { return migration.status === common_1.MigrationStatus.FAILED; }),
                                });
                                return [2 /*return*/];
                        }
                    });
                }); })];
        });
    });
}
exports.default = migrate;
//# sourceMappingURL=index.js.map