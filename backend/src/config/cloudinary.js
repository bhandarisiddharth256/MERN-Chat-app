import dotenv from "dotenv";
dotenv.config();
import cloudinary from "cloudinary";
console.log("Cloudinary:", {
  name: process.env.CLOUDINARY_NAME,
  key: process.env.CLOUDINARY_KEY,
  secret: !!process.env.CLOUDINARY_SECRET,
});
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export default cloudinary.v2;
