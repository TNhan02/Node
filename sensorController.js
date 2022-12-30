'use strict'
//  demo data
var measurements = [
  {
    measurementid: 1,
    timestamp: new Date(2022, 10, 27, 9, 25, 0),
    locationid: 1,
    unit: "Celsius",
    amount: 0,
    deviceid: 112232
  },
  {
    measurementid: 2,
    timestamp: new Date(2022, 10, 27, 9, 25, 0),
    locationid: 1,
    unit: "Humidity(%)",
    amount: 66,
    deviceid: 112232
  },
  {
    measurementid: 3,
    timestamp: new Date(2022, 10, 27, 9, 25, 0),
    locationid: 2,
    unit: "Celsius",
    amount: 30,
    deviceid: 112233
  },
  {
    measurementid: 4,
    timestamp: new Date(2022, 10, 27, 9, 25, 0),
    locationid: 2,
    unit: "Humidity(%)",
    amount: 40,
    deviceid: 112233
  }
];

var locations = [
  {
    locationid: 1,
    latitude: 62.888855,
    longitude: 27.6284978,
    address: "Microkatu 1, 70210 KUOPIO",
    information: "Savonia Microkatu Campus"
  },
  {
    locationid: 2,
    latitude: 62.329815,
    longitude: 27.851587,
    address: "Opiskelijankatu 3, 78210 VARKAUS",
    information: "Savonia Varkaus Campus"
  }
];

var devices =
  [
    {
      deviceid: 112232,
      shortname: "NodeMcu V3",
      information: "NodeMcu v3 powered with ESP8266 and added DHT22 sensor"
    },
    {
      deviceid: 112233,
      shortname: "RuuviTag",
      information: "Wireless Temperature, Humidity, Air Pressure and Motion Sensor"
    }
  ];


var searchLocation = "";
var searchDevice = "";
var searchUnit = "";
var searchMeasurementID = "";
var nextMeasurementID = 4;

function checkLocationID(location) {
  if (searchLocation == "" || searchLocation == undefined) {
    return true;
  }
  return location.locationid == searchLocation;
}
function checkDeviceID(device) {
  if (searchDevice == "" || searchDevice == undefined) {
    return true;
  }
  return device.deviceid == searchDevice;
}
function checkUnit(unit) {
  if (searchUnit == "" || searchUnit == undefined) {
    return true;
  }
  return unit.unit.includes(searchUnit);
}
function checkMeasurementID(measurement) {
  if (searchMeasurementID == "" || searchMeasurementID == undefined) {
    return true;
  }
  return measurement.measurementid == searchMeasurementID;
}


// this is what server.js uses
module.exports = {
  fetchMeasurements: function (req, res) {
    // search params are in req.query object
    console.log("Params = " + JSON.stringify(req.query));

    console.log(req.query);

    searchLocation = req.query.locationid;
    searchDevice = req.query.deviceid;
    searchUnit = req.query.unit;
    let result = measurements.filter(checkLocationID).filter(checkDeviceID).filter(checkUnit);
    console.log(result);

    res.json(result); // server send response with res.json
  },

  addMeasurement: function (req, res) {
    // req.body object contains all information with POST method
    console.log("Body = " + JSON.stringify(req.body));

    console.log(nextMeasurementID);
    nextMeasurementID++;

    measurements.push({
      measurementid: nextMeasurementID,
      timestamp: new Date(req.body.timestamp),
      locationid: parseInt(req.body.locationid),
      unit: req.body.unit,
      amount: parseInt(req.body.amount),
      deviceid: parseInt(req.body.deviceid)
    });

    res.status(201);
    res.send({ message: "OK" }); // server also sends response with this 
  },

  updateMeasurement: function (req, res) {
    // Client sends put method request
    console.log("Body = " + JSON.stringify(req.body));
    console.log("Params = " + JSON.stringify(req.params));
    //res.json({message:"Ok"}); 
    // if we try to use both send and json responses error occurs

    // use for loop to go through measurements
    // if req.params.id is same as measurementid -> change other fields
    for (var i = 0; i < measurements.length; i++) {
      //console.log(measurements[i].measurementid,"/",parseInt(req.params.id));
      //console.log(measurements[i].timestamp, "/", new Date(req.body.timestamp));

      if (measurements[i].measurementid === parseInt(req.params.id)) {
        measurements[i].timestamp = new Date(req.body.timestamp);
        measurements[i].locationid = parseInt(req.body.locationid);
        measurements[i].unit = req.body.unit;
        measurements[i].amount = parseInt(req.body.amount);
        measurements[i].deviceid = parseInt(req.body.deviceid);
      }
    }

    console.log(measurements);
    res.send("Single measurement update requested from ");
  },

  deleteMeasurement: function (req, res) {
    // Client sends DELETE method request
    //console.log("Body = " + JSON.stringify(req.body));
    //req.params contains all information REMOVE method
    console.log("Params = " + JSON.stringify(req.params));

    //using array filter to sort measurements array again after a selected measurement is deleted
    measurements = measurements.filter((item) => {
      //console.log(item.measurementid, "/", req.params.id); 
      //req.params.id is a string
      if (item.measurementid !== parseInt(req.params.id)) {
        return true;
      }
      return false;
    })

    console.log(measurements);
    res.send(measurements);
  },

  fetchSingleMeasurement: function (req, res) {
    // Client sends GET method request
    console.log("Body = " + JSON.stringify(req.body));
    console.log("Params = " + JSON.stringify(req.params));

    searchMeasurementID = req.params.id;
    let result = measurements.find(checkMeasurementID);
    console.log(result);

    res.send(result);
  },

  fetchDevice: function (req, res) {
    res.json(devices);
  },

  addDevice: function (req, res) {
    // first: check if user has provided required fields
    // from req.body
    if (req.body.deviceid == undefined || !Number.isInteger(req.body.deviceid)) {
      res.status(400); // bad request
      res.send("deviceid missing or deviceid is not an integer");
    } else if (req.body.information == undefined) {
      res.status(400); // bad request
      res.send("information missing");
    } else {
      devices.push({
        deviceid: req.body.deviceid,
        shortname: req.body.shortname,
        information: req.body.information
      });
      res.status(201);
      res.send("OK");
    }// TODO: check shortname
  },

  addLocation: function (req, res) {
    if (req.body.locationid == undefined || !Number.isInteger(req.body.locationid)) {
      res.status(400); // bad request
      res.send("locationid missing or locationid is not an integer");
    } else if (req.body.longitude == undefined || !Number.isInteger(req.body.longitude) ||
      req.body.latitude == undefined || !Number.isInteger(req.body.latitude) ||
      req.body.address == undefined || 
      req.body.information == undefined) {
      res.status(400); // bad request
      res.send("information missing");
    } else {
      locations.push({
        locationid: req.body.locationid,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        address: req.body.address,
        information: req.body.information
      });
      res.status(201);
      res.send("OK");
    }
  },

  fetchLocation: function (req, res) {
    res.json(locations);
  }
}