"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var del = require("del");
var path = require("path");
var src_1 = require("../src");
var migratorCount = 0;
var context = {
    version: "1",
};
function getConnectionOptions() {
    return {
        type: "sqlite",
        name: "migrator-test-" + ++migratorCount,
        database: path.join(__dirname, "..", "migrate-" + Date.now() + "-" + migratorCount + ".sqlite3"),
    };
}
function getMigratorOptions() {
    return {
        pattern: path.join(__dirname, "migrations", "!(*.spec|*.test|*.d).{ts,js}"),
        storage: new src_1.MigratorTypeormStorage(getConnectionOptions()),
        autorunAll: false,
    };
}
function setupMigrator() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new src_1.Migrator(context, getMigratorOptions())];
        });
    });
}
function preprocessSnapshot(migration) {
    return {
        name: migration.name,
        status: migration.status,
        result: migration.result,
    };
}
describe("migrator-js", function () {
    // delete generated sqlite databases
    afterEach(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, del([path.join(__dirname, "..", "*.sqlite3")])];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("should provide list of pending migrations", function () { return __awaiter(_this, void 0, void 0, function () {
        var migrator, pendingMigrations;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, setupMigrator()];
                case 1:
                    migrator = _a.sent();
                    return [4 /*yield*/, migrator.getPendingMigrations()];
                case 2:
                    pendingMigrations = _a.sent();
                    expect(preprocessSnapshot(pendingMigrations[0].toJSON())).toMatchSnapshot();
                    expect(pendingMigrations.map(preprocessSnapshot)).toMatchSnapshot();
                    return [2 /*return*/];
            }
        });
    }); });
    it("should run a single migration", function () { return __awaiter(_this, void 0, void 0, function () {
        var migrator, pendingMigrations1, result, pendingMigrations2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, setupMigrator()];
                case 1:
                    migrator = _a.sent();
                    return [4 /*yield*/, migrator.getPendingMigrations()];
                case 2:
                    pendingMigrations1 = _a.sent();
                    expect(pendingMigrations1).toHaveLength(2);
                    expect(pendingMigrations1.map(preprocessSnapshot)).toMatchSnapshot();
                    return [4 /*yield*/, pendingMigrations1[0].run()];
                case 3:
                    result = _a.sent();
                    expect(result).toMatchSnapshot();
                    return [4 /*yield*/, migrator.getPendingMigrations()];
                case 4:
                    pendingMigrations2 = _a.sent();
                    expect(pendingMigrations2).toHaveLength(1);
                    expect(pendingMigrations2.map(preprocessSnapshot)).toMatchSnapshot();
                    return [2 /*return*/];
            }
        });
    }); });
    it("should handle failing migration", function () { return __awaiter(_this, void 0, void 0, function () {
        var migrator, pendingMigrations1, pendingMigrations2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, setupMigrator()];
                case 1:
                    migrator = _a.sent();
                    return [4 /*yield*/, migrator.getPendingMigrations()];
                case 2:
                    pendingMigrations1 = _a.sent();
                    expect(pendingMigrations1).toHaveLength(2);
                    expect(pendingMigrations1.map(preprocessSnapshot)).toMatchSnapshot();
                    return [4 /*yield*/, expect(pendingMigrations1[1].run()).rejects.toHaveProperty("message", "Example failure message")];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, migrator.getPendingMigrations()];
                case 4:
                    pendingMigrations2 = _a.sent();
                    expect(pendingMigrations2).toHaveLength(2);
                    expect(pendingMigrations2.map(preprocessSnapshot)).toMatchSnapshot();
                    return [2 /*return*/];
            }
        });
    }); });
    it("provides interactive migrator", function () { return __awaiter(_this, void 0, void 0, function () {
        var results;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, src_1.default(context, __assign({}, getMigratorOptions(), { autorunAll: true }))];
                case 1:
                    results = _a.sent();
                    expect({
                        pendingMigrations: results.pendingMigrations.map(preprocessSnapshot),
                        chosenMigrations: results.chosenMigrations.map(preprocessSnapshot),
                        performedMigrations: results.performedMigrations.map(preprocessSnapshot),
                        failedMigrations: results.failedMigrations.map(preprocessSnapshot),
                    }).toMatchSnapshot();
                    return [2 /*return*/];
            }
        });
    }); });
    it("handles empty list of pending migrations", function () { return __awaiter(_this, void 0, void 0, function () {
        var results;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, src_1.default(context, __assign({}, getMigratorOptions(), { autorunAll: true, pattern: "xxx" }))];
                case 1:
                    results = _a.sent();
                    expect({
                        pendingMigrations: results.pendingMigrations.map(preprocessSnapshot),
                        chosenMigrations: results.chosenMigrations.map(preprocessSnapshot),
                        performedMigrations: results.performedMigrations.map(preprocessSnapshot),
                        failedMigrations: results.failedMigrations.map(preprocessSnapshot),
                    }).toMatchSnapshot();
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=index.test.js.map