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
var request = require("request");


//apivideo
const apiVideoClient = require('@api.video/nodejs-client');

//if you chnage the key to sandbox or prod - make sure you fix the delegated toekn on the upload page
const apiVideoKey = process.env.apiProductionKey;


// website demo
//get request is the initial request - load the HTML page with the video requested
app.get('/video', (req, res) => {
	//dont cache the page
	res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
	var videoId = req.query.chooseVideo;
	var userName = req.query.userName;
	var metadata = {'userName': userName};
	var currentPage = '1'; // Choose the number of search results to return per page. Minimum value: 1
    var pageSize = '1'; // Results per page. Allowed values 1-100, default is 25.

	//first we'll get the session data for the video and the metadata userName
	var params = { videoId, metadata, currentPage, pageSize};
	console.log("params",params)
	const client = new apiVideoClient({apiKey: apiVideoKey});
	const result = client.rawStatistics.listVideoSessions(params);
	result.then(function(videos) {
	//	console.log("Allsessions that match", videos);
		const numberSessions = videos.pagination.itemsTotal;
		console.log("number of results: ", numberSessions);
		if(numberSessions >0){
			currentPage = numberSessions;
			const lastSessionParams = { videoId, metadata, currentPage, pageSize};
			console.log("lastSessionParams", lastSessionParams);
			const lastSessionResult = client.rawStatistics.listVideoSessions(lastSessionParams);
			lastSessionResult.then(function(lastSession) {
				console.log("lastSesson: ", lastSession);
				//this is the last session
				var sessionId =  lastSession.data[0].session.sessionId;
				currentPage = 1;
				pageSize = 100;
				var sessionParams = {sessionId, currentPage, pageSize};
				console.log("the last session is: ", sessionId);
				const sessionData = client.rawStatistics.listSessionEvents(sessionParams);
				sessionData.then( function(lastSessionData) {
					//this is the session data
					console.log("session events", lastSessionData);
					var numberOfEvents = lastSessionData.pagination.itemsTotal;
					console.log("sessionevents", numberOfEvents);
					var lastTimeRecorded  = lastSessionData.data[numberOfEvents -1].at;
					console.log("lastTimeRecorded", lastTimeRecorded);
					var videoUrl = 'https://embed.api.video/vod/'+videoId+'?metadata[userName]='+userName+'#autoplay;t='+lastTimeRecorded;
						return res.render('video', {videoUrl});
				});

			});
		}else{
			var videoUrl = 'https://embed.api.video/vod/'+videoId+'?metadata[userName]='+userName+'#autoplay';
						return res.render('video', {videoUrl});
		}	
	});
	

	//this is the SDK code.  well just API calls really
	/*
	//with the videoID - make an analytics call
	//the analytics API does not support searching with metadata, so we have to use the API
	//also, the API will only list in ASC order - and we want the newest session.
	//in general, there will not be > 100 sesstions for a video/userName combination
	//but in a test app, perhaps there will be.


	//first we must authenticate
	var authOptions = {
		method: 'POST',
		url: 'https://ws.api.video/auth/api-key',
		headers: {
			accept: 'application/json'
			
		},
		json: {"apiKey":apiVideoKey}

	}
	//this exposes the api key - so hiding
	//console.log(authOptions);	
	request(authOptions, function (error, response, body) {
		if (error) throw new Error(error);
		//this will give me the api key
		//console.log("body", body);
		var authToken = body.access_token;
		console.log(authToken);
		
		//now lets look at the video in question
		//with the Username metadata

		
		var firstSessionQuery = {
			method: 'GET',
			url: 'https://ws.api.video/analytics/videos/'+videoId+'?currentPage=1&pageSize=1&metadata[userName]='+userName,
			headers: {
				accept: 'application/json',
				authorization: 'Bearer ' +authToken
			}
		}
		request(firstSessionQuery, function (error, response, body) {
			if (error) throw new Error(error);
			body = JSON.parse(body);
			console.log("body", body);
			console.log("data", body.data[0]);
			console.log("pagination", body.pagination);
			var sessionCount = body.pagination.itemsTotal;
			console.log("items total", body.pagination.itemsTotal);
			if (sessionCount>0){
				//if there is just one session, we have everything we need right now
				if(sessionCount ==1){
					console.log(body.data[0]);
					var sessionId = body.data[0].session.sessionId;
					console.log(sessionId);
					//now we can access this sessionId, and get the last time in the session
					getSession(authToken, videoId, sessionId, userName);

				}else{
					//we need another query to get the "last session"
				
					var lastSessionCounter = body.pagination.itemsTotal;
					console.log("pagiation:", body.pagination.links);
					//links count can vary - we want the last one in the array
					var linksLength = body.pagination.links.length;
					console.log("link aray length", linksLength);
					var lastUri = decodeURI(body.pagination.links[linksLength-1].uri);
					console.log("number of sessions with this username:", lastSessionCounter);
					console.log("uri", lastUri);
					//request that last session
					var lastSessionQuery = {
						method: 'GET',
						url: 'https://ws.api.video' +lastUri,
						headers: {
							accept: 'application/json',
							authorization: 'Bearer ' +authToken
						}
					}
					request(lastSessionQuery, function (error, response, body) {
						if (error) throw new Error(error);
						body = JSON.parse(body);
						console.log("body", body);
						console.log(body.data[0]);
						var sessionId = body.data[0].session.sessionId;
						console.log(sessionId);
						//now we can access this sessionId, and get the last time in the session
						getSession(authToken, videoId, sessionId, userName);
						
					});
				}

			}else{
				//no sesstions for this user
				//return the video at time =0
				var videoUrl = 'https://embed.api.video/vod/'+videoId+'?metadata[userName]='+userName+'#autoplay';
				return res.render('video', {videoUrl});
				
			}

		});



	});
*/	

	function getSession (authToken, videoId, sessionId, userName) {
		//lets get 100 session activities - i doubt there will ever be that many - (or more than 100)
		var getSession = {
			method: 'GET',
			url: 'https://ws.api.video/analytics/sessions/'+sessionId+'/events?currentPage=1&pageSize=100',
			headers: {
				accept: 'application/json',
				authorization: 'Bearer ' +authToken
			}
		}
		request(getSession, function (error, response, body) {
			if (error) throw new Error(error);
			body = JSON.parse(body);
			console.log("sessions", body.data);
			var numberofEvents = body.data.length;
			console.log("num events", numberofEvents);
			var lastTimeRecorded = body.data[numberofEvents-1].at;
			console.log("last event time", lastTimeRecorded);
	
			var videoUrl = 'https://embed.api.video/vod/'+videoId+'?metadata[userName]='+userName+'#autoplay;t='+lastTimeRecorded;
					return res.render('video', {videoUrl});
	
		});
	
	}
	
	  
});



//testing on 3006
app.listen(3006, () =>
  console.log('Example app listening on port 3006!'),
);
process.on('uncaughtException', function(err) {
    // handle the error safely
    console.log(err)
    // Note: after client disconnect, the subprocess will cause an Error EPIPE, which can only be caught this way.
});



	