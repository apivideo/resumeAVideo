require('dotenv').config();
//import express from 'express';
const express = require('express');
//express for the website and pug to create the pages
const app = express();
const pug = require('pug');
bodyParser = require('body-parser');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine','pug');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine','pug');
const Discord = require('discord.js');
const discordClient = new Discord.Client();
// when the client is ready, run this code
// this event will only trigger one time after logging in
discordClient.once('ready', () => {
	console.log('discord Ready!');

});




//apivideo
const apiVideo = require('@api.video/nodejs-sdk');


//if you chnage the key to sandbox or prod - make sure you fix the delegated toekn on the upload page
const apiVideoKey = process.env.apiProductionKey;


// website demo
//get request is the initial request - load the HTML page with the form
app.get('/stats', (req, res) => {
	//dont cache the page
	res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
	var videoId = req.query.chooseVideo;
	console.log(videoId);

	//with the videoID - make an anaytics call
	const client = new apiVideo.Client({ apiKey: apiVideoKey });
	let result =client.analyticsVideo.get(videoId);
	result.then(function(analytics){
		//analytics results
		//loop through them all
		//aggregate the totals
		var analyticsData = analytics.data;
		var arrayLength = analyticsData.length;
		console.log(arrayLength);
		var country = [];
		var deviceType=[];
		var osName = [];
		var clientName = [];
		//console.log(analyticsData);
		//console.log(analyticsData[0]);
		for(var i = 0; i< arrayLength; i++){
			country.push(analyticsData[i].location.country);
			deviceType.push(analyticsData[i].device.type);
			osName.push(analyticsData[i].os.name);
			clientName.push(analyticsData[i].client.name);
		}

		//now we have arrays with countyr, device, browser
		//now we can add them up
		var countryList = createObject(country);
		var deviceList = createObject(deviceType);
		var osList = createObject(osName);
		var clientList = createObject(clientName);

		console.log("results");
		var countryCount = Object.keys(countryList).length;
		var deviceCount = Object.keys(deviceList).length;
		var osCount = Object.keys(osList).length;
		var clientCount = Object.keys(clientList).length;
		console.log("country Count", countryCount);
		
		for (const [key, value] of Object.entries(countryList)) {
			console.log(`${key}: ${value}`);
		  }
		  for (const [key, value] of Object.entries(deviceList)) {
			console.log(`${key}: ${value}`);
		  }
		  for (const [key, value] of Object.entries(osList)) {
			console.log(`${key}: ${value}`);
		  }
		  for (const [key, value] of Object.entries(clientList)) {
			console.log(`${key}: ${value}`);
		  }
		  var videoUrl = "https://embed.api.video/vod/" + videoId + "#autoplay";
		  return res.render('stats', {videoUrl, arrayLength, countryList, countryCount, deviceList, deviceCount, osList, osCount, clientList, clientCount});

	}).catch((error) => {
		console.log(error);
	});
	
	
	  
});

function createObject(array){
   var obj = {};
   var arrayLength = array.length;
   for(var j = 0; j< arrayLength; j++){
	var arrayName = array[j];			
	if(obj.hasOwnProperty(arrayName)){
		//if key already exists
		//add one to the count
		obj[arrayName] ++;
	}else{
		//key does not exist
		//add and vide value 1
		obj[arrayName] = 1;
	}
   }
   return obj;
}

//testing on 3005
app.listen(3005, () =>
  console.log('Example app listening on port 3005!'),
);
process.on('uncaughtException', function(err) {
    // handle the error safely
    console.log(err)
    // Note: after client disconnect, the subprocess will cause an Error EPIPE, which can only be caught this way.
});



	