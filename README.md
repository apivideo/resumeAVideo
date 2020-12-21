# videoAnalytics
NodeJS app to retrieve and process video analytics from you api.video video.

## Live demo

https://whoswatched.a.video

## Blog post

https://api.video/blog/tutorials/video-analytics-a-primer


## What this app does

The landing page is a simple form. It lists 3 videos in my api.video account.  Click one, and a new page loads.  On the backend, the NodeJS SDK calls the analytics endpoint for the video selected.  The API returns all of the views for the video, and the backend tabulalates view per: country, device, and Browser, 

These results and the video are displayed on the webapge.

##  What we are showing

This is a very simple application to demonstatrate how easy it is to access and parse the analytics that are created when a viewer watches your video with the api.video player.
