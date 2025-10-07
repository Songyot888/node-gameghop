// src/routes/upload.route.ts - Cloudinary (ฟรี 25GB)
import express, { Request, Response } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { pool } from "../dbconn";

export const router = express.Router();

// ===== Config Cloudinary =====
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "your_cloud_name",
  api_key: process.env.CLOUDINARY_API_KEY || "your_api_key",
  api_secret: process.env.CLOUDINARY_API_SECRET || "your_api_secret",
});

// ===== Multer Storage with Cloudinary =====
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "user_avatars", // โฟลเดอร์ใน Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "gif"],
    transformation: [{ width: 500, height: 500, crop: "limit" }], // resize อัตโนมัติ
    public_id: (req: any, file: any) => {
      // ตั้งชื่อไฟล์ unique
      return `avatar_${Date.now()}`;
    },
  } as any,
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // จำกัด 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype) {
      cb(null, true);
    } else {
      cb(new Error("อนุญาตเฉพาะไฟล์รูปภาพ"));
    }
  },
});

// ===== POST: อัปโหลดรูปภาพ =====
router.post("/", upload.single("file"), async (req: Request, res: Response) => {
  try {
    console.log("📤 เริ่มอัปโหลดไฟล์...");

    if (!req.file) {
      console.error("❌ ไม่พบไฟล์");
      return res.status(400).json({ error: "ไม่พบไฟล์ที่อัปโหลด" });
    }

    // Cloudinary จะ return URL มาอัตโนมัติ
    const imageUrl = (req.file as any).path;
    const publicId = (req.file as any).filename;

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
    await pool.execute(query, [imageUrl]);
    console.log("✅ บันทึกลง Database สำเร็จ");

    res.json({
      success: true,
      filename: publicId,
      url: imageUrl,
      message: "อัปโหลดสำเร็จ",
    });
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาด:", error);
    console.error(
      "Error Details:",
      error instanceof Error ? error.stack : error
    );
    res.status(500).json({
      error: "อัปโหลดไม่สำเร็จ",
      message: error instanceof Error ? error.message : "Unknown error",
      details: error instanceof Error ? error.stack : String(error),
    });
  }
});

// ===== GET: ทดสอบ API =====
router.get("/", (req: Request, res: Response) => {
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
