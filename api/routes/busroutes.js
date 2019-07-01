const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const BusRoute = require('../models/busroute')
const helpers = require('./helpers');

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

/busroutes/stop/:route/:direction/:stopid
returns one stop only

*/
router.get('/stop/:busrouteNo/:direction/:bestopid/', (req,res,next)=>{
  const {busrouteNo, direction, bestopid} = req.params

  BusRoute.find({route:busrouteNo,direction:direction,"stops.bestopid": bestopid})
  .exec()
  .then(doc=>{
    let resp = doc[0].stops.find(stop=>stop.bestopid === bestopid)

    res.status(200).json(resp)
  })
  .catch(err=>{
    console.log("err route dir",err)
    res.status(500).json({error:err})
  })
})

/*

/busroutes/direction/:stopid
returns route with one stop (object, not in array)

*/
router.get('/:busrouteNo/:direction/:bestopid', (req,res,next)=>{
  const {busrouteNo, direction, bestopid} = req.params

  BusRoute.aggregate([{$unwind: "$stops"},{$match: { "route": busrouteNo, "direction": direction, "stops.bestopid": bestopid  } }])
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

/*
GET TODAY's TIMETABLE

/busroutes/direction/:stopid/timetable/today

*/

router.get('/:busrouteNo/:direction/:bestopid/timetable/today', (req,res,next)=>{
  console.log("here")
  const {busrouteNo, direction, bestopid} = req.params;
  const timetableName = helpers.getTimetableName();

  BusRoute.aggregate([{$unwind: "$stops"},{$match: { "route": busrouteNo, "direction": direction, "stops.bestopid": bestopid  } }])
  .exec()
  .then(doc=>{

    let respondWithtimetable = {}
    respondWithtimetable[`${timetableName}`] = doc[0].stops[timetableName];
    snapshots = doc[0].stops.snapshots;
    res.status(200).json(respondWithtimetable)
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


/*

=====================================

WITH SNAPSHOT included in the bus_times_x array
This route defaults to today's timetable

====================================

*/
router.get('/stop/:busrouteNo/:direction/:bestopid/snap', (req,res,next)=>{
  const {busrouteNo, direction, bestopid} = req.params

  let whichTimetable = helpers.getNameOfTodaysTimetable();
  let dayToday = new Date().toString().substring(0,3)
  
  BusRoute.find({route:busrouteNo,direction:direction,"stops.bestopid": bestopid, "stops.snapshots.dayOfWeek": `${dayToday}`})
  .limit(1)
  .exec()
  .then(doc=>{
    let resp = doc[0].stops.find(stop=>stop.bestopid === bestopid).toObject()
    let relevantSnaps = resp.snapshots.filter(snap=>snap.dayOfWeek === 'Mon')
    let relevantTimetable = resp[`${whichTimetable.dayName}`];
    //relevantSnaps = helpers.pretendSnapShotsForTesting

    let respWithSnaps = helpers.addSnapshotsArrayToTimetable(relevantTimetable,relevantSnaps);
 
    res.status(200).json(respWithSnaps)
  })
  .catch(err=>{
    console.log("err route dir",err)
    res.status(500).json({error:err})
  })
})



