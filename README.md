# resume a video


This demo uses NodeJS and [API.video](https://api.video) to resume a video from where the viewer left off.

Requires NodeJS.

Simply clone this repo, and install the requiried node modules 

```
npm install
```
You'll need a .env file where you can add your api.video API key.

Read about how it works in our [blog](http://api.video/blog/tutorials/resume-a-video), and check out the demo at [resume.a.video](https://resume.a.video)

### Summary how how it works

Each session has a metadata[userName] attribute that assigns the session to a specific user.  Each video session has playback events.

By grabbing the last event in the most recent session - we are able to determine where the user stopped watching the video.

We can then serve the video to start at this timestamp.

If no sessions for user: start at 0

Try it out, and let us know what you think!