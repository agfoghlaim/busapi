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

/busroutes/direction/:stopid/timetable/today


*/

router.get('/:busrouteNo/:direction/:bestopid/timetable/today', (req,res,next)=>{
  const {busrouteNo, direction, bestopid} = req.params
  const timetableName = getTimetableName()
  BusRoute.aggregate([{$unwind: "$stops"},{$match: { "route": busrouteNo, "direction": direction, "stops.bestopid": bestopid  } }])
  .exec()
  .then(doc=>{
    console.log("len ", doc)
    let respondWithtimetable = {}
    respondWithtimetable[`${timetableName}`]=doc[0].stops[timetableName];
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
// function getDayOfWeek(){
//   let dayNumber = new Date().getDay();
//   let day = {};
  
//     if(dayNumber > 0 && dayNumber < 6){
//       day =  {dayName:'bus_times_week', dayNumber:dayNumber};
//     }else if(dayNumber === 0 ){
//       day =  {dayName:'bus_times_sun', dayNumber:dayNumber};
//     }else if(dayNumber === 6 ){
//       day =  {dayName:'bus_times_sat', dayNumber:dayNumber};
//     }else{
//       day = 'did not get the correct day'
//     }
//    return day
// }