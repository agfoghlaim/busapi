module.exports = {
  getTimetableName: function(){
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
  },
  isWithinMinutesOf: function(busLoadTime,beTime,numMinutes){
 
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
  },
  getNameOfTodaysTimetable: function(){
    let dayNumber = new Date().getDay();
    let day = {};
    
      if(dayNumber > 0 && dayNumber < 6){
        day =  {dayName:'bus_times_week', dayNumber:dayNumber};
      }else if(dayNumber === 0 ){
        day =  {dayName:'bus_times_sun', dayNumber:dayNumber};
      }else if(dayNumber === 6 ){
        day =  {dayName:'bus_times_sat', dayNumber:dayNumber};
      }else{
        day = 'err'
      }
     return day
  },
  addSnapshotsArrayToTimetable: function(relevantTimetable,relevantSnaps){
 
    let respWithSnaps = relevantTimetable.reduce((out,bus, j,all)=>{
      let obj = {
        bus:bus.bus,
        time:bus.time,
        snapshots:[]
      }
  
      for(let i = 0; i< relevantSnaps.length;i++){
          if(this.isWithinMinutesOf(bus.time,relevantSnaps[i].forBusDue,2)){

          obj.snapshots.push(relevantSnaps[i])
        } 
      }
      out.push(obj)
      return out
  
    },[])
    return respWithSnaps;
  },
  //  pretendSnapShotsForTesting: [
  //     {forBusDue: '23:24', name:'pretend snap', date:'last monday'},
  //     {forBusDue: '07:26', name:'pretend snap', date:'the monday before last'},
  //     {forBusDue: '07:26', name:'pretend snap', date:'a few mondays ago'},
  //     {forBusDue: '23:24', name:'pretend snap', date:'the monday before last'},
  //     {forBusDue: '07:26', name:'pretend snap', date:'last monday'},
  //     {forBusDue: '23:24', name:'pretend snap', date:'some other omonday'},
  //     {forBusDue: '07:26', name:'pretend snap', date:'last monday'}
  //   ],
  doAllTimeAverage: function(timetablesWithSnapshots){
      timetablesWithSnapshots.map(timetable=>{
        let theSnapTotalMinsLate = timetable.snapshots.reduce((out,snap,i,all)=>{
          if(snap.earlyOrLate === 'late'){
            out +=snap.minutesOff
          }else if(snap.earlyOrLate === 'early'){
            out -=snap.minutesOff
          }
          return out
        },0)
        let theSnapAverage = theSnapTotalMinsLate/timetable.snapshots.length
        timetable.theSnapAverage = theSnapAverage;
        // console.log("calculating... ", theSnapTotalMinsLate, ' / ',timetable.snapshots.length ,  ' = ',  theSnapTotalMinsLate/timetable.snapshots.length )
        return timetable
      })

     return timetablesWithSnapshots

    },

    checkIfSameWeather: function(rainNum,weather){
      if(weather === 'wet'){
         if(rainNum > 0 ) return true
      }else if(weather === 'dry'){
        if(rainNum === 0 ) return true
      }else{
        return false;
      }
    }
  
  


}






