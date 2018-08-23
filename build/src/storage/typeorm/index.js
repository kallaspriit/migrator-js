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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
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
var typeorm_1 = require("typeorm");
var common_1 = require("../../common");
exports.DEFAULT_DATABASE_CONNECTION_NAME = "migrator";
var Migration = /** @class */ (function () {
    function Migration() {
    }
    Migration.prototype.getInfo = function () {
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
    __decorate([
        typeorm_1.PrimaryColumn({ type: "varchar", nullable: false, length: 100 }),
        __metadata("design:type", String)
    ], Migration.prototype, "name", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", nullable: true }),
        __metadata("design:type", String)
    ], Migration.prototype, "filename", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", nullable: false, default: common_1.MigrationStatus.RUNNING }),
        __metadata("design:type", String)
    ], Migration.prototype, "status", void 0);
    __decorate([
        typeorm_1.Column({ type: "int", nullable: true }),
        __metadata("design:type", Number)
    ], Migration.prototype, "timeTaken", void 0);
    __decorate([
        typeorm_1.Column({ type: "text", nullable: true }),
        __metadata("design:type", String)
    ], Migration.prototype, "result", void 0);
    __decorate([
        typeorm_1.CreateDateColumn(),
        __metadata("design:type", Date)
    ], Migration.prototype, "startDate", void 0);
    __decorate([
        typeorm_1.UpdateDateColumn(),
        __metadata("design:type", Date)
    ], Migration.prototype, "endDate", void 0);
    Migration = __decorate([
        typeorm_1.Entity()
    ], Migration);
    return Migration;
}());
exports.Migration = Migration;
// tslint:disable-next-line:max-classes-per-file
var MigratorTypeormStorage = /** @class */ (function () {
    function MigratorTypeormStorage(connectionOptions) {
        this.connectionOptions = connectionOptions;
    }
    MigratorTypeormStorage.prototype.getPerformedMigrations = function () {
        return __awaiter(this, void 0, void 0, function () {
            var connection, migrations;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.openConnection()];
                    case 1:
                        connection = _a.sent();
                        return [4 /*yield*/, connection.getRepository(Migration).find({
                                where: {
                                    status: common_1.MigrationStatus.COMPLETE,
                                },
                            })];
                    case 2:
                        migrations = _a.sent();
                        return [2 /*return*/, migrations.map(function (migration) { return migration.getInfo(); })];
                }
            });
        });
    };
    MigratorTypeormStorage.prototype.insertMigration = function (name, filename) {
        return __awaiter(this, void 0, void 0, function () {
            var connection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.openConnection()];
                    case 1:
                        connection = _a.sent();
                        return [4 /*yield*/, connection.getRepository(Migration).save({
                                name: name,
                                filename: filename,
                                status: common_1.MigrationStatus.RUNNING,
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MigratorTypeormStorage.prototype.updateMigration = function (name, status, result, timeTaken) {
        return __awaiter(this, void 0, void 0, function () {
            var connection, migration;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.openConnection()];
                    case 1:
                        connection = _a.sent();
                        return [4 /*yield*/, connection.getRepository(Migration).findOne(name)];
                    case 2:
                        migration = _a.sent();
                        if (!migration) {
                            throw new Error("Migration called \"" + name + "\" was not found");
                        }
                        migration.status = status;
                        migration.result = result;
                        migration.timeTaken = timeTaken;
                        return [4 /*yield*/, connection.getRepository(Migration).save(migration)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MigratorTypeormStorage.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            var name, connection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        name = this.connectionOptions.name || exports.DEFAULT_DATABASE_CONNECTION_NAME;
                        connection = typeorm_1.getConnection(name);
                        if (!connection || !connection.isConnected) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, connection.close()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MigratorTypeormStorage.prototype.openConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var name, existingConnection, connection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        name = this.connectionOptions.name || exports.DEFAULT_DATABASE_CONNECTION_NAME;
                        // use existing connection if exists
                        try {
                            existingConnection = typeorm_1.getConnection(name);
                            if (existingConnection) {
                                return [2 /*return*/, existingConnection];
                            }
                        }
                        catch (e) {
                            // ignore, connection not found
                        }
                        return [4 /*yield*/, typeorm_1.createConnection(__assign({ name: name, entities: [Migration], synchronize: true }, this.connectionOptions))];
                    case 1:
                        connection = _a.sent();
                        return [2 /*return*/, connection];
                }
            });
        });
    };
    return MigratorTypeormStorage;
}());
exports.default = MigratorTypeormStorage;
//# sourceMappingURL=index.js.map