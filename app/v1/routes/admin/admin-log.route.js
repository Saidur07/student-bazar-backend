const express = require('express')
const router = express()
const AdminLogModel = require('../../models/admin-log.model')
const {PERMS} = require('../../constant')

const HasPerm = (req, res, next) => {
    try{
      /// check if same element exist in 2 arrays
      const hasPerm = req?.admin.Permissions?.some((item) => PERMS.ADMIN_MANAGE_PERMISSIONS.includes(item)); 
      if (hasPerm) {
        console.log("HasPerm");
        next();
      } else 
  
        res.status(403).json({
          success: false,
          message: "Access Denied",
        });
    }catch(e){
      res.status(400).json({
        success: false,
        message: e.message,
      });
    }
  };


/**
 * @swagger
 * /api/v1/admin/admin-log/:
 *  get:
 *    tags: [admin-log]
 *    description: get admin log
 *    parameters:
 *      - in: formData
 *        name: limit
 *      - in: formData
 *        name: page
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.get('/',HasPerm,(req,res)=>{
    try{
        const {limit=20, page=1} = req.query
        const offset = (page - 1) * limit
        AdminLogModel.find({}).skip(offset).limit(limit).exec((err,logs)=>{
            if(err){
                res.status(400).json({status:400, message:err.message})
                return
            }
            res.status(200).json({status:200, logs})
        })
    }catch(e){
        res.status(400).json({status:400, message:e.message})
    }
})

module.exports = router;