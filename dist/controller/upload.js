"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
// src/routes/upload.route.ts - Cloudinary (ฟรี 25GB)
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const dbconn_1 = require("../dbconn");
exports.router = express_1.default.Router();
// ===== Config Cloudinary =====
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "your_cloud_name",
    api_key: process.env.CLOUDINARY_API_KEY || "your_api_key",
    api_secret: process.env.CLOUDINARY_API_SECRET || "your_api_secret",
});
// ===== Multer Storage with Cloudinary =====
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
    params: {
        folder: "user_avatars", // โฟลเดอร์ใน Cloudinary
        allowed_formats: ["jpg", "jpeg", "png", "gif"],
        transformation: [{ width: 500, height: 500, crop: "limit" }], // resize อัตโนมัติ
        public_id: (req, file) => {
            // ตั้งชื่อไฟล์ unique
            return `avatar_${Date.now()}`;
        },
    },
});
const upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // จำกัด 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype) {
            cb(null, true);
        }
        else {
            cb(new Error("อนุญาตเฉพาะไฟล์รูปภาพ"));
        }
    },
});
// ===== POST: อัปโหลดรูปภาพ =====
exports.router.post("/", upload.single("file"), async (req, res) => {
    try {
        console.log("📤 เริ่มอัปโหลดไฟล์...");
        if (!req.file) {
            console.error("❌ ไม่พบไฟล์");
            return res.status(400).json({ error: "ไม่พบไฟล์ที่อัปโหลด" });
        }
        // Cloudinary จะ return URL มาอัตโนมัติ
        const imageUrl = req.file.path;
        const publicId = req.file.filename;
        console.log("✅ อัปโหลดไป Cloudinary สำเร็จ:", imageUrl);
        console.log("📝 Public ID:", publicId);
        const query = `
      INSERT INTO user_avatar (id, img) 
      VALUES (1, ?) 
      ON DUPLICATE KEY UPDATE 
        img = VALUES(img), 
        updated_at = CURRENT_TIMESTAMP
    `;
        console.log("💾 กำลังบันทึกลง Database...");
        await dbconn_1.pool.execute(query, [imageUrl]);
        console.log("✅ บันทึกลง Database สำเร็จ");
        res.json({
            success: true,
            filename: publicId,
            url: imageUrl,
            message: "อัปโหลดสำเร็จ",
        });
    }
    catch (error) {
        console.error("❌ เกิดข้อผิดพลาด:", error);
        console.error("Error Details:", error instanceof Error ? error.stack : error);
        res.status(500).json({
            error: "อัปโหลดไม่สำเร็จ",
            message: error instanceof Error ? error.message : "Unknown error",
            details: error instanceof Error ? error.stack : String(error),
        });
    }
});
// ===== GET: ทดสอบ API =====
exports.router.get("/", (req, res) => {
    res.json({
        message: "Cloudinary Upload API ready",
        storage: "Cloudinary (ฟรี 25GB)",
        endpoints: {
            POST: "/upload - อัปโหลดรูปภาพ",
            GET: "/upload/current - ดึงรูปภาพล่าสุด",
            DELETE: "/upload - ลบรูปภาพ",
        },
    });
});
//# sourceMappingURL=upload.js.map