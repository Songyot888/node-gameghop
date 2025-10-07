"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const promise_1 = require("mysql2/promise");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.pool = (0, promise_1.createPool)({
    connectionLimit: 10,
    host: process.env.DB_HOST || "ns1.server-82-26-104-71.da.direct",
    user: process.env.DB_USER || "activi89_mb68_66011212090",
    password: process.env.DB_PASSWORD || "KSsZwmmm8CCkVjpGaTUp",
    database: process.env.DB_NAME || "activi89_mb68_66011212090",
    port: Number(process.env.DB_PORT) || 3306,
});
exports.pool.getConnection()
    .then(connection => {
    console.log("✅ Database connected successfully");
    connection.release();
})
    .catch(err => {
    console.error("❌ Database connection failed:", err.message);
});
//# sourceMappingURL=dbconn.js.map