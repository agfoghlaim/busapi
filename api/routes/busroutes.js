const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const BusRoute = require('../models/busroute')

router.get('/', (req,res,next)=>{
  res.status(200).json({
    message: 'at slash busroutes'
  })
})

/*
get bus routes by route number

/busroutes/route

*/
router.get('/:busrouteNo', (req,res,next)=>{
  const busrouteNo = req.params.busrouteNo
  console.log(busrouteNo)
  BusRoute.find({route:busrouteNo})
  .exec()
  .then(doc=>{
    console.log("got something", doc[0].routename, doc.length)
    res.status(200).json({doc})
  })
  .catch(err=>{
    console.log("got err from db",err)
    res.status(500).json({error:err})
  })

})

/*
get busroute by route num
/busroutes/direction/direction

*/

router.get('/:busrouteNo/:direction', (req,res,next)=>{
  const {busrouteNo, direction} = req.params
  BusRoute.find({route:busrouteNo,direction:direction})
  .exec()
  .then(doc=>{
    console.log("got route dir ", doc.length)
    res.status(200).json({doc})
  })
  .catch(err=>{
    console.log("err route dir",err)
    res.status(500).json({error:err})
  })
})

/*

/busroutes/direction/busstops

*/
router.get('/:busrouteNo/:direction/busstops', (req,res,next)=>{
  const {busrouteNo, direction} = req.params
  BusRoute.findOne({route:busrouteNo,direction:direction})
  .exec()
  .then(doc=>{
    console.log("bs route")
    res.status(200).json({busstops:doc.stops})
  })
  .catch(err=>{
    console.log("err route dir",err)
    res.status(500).json({error:err})
  })
})

/*

/busroutes/direction/:stopid

*/
router.get('/:busrouteNo/:direction/:bestopid', (req,res,next)=>{
  const {busrouteNo, direction, bestopid} = req.params
  console.log(bestopid)
  // BusRoute.find({route:busrouteNo,direction:direction,'stops.bestopid': {$eq:bestopid}})

  // BusRoute.find({
  //   "stops.bestopid":bestopid, "route":busrouteNo, "direction":direction
  // })

  BusRoute.aggregate([{$unwind: "$stops"},{$match: { "route": busrouteNo, "direction":direction, "stops.bestopid": bestopid  } }])
 //.select('stops.bestopid')
  .exec()
  .then(doc=>{
    console.log("len ", doc.length)
    res.status(200).json(doc)

  })
  .catch(err=>{
    console.log("err route dir",err)
    res.status(500).json({error:err})
  })
})

router.post('/', (req,res,next)=>{
  res.status(200).json({
    message: 'at slash busroutes- post'
  })
})

module.exports = router;