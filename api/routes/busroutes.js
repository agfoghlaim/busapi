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
  const timetableName = getTimetableName();

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

====================================

*/
router.get('/stop/:busrouteNo/:direction/:bestopid/snap', (req,res,next)=>{
  const {busrouteNo, direction, bestopid} = req.params

  // BusRoute.find({route:busrouteNo,direction:direction,"stops.bestopid": bestopid})
  BusRoute.find({route:busrouteNo,direction:direction,"stops.bestopid": bestopid, "stops.snapshots.dayOfWeek": "Mon"})
  .limit(1)
  .exec()
  .then(doc=>{
    let resp = doc[0].stops.find(stop=>stop.bestopid === bestopid).toObject()
    
    let relevantSnaps = resp.snapshots.filter(snap=>snap.dayOfWeek === 'Mon')
    let relevantTimetable = resp.bus_times_week;
    let respWithSnaps = relevantTimetable.map(bus=>{
      for(let i = 0;i< relevantSnaps.length;i++){
          if(isWithinMinutesOf(bus.time,relevantSnaps[i].forBusDue,2)){
          return {
            bus:bus.bus,
            time:bus.time,
            snapshot:relevantSnaps[i]
          }
        } 
      }
        return {
          bus:bus.bus,
          time:bus.time,
          snapshot:false
        }
    })
    //console.log("timetable, ",respWithSnaps, respWithSnaps.length)
    res.status(200).json(respWithSnaps)
  })
  .catch(err=>{
    console.log("err route dir",err)
    res.status(500).json({error:err})
  })
})






/*

TODO move anything below here into seperate file

*/

function getTimetableName(){
  let dayNumber = new Date().getDay();
  let day = {};
  
    if(dayNumber > 0 && dayNumber < 6){
      day =  'bus_times_week'
    }else if(dayNumber === 0 ){
      day =  'bus_times_sun';
    }else if(dayNumber === 6 ){
      day =  'bus_times_sat';
    }else{
      day = 'did not get the correct day'
    }
   return day
}

function isWithinMinutesOf(busLoadTime,beTime,numMinutes){
 
  let theirDate = new Date();
  let myDate = new Date();
  
  theirDate.setHours(beTime.substr(0,2))
  theirDate.setMinutes(beTime.substr(3,2))
  
  myDate.setHours(busLoadTime.substr(0,2))
  myDate.setMinutes(busLoadTime.substr(3,2))

  //subtract the largest time from the smallest time
  var diff = Math.max(theirDate.valueOf(), myDate.valueOf()) - Math.min(theirDate.valueOf(), myDate.valueOf()); 

  diff = diff/1000/60

  //is the difference less than numMinutes???
  return (diff <= numMinutes)? true : false;
}
