import multer, { diskStorage } from "multer";

// NOTE: ep.10 29:27 how to save? and why diskStorage?
// NOTE: ep.10 31:27 why we use multer?
const storage = multer.diskStorage({
  // NOTE: file - this file is at multer only. In file you have all files., req - in body you get all json data, not file that's why we use multer or express file upload. Here we used multer.
  destination: function (req, file, cb) {
    cb(null, "./public/temp"); // cb - call back
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
    // NOTE: Ideally don't use .originalname reason ep.10 33:36
  },
});

export const upload = multer({
  storage,
});
