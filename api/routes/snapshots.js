const express = require('express');
const router = express.Router();

router.get('/', (req,res,next)=>{
  res.status(200).json({
    message: 'at slash snapshops'
  })
})

router.get('/:bestopid', (req,res,next)=>{
  const busrouteNo = req.params.bestopid
    res.status(200).json({
      message: 'stopid'
    })
})

router.get('/:bestopid/:dayofweek', (req,res,next)=>{
  const {bestopid, dayofweek} = req.params

    res.status(200).json({
      message: direction
    })


})




module.exports = router;