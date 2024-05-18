const express = require('express')
const router = express()
const ContestModel = require('../../models/contest.model')

/**
 * @swagger
 * /api/v1/public/contests/:
 *  get:
 *    tags: [public-contest]
 *    description: Get all contests
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */

router.get('/', async (req, res) => {
    try{
        const contests = await ContestModel.find()
        res.json(contests)
    }catch(err){
        res.status(400).json({
            message: err.message
        })
    }
})

/**
 * @swagger
 * /api/v1/public/contests/{contest_id}:
 *  get:
 *    tags: [public-contest]
 *    description: Get contest with contest id
 *    parameters:
 *      - in: path
 *        name: contest_id
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */


router.get('/:id', async (req, res) => {
    try{
        const contest = await ContestModel.findOne({ContestID:req.params.id})
        res.status(200).json({status: 200, contest})
    }catch(err){
        res.status(400).json({
            message: err.message
        })
    }
})

module.exports = router