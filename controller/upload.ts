// src/routes/upload.route.ts - Cloudinary (ไม่เก็บ DB)
import express, { Request, Response } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

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
    folder: "user_avatars",
    allowed_formats: ["jpg", "jpeg", "png", "gif"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
    public_id: (req: any, file: any) => {
      return `avatar_${Date.now()}`;
    },
  } as any,
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
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

// ===== POST: อัปโหลดรูปภาพ (ไม่บันทึก DB) =====
router.post("/", upload.single("file"), async (req: Request, res: Response) => {
  try {
    console.log("📤 เริ่มอัปโหลดไฟล์...");

    if (!req.file) {
      console.error("❌ ไม่พบไฟล์");
      return res.status(400).json({ error: "ไม่พบไฟล์ที่อัปโหลด" });
    }

    const imageUrl = (req.file as any).path;
    const publicId = (req.file as any).filename;

    console.log("✅ อัปโหลดไป Cloudinary สำเร็จ:", imageUrl);
    console.log("📝 Public ID:", publicId);

    // ส่ง URL กลับไปให้ Frontend เก็บเอง
    res.json({
      success: true,
      filename: publicId,
      url: imageUrl,
      message: "อัปโหลดสำเร็จ",
    });
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาด:", error);
    res.status(500).json({
      error: "อัปโหลดไม่สำเร็จ",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// ===== DELETE: ลบรูปภาพจาก Cloudinary =====
router.delete("/:publicId", async (req: Request, res: Response) => {
  try {
    const { publicId } = req.params;
    
    console.log("🗑️ กำลังลบไฟล์:", publicId);

    const result = await cloudinary.uploader.destroy(`user_avatars/${publicId}`);

    if (result.result === "ok") {
      console.log("✅ ลบไฟล์สำเร็จ");
      res.json({ success: true, message: "ลบรูปภาพสำเร็จ" });
    } else {
      console.error("❌ ลบไฟล์ไม่สำเร็จ:", result);
      res.status(404).json({ error: "ไม่พบไฟล์" });
    }
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาด:", error);
    res.status(500).json({
      error: "ลบไฟล์ไม่สำเร็จ",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// ===== GET: ทดสอบ API =====
router.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Cloudinary Upload API ready",
    storage: "Cloudinary (ฟรี 25GB) - ไม่เก็บ Database",
    endpoints: {
      POST: "/upload - อัปโหลดรูปภาพ",
      DELETE: "/upload/:publicId - ลบรูปภาพ",
    },
  });
});