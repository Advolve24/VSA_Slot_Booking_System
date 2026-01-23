const cloudinary = require("../config/cloudinary");

exports.uploadImage = async (filePath) => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: "vsa",
  });

  return result.secure_url;
};
