const mongoose = require('mongoose');

const busTimesSchema = mongoose.Schema({
  bus: String,
  time: String,
})

const busStopSchema = mongoose.Schema({
  name: String,
  bestopid: String,
  stop_sequence: Number,
  bus_times_week:[busTimesSchema]
})

const busRoutesSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  route: String,
  routename: String,
  direction: String,
  stops: [busStopSchema]


})


module.exports = mongoose.model('BusRoute', busRoutesSchema);


/**
 mongodb+srv://marieoh:busLoad19@bus-zvhfi.mongodb.net/test?retryWrites=true&w=majority

mongoimport –-host bus-shard-00-00-zvhfi.mongodb.net:27017 --db busload --type json --file timetablesOut.json --jsonArray --authenticationDatabase admin --ssl --username marieoh --password busLoad19

mongoimport --uri "mongodb://root:<PASSWORD>@atlas-host1:27017,atlas-host2:27017,atlas-host3:27017/<DATABASE>?ssl=true&replicaSet=myAtlasRS&authSource=admin" --collection myData --drop --file /somedir/myFileToImport.json

mongoimport --uri "mongodb+srv://marieoh:busLoad19@bus-zvhfi.mongodb.net/test?retryWrites=true&w=majority" --collection bus --drop --file timetablesOut.json

--uri "mongodb://[marieoh:busload@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[database][?options]]"

[marieoh:busload@]
bus-shard-00-00-zvhfi.mongodb.net[:27017],
[,bus-shard-00-01-zvhfi.mongodb.net[:27017],
[,bus-shard-00-02-zvhfi.mongodb.net[:27017]]]
[/test]

mongoimport --uri "mongodb://root:busLoad19@bus-shard-00-00-zvhfi.mongodb.net:27017,bus-shard-00-01-zvhfi.mongodb.net:27017,bus-shard-00-02-zvhfi.mongodb.net:27017/busroutes?ssl=true&replicaSet=myAtlasRS&authSource=admin" --collection myData --drop --file timetablesOut.json


mongodb://bus-zvhfi.mongodb.net:27017/admin
==========================

--uri mongodb+srv://marieoh:busLoad19@bus-zvhfi.mongodb.net/test?retryWrites=true&w=majority

mongoimport --uri "mongodb+srv://marieoh:busLoad19@bus-zvhfi.mongodb.net/test?retryWrites=true&w=majority" --collection myData --drop --file timetablesOut.json

//////////////////////
BELOW IS THE CMD THAT WORKS (run wherever monogimport.exe & json file are (no $PATH var set up))
 ||
 ||
 ||
VVVVV
 VVV
  V

./mongoimport --host bus-shard-0/bus-shard-00-00-zvhfi.mongodb.net:27017,bus-shard-00-01-zvhfi.mongodb.net:27017,bus-shard-00-02-zvhfi.mongodb.net:27017 --ssl --username marieoh --password busLoad19 --authenticationDatabase admin --db bus --collection busroutes --type json --jsonArray --file timetablesOut.json
///////////////////////////
 */


 