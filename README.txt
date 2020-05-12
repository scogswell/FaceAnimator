"Face Animator" widget for streaming and general foolishness
V0.9 2020-May-11
Steven Cogswell

This program runs in a browser window and displays one of four "face" images
based on audio level. The intention was for this to be used as an overlay
element in streaming software like OBS Studio. 

When this loads it requests audio permission, which is required for this to work.  

The four images are named 0.png, 1.png, 2.png, and 3.png and placed in the
directory specified by the "faceDirectory" variable in the .js file. 0.png is
the image that displays when "no audio" is heard, and 1/2/3 are displayed
depending on the increasing volume level.  Level thresholds for the display of
images can be set by number boxes in the UI.  The images don't have to be
"faces" - use whatever you want, see what works for you.  Use png files with
alpha transparency, and the program displays on a green (#00FF00) background so
you can chroma-key it out.  

By default this is designed around 100x100 pixel images.  If you want bigger, make
bigger images and change the size of the canvas definition in the .html to reflect
that. 

Changing the background colour (default is #00FF00 for chroma-key purposes) means 
changing body background-color in the .css and canvasCtx.fillStyle = 'rgb(0,255,0)';
in doDraw() in the .js file. 

Audio is sampled and RMS value is calculated for comparison against the thresholds.
If you don't like RMS method you can replace it with your own in processAudio().

In general, load up the mic.html in your web browser, allow the audio input source
you want, and then play with the level 1/2/3 levels to get the desired response from 
the images. You can check the "show values" debug checkbox which will display the 
RMS audio measurement on the image which might help you set levels.  If you get a 
set of levels you're happy with change the default values in the .html file to load
that way every time.  

This seems to work in chrome and firefox and probably safari, your mileage may vary.  
Although it does work as a browser object in OBS Studio (obs must be started with 
the --enable-media-stream option) using a web browser makes it easier to select the 
audio input to be used.  It has some allowances to work with Safari on desktop on OSX
but I haven't rigorously tested it.  


Thank you to inspiration from: 
https://twitch.tv/snowschu, who uses a similar looking visualizer, but this program is not 
    based on it, I've not seen that code. 
https://codepen.io/zapplebee/pen/gbNbZE
https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API
https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/getByteTimeDomainData
https://mdn.github.io/voice-change-o-matic/scripts/app.js
https://imgur.com/gallery/xbx9yr2 Bongo Cat Images
https://twitter.com/GenePark/status/1257458630678511616 Darth Y'all Images