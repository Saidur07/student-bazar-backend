const express = require("express");
const router = express();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AdminAuthModal = require("../../models/admin-auth.model");
const AdminAuthJwtModal = require("../../models/admin-auth-jwt.model");
const { upload } = require("../../middlewares/multer");
const RequiresAdmin = require("../../middlewares/requires-admin");
const fs = require("fs");
const path = require("path");
const AdminLogModel = require("../../models/admin-log.model");
const { PERMS } = require("../../constant");

const HasPerm = (req, res, next) => {
  try {
    /// check if same element exist in 2 arrays
    const hasPerm = req?.admin.Permissions?.some((item) => PERMS.ADMIN_MANAGE_PERMISSIONS.includes(item));
    if (hasPerm) {
      console.log("HasPerm");
      next();
    } else

      res.status(400).json({
        success: false,
        message: "Access Denied",
      });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: e.message,
    });
  }
};

/**
 * @swagger
 * /api/v1/admin/auth/users:
 *  get:
 *    tags: [admin-auth]
 *    description:  get roles
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 *
 */

router.get("/users", HasPerm, async (req, res) => {
  try {
    const data = await AdminAuthModal.find(req.query);
    const mapped_data = data.map((item) => {
      return {
        AdminID: item?.AdminID,
        FullName: item?.FullName,
        username: item?.username,
        Disabled: item?.Disabled,
        Permissions: item?.Permissions,
      };
    });
    res.status(200).json({ status: 200, admins: mapped_data });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});

/**
 * @swagger
 * /api/v1/admin/auth/new_user:
 *  post:
 *    tags: [admin-auth]
 *    description:  new_user
 *    parameters:
 *     - in: formData
 *       name: username
 *     - in: formData
 *       name: password
 *     - in: formData
 *       name: fullName
 *     - in: formData
 *       name: permissions
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 *
 */

router.post("/new_user", RequiresAdmin, HasPerm, upload.none(), async (req, res) => {
  try {
    const { username, password, permissions, fullName } = req.body;
    const admin = req.decodedToken;

    const salt = bcrypt.genSaltSync();
    const passwordHash = await bcrypt.hash(password, salt);
    // random id
    const id = Math.floor(Math.random() * 10000000);

    const data = await AdminAuthModal.create({
      AdminID: id,
      FullName: fullName,
      username: username,
      EncryptedPassword: passwordHash,
      Permissions: permissions.replace(" ", "").split(","),
    });

    const admin_action = "Create new user: " + username;
    const admin_act_desc = "";
    await AdminLogModel.create({
      username: admin.username,
      action: admin_action,
      action_desc: admin_act_desc,
    });
    res.status(200).json({ status: 200, message: "Successful", data });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});

/**
 * @swagger
 * /api/v1/admin/auth/edit_user:
 *  patch:
 *    tags: [admin-auth]
 *    description:  edit_user
 *    parameters:
 *     - in: formData
 *       name: username
 *     - in: formData
 *       name: password
 *     - in: formData
 *       name: fullname
 *     - in: formData
 *       name: permissions
 *     - in: formData
 *       name: AdminID
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 *
 */

router.patch("/edit_user", RequiresAdmin, HasPerm, upload.none(), async (req, res) => {
  try {
    const { username, password, permissions, fullName, AdminID } = req.body;
    const admin = req.decodedToken;

    const user_data = await AdminAuthModal.findOne({ AdminID: AdminID });

    const salt = bcrypt.genSaltSync();
    let passwordHash;

    if (password) {
      passwordHash = await bcrypt.hash(password, salt);
    }

    const new_data = {
      FullName: fullName ? fullName : user_data.FullName,
      username: username ? username : user_data.username,
      Permissions: permissions
        ? permissions.replace(" ", "").split(",")
        : user_data.Permissions,
      password: password ? passwordHash : user_data.password,
    };

    const updated_data = await AdminAuthModal.findOneAndUpdate(
      { AdminID: AdminID },
      new_data,
      { new: true }
    );

    const admin_action = "User Edited: " + username;
    const admin_act_desc = "";
    await AdminLogModel.create({
      username: admin.username,
      action: admin_action,
      action_desc: admin_act_desc,
    });
    res
      .status(200)
      .json({ status: 200, message: "user updated", user: updated_data });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});

router.patch(
  "/change_password",
  RequiresAdmin,
  upload.none(),
  async (req, res) => {
    try {
      const { password } = req.body;
      const admin = req.decodedToken;
      const username = admin.username;

      const salt = bcrypt.genSaltSync();
      const passwordHash = await bcrypt.hash(password, salt);

      await AdminAuthModal.findOneAndUpdate(
        { username: username },
        { EncryptedPassword: passwordHash }
      );

      const admin_action = "Change password for user: " + username;
      const admin_act_desc = "";
      await AdminLogModel.create({
        username: admin.username,
        action: admin_action,
        action_desc: admin_act_desc,
      });
      res.status(200).json({ status: 200, message: "Successful" });
    } catch (e) {
      res.status(400).json({ status: 400, message: e.message });
    }
  }
);

router.post("/logout", async (req, res) => {
  const refresh_token = req.body.token;
  const deleted = await AdminAuthJwtModal.deleteOne({ refresh_token });

  // admins action log
  // const admin_action = "Logged Out: " + username;
  // const admin_act_desc = "";
  // await AdminLogModel.create({
  //   username: admin.username,
  //   action: admin_action,
  //   action_desc: admin_act_desc,
  // });

  if (deleted) {
    res.status(200).json({ status: 200, message: "Logged out successfully" });
  }
});

module.exports = router;
