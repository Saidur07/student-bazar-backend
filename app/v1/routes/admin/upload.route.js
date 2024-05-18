const express = require("express");
const router = express();
const UploadToStorage = require("../../utility/file-upload");
const { upload } = require("../../middlewares/multer");
const fs = require('fs')

/**
 * @swagger
 * /api/v1/admin/upload/single:
 *  post:
 *    tags: [admin-upload]
 *    description: upload file
 *    parameters:
 *    - in: formData
 *      name: file
 *      type: file
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 *
 */
router.post("/single", upload.single("file"), async (req, res) => {
  try {
    const { path } = req.file;
    const uploadedFile = await UploadToStorage(path);

    fs.unlinkSync(req.file?.path);
    res.status(200).json({ status: 200, data: uploadedFile[0].metadata });
  } catch (e) {
    fs.unlinkSync(req.file?.path);
    res.status(400).json({ status: 400, message: e.message });
  }
});

module.exports = router;
