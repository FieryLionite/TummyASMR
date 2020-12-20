
/**
 * (exVideo) Video extension for GameMaker Studio
 *
 * @author  Alexander Vourtsis
 * @version	1.1.5
 * @updated	22 August 2016, 20:25 GMT+2
 * @license	Free to use for freeware & commercial projects, no attribution required
 */


// initialize values
var ex_video_canvas                   = "canvas";
var ex_video_canvas_container         = "gm4html5_div_id";
var ex_video_id                       = "exVideo";
var ex_video_container_id             = "exVideoContainer";
var ex_video_embed_container_id       = "exVideoEmbedContainer";
var ex_video_embed_youtube_overlay_id = "exVideoYTOverlay";
var ex_video_playing 		 		  = 0;
var ex_video_paused  		 		  = 0;
var ex_video_position_x 	 		  = 0;
var ex_video_position_y 	 		  = 0;
var ex_video_width 			 		  = -1;
var ex_video_height 		 		  = -1;
var ex_video_angle 			  	 	  = 0;
var ex_video_scale_mode 	  	      = "fill";
var ex_video_duration         	 	  = 0;
var ex_video_visibility       		  = "transparent";
var ex_video_opacity          	 	  = 1.0;
var ex_video_end_event		  		  = -1;
var ex_video_loadedmetadata_event     = -1;
var ex_video_angle3d_x				  = 0;
var ex_video_angle3d_y				  = 0;
var ex_video_angle3d_z				  = 0;
var ex_video_angle3d_p				  = 0;
var ex_video_type					  = "";
var ex_video_is_embed				  = 0;
var ex_video_embed_player			  = -1;
var ex_video_current_time			  = 0;
var ex_video_current_time_poll		  = -1;
var ex_video_embed_script 			  = false;
var ex_video_loop					  = 0;
var ex_video_embed_api_ready		  = false;
var ex_video_loading			      = false;
var ex_video_autoplay				  = true;
var ex_video_controls				  = false;
var ex_video_interactive			  = false;
var ex_video_autohide				  = false;
var ex_video_embed_youtube_api        = "//www.youtube.com/player_api?version=3";

var ex_video_error_nocanvas           = "exVideo Error, required element with ID \"canvas\" appears to be undefined.";
var ex_video_error_nocontainer        = "exVideo Error, required element with ID \"gm4html5_div_id\" appears to be undefined.";
var ex_video_error_invalid_scalemode  = "exVideo Error, Invalid scale mode, valid values are 'contain', 'fill' and 'cover'";

if (document.getElementById(ex_video_canvas) == undefined) {
	console.error(ex_video_error_nocanvas); alert(ex_video_error_nocanvas);
}

if (document.getElementById(ex_video_canvas_container) == undefined) {
	console.error(ex_video_error_nocontainer); alert(ex_video_error_nocontainer);
}

function ex_video_set_embed_parameters(autoplay, controls, autohide, interactive)
{
	ex_video_autoplay = autoplay;
	ex_video_controls = controls;
	ex_video_interactive = interactive;
	ex_video_autohide = autohide;
}

function ex_video_play(file, loop)
{
	
	if (ex_video_playing == 1 || ex_video_paused == 1 || ex_video_loading == true) { return 0; }
	
	ex_video_loading = true;
	ex_video_playing = 0;
	ex_video_paused = 0;
	ex_video_duration = 0;
	ex_video_current_time = 0;

	ex_video_is_embed = 0;
	ex_video_loop = loop;
	ex_video_type = "";
	ex_video_embed_player = -1;
	
	function getFileExtension(input) {
		var val = input;
		var arr = val.split('.');
		return arr[arr.length - 1];
	}
	
	function getYouTubeID(url){
		var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
		var match = url.match(regExp);
		if (match&&match[2].length==11){
			return match[2];
		}else{
			return "";
		}
	}
	
	var fileName = file.substr(0, file.lastIndexOf('.'));
	var fileExt = getFileExtension(file);

	var videoHandle = -1;
	var videoContainer = -1;
	var videoEmbedContainer = -1;
	var ytOverlay = -1;
	
	var isURL = new RegExp('^(https?:\\/\\/)?'+         // protocol
	'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
	'((\\d{1,3}\\.){3}\\d{1,3}))'+                      // OR ip (v4) address
	'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+                  // port and path
	'(\\?[;&a-z\\d%_.~+=-]*)?'+                         // query string
	'(\\#[-a-z\\d_]*)?$','i');                          // fragment locator
	
	var canvasHandle = document.getElementById(ex_video_canvas);
	var canvasContainer = document.getElementById(ex_video_canvas_container);
	
	if (isURL.test(file)) {

		ex_video_type = "embed";	
		ex_video_is_embed = 1;
		
	}
	
	if (ex_video_is_embed) {
		
		canvasContainer.insertAdjacentHTML('afterbegin', '<div id="'+ex_video_container_id+'" oncontextmenu="return false;"><div id="'+ex_video_embed_container_id+'"><div id="'+ex_video_id+'"></div></div></div>');
		
		videoContainer = document.getElementById(ex_video_container_id);
		videoHandle = document.getElementById(ex_video_id);
		videoEmbedContainer = document.getElementById(ex_video_embed_container_id);
		
		if (!ex_video_embed_script) {
			ex_video_embed_script     = document.createElement('script');
			ex_video_embed_script.src = ex_video_embed_youtube_api;
			var firstScriptTag        = document.getElementsByTagName('script')[0];
			firstScriptTag.parentNode.insertBefore(ex_video_embed_script, firstScriptTag);
		}
		
		var embedLoop = 0;
	
		if (loop == 1) {
			embedLoop = 1;
		}
		
	} else {
		canvasContainer.insertAdjacentHTML('afterbegin', '<div id="'+ex_video_container_id+'" oncontextmenu="return false;"><video id="'+ex_video_id+'" preload="auto" style="display:none;" oncontextmenu="return false;"></video></div>');
		
		videoContainer = document.getElementById(ex_video_container_id);
		videoHandle = document.getElementById(ex_video_id);
	}
	
	if (ex_video_width == -1) {
		ex_video_width = canvasHandle.width+"px";
	}
	
	if (ex_video_height == -1) {
		ex_video_height = canvasHandle.height+"px";
	}

	canvasHandle.style.position = "relative";
	canvasHandle.style.zIndex = 1;
	
	/* Embedded Video */
	if (ex_video_is_embed) {

		/* YT right click workaround */
		if (ex_video_interactive == false) {
			canvasContainer.insertAdjacentHTML('afterbegin', '<div id="'+ex_video_embed_youtube_overlay_id+'" oncontextmenu="return false;"></div>');
			
			ytOverlay = document.getElementById(ex_video_embed_youtube_overlay_id);
			
			ytOverlay.style.display = "block";
			ytOverlay.style.position = "absolute";
			ytOverlay.style.left = "0px";
			ytOverlay.style.top = "0px";
			ytOverlay.style.width = canvasHandle.width+"px";
			ytOverlay.style.height = canvasHandle.height+"px";
			ytOverlay.style.overflow = "hidden";
			ytOverlay.style.backgroundColor = "transparent";
			ytOverlay.style.zIndex = canvasHandle.style.zIndex + 100;
			ytOverlay.style.opacity = 0.4;
		}
		/* */
	
		if (ex_video_embed_api_ready == true && ex_video_playing == 0) {
			createEmbedPlayer();
		}
	
		window.onYouTubePlayerAPIReady = function() {
			ex_video_embed_api_ready = true;
			createEmbedPlayer();
		}
		
		function createEmbedPlayer(){
		
			ex_video_embed_player = -1;
			
			var params = {};
			
			params.controls = ex_video_controls;
			params.showinfo = 0;
			params.modestBranding = 1;
			params.playsinline = 1;
			params.autohide = ex_video_autohide;
			params.disablekb = !ex_video_controls;
			
			ex_video_embed_player = new YT.Player(ex_video_id, {
				width: parseInt(ex_video_width),
				height: parseInt(ex_video_height),
				videoId: getYouTubeID(file),
				events: {
					'onReady': onPlayerReady,
					'onStateChange': onPlayerStateChange
				},
				playerVars: {
					'controls': params.controls,           
					'showinfo': params.showinfo,
					'modestBranding': params.modestBranding,
					'playsinline': params.playsinline,
					'autohide': params.autohide,
					'disablekb': params.disablekb
				}
			});
		
		}
  
		function onPlayerReady(event) {
			if (ex_video_autoplay == true) {
				event.target.playVideo();
				ex_video_playing = 1;
			}
			ex_video_duration = event.target.getDuration();
			ex_video_current_time_poll = setInterval(function(){
				ex_video_current_time = event.target.getCurrentTime();
			}, 500);
			
			ex_video_loading = true;
			
		}

		function onPlayerStateChange(event) {        
			if(event.data === 0) {            
				if (ex_video_loop == 1) {
					event.target.seekTo(0, true);
					event.target.playVideo();
				} else {
					ex_video_stop();
				}
			}
		}
		
	
	} else {
	
	/* Local or remote video file */
	
		if (getFileExtension(fileExt) == 'mp4' || getFileExtension(fileExt) == 'm4v' || getFileExtension(fileExt) == 'ogv' || getFileExtension(fileExt) == 'webm'){
			if (videoHandle.canPlayType('video/mp4')) {
				videoHandle.innerHTML = '<source src="'+fileName+'.mp4" type="video/mp4"></source>';
				ex_video_type = "mp4";
			} else if (videoHandle.canPlayType('video/m4v')) {
				videoHandle.innerHTML = '<source src="'+fileName+'.m4v" type="video/m4v"></source>';
				ex_video_type = "m4v";
			} else if (videoHandle.canPlayType('video/ogv')) {
				videoHandle.innerHTML = '<source src="'+fileName+'.ogv" type="video/ogv"></source>';
				ex_video_type = "ogv";
			} else if (videoHandle.canPlayType('video/webm')) {
				videoHandle.innerHTML = '<source src="'+fileName+'.webm" type="video/webm"></source>';
				ex_video_type = "webm";
			} else {
				videoHandle.remove();
				videoContainer.remove();
				return 0;
			}
		} else {
			videoHandle.innerHTML = '<source src="'+file+'"></source>';
		}
	
	
		if (ex_video_interactive == false) {
			videoHandle.style.pointerEvents = "none";
		}

		if (ex_video_controls == false) {
			videoHandle.controls = false;
		} else {
			videoHandle.controls = true;		
		}
	
		if (ex_video_loop) {
			videoHandle.loop = true;	
		} else {
			videoHandle.loop = false;
		}
	
		if (ex_video_loop == 0) {
			ex_video_end_event = videoHandle.addEventListener("ended", function() {
				
				ex_video_playing = 0;
				ex_video_paused  = 0;
				videoHandle.removeEventListener("ended", ex_video_end_event, false);
				videoHandle.removeEventListener("loadedmetadata", ex_video_loadedmetadata_event, false);
				videoHandle.remove();
				videoContainer.remove();
				if (ytOverlay) {
					ytOverlay.remove();
				}
				ex_video_loading = false;
				
			}, false);
		}
		
		ex_video_loadedmetadata_event = videoHandle.addEventListener("loadedmetadata", function() {
			ex_video_duration = videoHandle.duration;
			if (ex_video_autoplay == true) {
				videoHandle.play();
				ex_video_playing = 1;
			}
		});
		
		ex_video_loading = true;

	}
	
	/* Settings */
	if (ex_video_interactive == false) {
		videoContainer.style.pointerEvents = "none";
	}
	
	videoContainer.style.display = "block";
	videoContainer.style.position = "absolute";
	videoContainer.style.left = "0px";
	videoContainer.style.top = "0px";
	videoContainer.style.width = canvasHandle.width+"px";
	videoContainer.style.height = canvasHandle.height+"px";
	videoContainer.style.overflow = "hidden";
	videoContainer.style.backgroundColor = ex_video_visibility;
	videoContainer.style.zIndex = canvasHandle.style.zIndex + 1;
	videoContainer.style.opacity = ex_video_opacity;
	
	if (ex_video_is_embed) {
		videoEmbedContainer.style.display = "block";
		videoEmbedContainer.style.position = "absolute";
		videoEmbedContainer.style.left = ex_video_position_x+"px";
		videoEmbedContainer.style.top  = ex_video_position_y+"px";
		videoEmbedContainer.style.width = ex_video_width;
		videoEmbedContainer.style.height = ex_video_height;
		videoEmbedContainer.style.zIndex = canvasHandle.style.zIndex + 2;
		videoEmbedContainer.style.objectFit = ex_video_scale_mode;
		videoEmbedContainer.style.opacity = ex_video_opacity;	
		
		videoHandle.style.left = "0px";
		videoHandle.style.top  = "0px";
		videoHandle.style.objectFit = "fill";
		
		if (ytOverlay) {
			ytOverlay.style.pointerEvents = "auto";
		}
		
	} else {
		videoHandle.style.display = "block";
		videoHandle.style.position = "absolute";
		videoHandle.style.left = ex_video_position_x+"px";
		videoHandle.style.top  = ex_video_position_y+"px";
		videoHandle.style.width = ex_video_width;
		videoHandle.style.height = ex_video_height;
		videoHandle.style.zIndex = canvasHandle.style.zIndex + 2;
		videoHandle.style.objectFit = ex_video_scale_mode;
		videoHandle.style.opacity = ex_video_opacity;
	}
	
	if (ex_video_angle != 0) {
		if (ex_video_is_embed) {
			videoEmbedContainer.style.webkitTransform = "rotate("+ex_video_angle+"deg)";
			videoEmbedContainer.style.MozTransform = "rotate("+ex_video_angle+"deg)";
			videoEmbedContainer.style.msTransform = "rotate("+ex_video_angle+"deg)";
			videoEmbedContainer.style.OTransform = "rotate("+ex_video_angle+"deg)";
			videoEmbedContainer.style.transform = "rotate("+ex_video_angle+"deg)";		
		} else {
			videoHandle.style.webkitTransform = "rotate("+ex_video_angle+"deg)";
			videoHandle.style.MozTransform = "rotate("+ex_video_angle+"deg)";
			videoHandle.style.msTransform = "rotate("+ex_video_angle+"deg)";
			videoHandle.style.OTransform = "rotate("+ex_video_angle+"deg)";
			videoHandle.style.transform = "rotate("+ex_video_angle+"deg)";
		}
	}
	
	ex_video_set_angle3d(ex_video_angle3d_x, ex_video_angle3d_y, ex_video_angle3d_z, ex_video_angle3d_p);

	return 1;
	
}

function ex_video_stop() {
	
	
	var videoHandle    = document.getElementById(ex_video_id);
	var videoContainer = document.getElementById(ex_video_container_id);
	var ytOverlay = document.getElementById(ex_video_embed_youtube_overlay_id);
	
	if (!videoHandle) { return 0; }
	
	if (ex_video_is_embed) {
		videoHandle.style.display = "none";
		clearInterval(ex_video_current_time_poll);
		ex_video_embed_player.stopVideo();
		ex_video_current_time = 0;
		ex_video_duration = 0;
		videoHandle.remove();
		videoContainer.remove();
		
		if (ytOverlay) {
			ytOverlay.remove();
		}
		
		ex_video_playing = 0;
		ex_video_paused  = 0;
		ex_video_loading = false;
		
		return 1;
		
	} else {
	
		videoHandle.style.display = 'none';
		videoHandle.pause();
		videoHandle.currentTime = 0;
		if (ex_video_loop == 0) { 
			videoHandle.removeEventListener('ended', ex_video_end_event, false);
		}
		
		videoHandle.removeEventListener('loadedmetadata', ex_video_loadedmetadata_event, false);
		videoHandle.remove();
		videoContainer.remove();
	
		ex_video_playing = 0;
		ex_video_paused  = 0;
		ex_video_loading = false;
	
		return 1;
	
	}
}

function ex_video_pause() {
	
	if (ex_video_is_embed) { 
		ex_video_embed_player.pauseVideo();
		ex_video_playing = 0;
		ex_video_paused  = 1;
		return 1;
	}
	
	var videoHandle = document.getElementById(ex_video_id);
	
	if (!videoHandle) { return 0; }
	
	if (ex_video_paused) {
		return 0;
	} else {
		
		videoHandle.pause();
		
		ex_video_playing = 0;
		ex_video_paused  = 1;
		
		return 1;
	}
	
}

function ex_video_resume() {
	
	if (ex_video_is_embed) { 
		ex_video_embed_player.playVideo();
		ex_video_playing = 1;
		ex_video_paused  = 0;
		return 1;
	}
	
	var videoHandle = document.getElementById(ex_video_id);
	
	if (!videoHandle) { return 0; }
	
	if (ex_video_paused) {
		
		videoHandle.play();
		
		ex_video_playing = 1;
		ex_video_paused  = 0;
		
		return 1;
	} else {
		return 0;
	}
	
}

function ex_video_is_playing()
{
	return ex_video_playing;
}

function ex_video_is_paused()
{
	return ex_video_paused;
}

function ex_video_set_position(positionX, positionY) {
	
	ex_video_position_x = positionX;
	ex_video_position_y = positionY;
	
	var canvasHandle = document.getElementById(ex_video_canvas);
	var videoHandle = document.getElementById(ex_video_id);
	
	if (videoHandle) {
		
		videoHandle.style.left = ex_video_position_x+"px";
		videoHandle.style.top =  ex_video_position_y+"px";
		
		if (ex_video_is_embed) {
			
		var videoEmbedContainer = document.getElementById(ex_video_embed_container_id);
		videoEmbedContainer.style.left = ex_video_position_x+"px";
		videoEmbedContainer.style.top = ex_video_position_y+"px";
		
		}
		
		return 1;
	}
	
	return 0;
}

function ex_video_get_position_x()
{
	return parseInt(ex_video_position_x, 10);
}

function ex_video_get_position_y()
{
	return parseInt(ex_video_position_y, 10);
}

function ex_video_set_size(width, height) {
	
	ex_video_width  = width+"px";
	ex_video_height = height+"px";
	
	var canvasHandle = document.getElementById(ex_video_canvas);
	var videoHandle = document.getElementById(ex_video_id);
	var videoContainer = document.getElementById(ex_video_container_id);
	
	if (videoHandle) {
		videoContainer.style.width = canvasHandle.width+"px";
		videoContainer.style.height = canvasHandle.height+"px";
		videoHandle.style.width = ex_video_width;
		videoHandle.style.height = ex_video_height;
		
		if (ex_video_is_embed) {
			
			var videoEmbedContainer = document.getElementById(ex_video_embed_container_id);
			videoEmbedContainer.style.width = ex_video_width+"px";
			videoEmbedContainer.style.height = ex_video_height+"px";	 
		}
		
		return 1;
	}
	
	return 0;
	
}

function ex_video_get_width()
{
	var canvasHandle = document.getElementById(ex_video_canvas);
	
	if (parseInt(ex_video_width, 10) == -1) {
		return parseInt(canvasHandle.width, 10);
	}
	
	return parseInt(ex_video_width, 10);
}

function ex_video_get_height()
{
	var canvasHandle = document.getElementById(ex_video_canvas);
	
	if (parseInt(ex_video_height, 10) == -1) {
		return parseInt(canvasHandle.height, 10);
	}
	
	return parseInt(ex_video_height, 10);
}

function ex_video_set_angle(degrees) {
	
	ex_video_angle = degrees;
	
	var videoHandle = document.getElementById(ex_video_id);
	
	if (videoHandle) {
		videoHandle.style.webkitTransform = "rotate("+ex_video_angle+"deg)";
		videoHandle.style.MozTransform = "rotate("+ex_video_angle+"deg)";
		videoHandle.style.msTransform = "rotate("+ex_video_angle+"deg)";
		videoHandle.style.OTransform = "rotate("+ex_video_angle+"deg)";
		videoHandle.style.transform = "rotate("+ex_video_angle+"deg)";
	}
	
	return 1;
}

function ex_video_set_angle3d(degreesX, degreesY, degreesZ, perspective) 
{
	
	ex_video_angle3d_x = degreesX;
	ex_video_angle3d_y = degreesY;
	ex_video_angle3d_z = degreesZ;
	ex_video_angle3d_p = perspective;
	
	var videoHandle = document.getElementById(ex_video_id);
	if (videoHandle) {
	
		videoHandle.style.webkitTransform = "";
		videoHandle.style.MozTransform = "";
		videoHandle.style.msTransform = "";
		videoHandle.style.OTransform = "";
		videoHandle.style.transform = "";
	
		videoHandle.style.webkitTransform += "rotateX("+ex_video_angle3d_x+"deg)";
		videoHandle.style.MozTransform += "rotateX("+ex_video_angle3d_x+"deg)";
		videoHandle.style.msTransform += "rotateX("+ex_video_angle3d_x+"deg)";
		videoHandle.style.OTransform += "rotateX("+ex_video_angle3d_x+"deg)";
		videoHandle.style.transform += "rotateX("+ex_video_angle3d_x+"deg)";
		
		videoHandle.style.webkitTransform += "rotateY("+ex_video_angle3d_y+"deg)";
		videoHandle.style.MozTransform += "rotateY("+ex_video_angle3d_y+"deg)";
		videoHandle.style.msTransform += "rotateY("+ex_video_angle3d_y+"deg)";
		videoHandle.style.OTransform += "rotateY("+ex_video_angle3d_y+"deg)";
		videoHandle.style.transform += "rotateY("+ex_video_angle3d_y+"deg)";
		
		videoHandle.style.webkitTransform += "rotateZ("+ex_video_angle3d_z+"deg)";
		videoHandle.style.MozTransform += "rotateZ("+ex_video_angle3d_z+"deg)";
		videoHandle.style.msTransform += "rotateZ("+ex_video_angle3d_z+"deg)";
		videoHandle.style.OTransform += "rotateZ("+ex_video_angle3d_z+"deg)";
		videoHandle.style.transform += "rotateZ("+ex_video_angle3d_z+"deg)";
		
		videoHandle.style.webkitTransform += "perspective("+ex_video_angle3d_p+")";
		videoHandle.style.transform += "perspective("+ex_video_angle3d_p+")";
	}
	
	return 1;
}

function ex_video_get_angle()
{
	return ex_video_angle;
}

function ex_video_get_angle3d_x()
{
	return ex_video_angle3d_x;
}

function ex_video_get_angle3d_y()
{
	return ex_video_angle3d_y;
}

function ex_video_get_angle3d_z()
{
	return ex_video_angle3d_z;
}

function ex_video_get_angle3d_perspective()
{
	return ex_video_angle3d_p;
}

function ex_video_set_scale_mode(scaleMode) {
	
	switch (scaleMode) {
		case "contain":
			ex_video_scale_mode = "contain";
			break;
		case "fill":
			ex_video_scale_mode = "fill";
			break;
		case "cover":
			ex_video_scale_mode = "cover";
			break;
		default:
			console.error(ex_video_error_invalid_scalemode); alert(ex_video_error_invalid_scalemode);
			return 0;
	}
	
	var videoHandle = document.getElementById(ex_video_id);
	if (videoHandle) {
		videoHandle.style.objectFit = ex_video_scale_mode;
	}
	
	return 1;
}

function ex_video_get_scale_mode()
{
	return ex_video_scale_mode;
}

function ex_video_set_track_position(trackPosition)
{
	if (ex_video_is_embed) { 
		if (ex_video_embed_player) {
			ex_video_embed_player.seekTo(trackPosition, true);
		}
	}
	
	var videoHandle = document.getElementById(ex_video_id);
	if (videoHandle) {
		videoHandle.currentTime = parseFloat(trackPosition).toFixed(2);
		return 1;
	} else {
		return 0;
	}	
}

function ex_video_get_track_position()
{
	if (ex_video_is_embed) { 
		return ex_video_current_time;
	}
	
	var videoHandle = document.getElementById(ex_video_id);
	if (videoHandle) {
		return videoHandle.currentTime.toFixed(2);
	} else {
		return 0;
	}
}

function ex_video_get_track_duration()
{
	var videoHandle = document.getElementById(ex_video_id);
	if (videoHandle) {
		return ex_video_duration.toFixed(2);
	} else {
		return 0;
	}
}

function ex_video_set_background_visibility(visible)
{
	if (visible) {
		ex_video_visibility = "#000000";
	} else {
		ex_video_visibility = "transparent";
	}
}

function ex_video_get_background_visibility()
{
	if (ex_video_visibility == "transparent") {
		return 0;
	} else {
		return 1;
	}
}

function ex_video_set_transparency(transparency)
{
	var videoHandle = document.getElementById(ex_video_id);
	var videoContainer = document.getElementById(ex_video_container_id);
	
	ex_video_opacity = transparency;
	
	if (videoHandle) {
		videoContainer.style.opacity = ex_video_opacity;
		videoHandle.style.opacity = ex_video_opacity;
		return 1;
	}
	
	return 0;
	
}

function ex_video_get_transparency()
{
	return ex_video_opacity;
}

function ex_video_get_type()
{
	return ex_video_type;
}

function ex_video_set_volume(volume) 
{
	
	var videoHandle    = document.getElementById(ex_video_id);
	var videoContainer = document.getElementById(ex_video_container_id);
	
	if (!videoHandle) { return 0; }
	
	// normalize 0-1 to 0-100(YT max volume)
	function normalize(value, maxValue){
	   return value*maxValue;
	}
	
	if (ex_video_is_embed) {
		ex_video_embed_player.setVolume(normalize(volume, 100));
	} else {
		videoHandle.volume = volume;
	}
	
	return 1;
}

function ex_video_get_volume() {
	
	var videoHandle    = document.getElementById(ex_video_id);
	var videoContainer = document.getElementById(ex_video_container_id);
	
	if (!videoHandle) { return 1; }

	// normalize 0-100(YT max volume) to 0-1
	function normalize(value, maxValue){
	   return value/maxValue;
	}
	
	if (ex_video_is_embed) {
		return normalize(ex_video_embed_player.getVolume(), 100);
	} else {
		return videoHandle.volume;
	}
}

function ex_video_is_ready() {

	var videoHandle    = document.getElementById(ex_video_id);
	var videoContainer = document.getElementById(ex_video_container_id);
	
	if (!videoHandle) { return 0; }
	
	if (ex_video_is_embed) {
		if (ex_video_embed_player.getPlayerState() === 3) {
			return 0;
		} else {
			return 1;
		}
	} else {
		if (ex_video_loop) {

			if (videoHandle.readyState === 1 || videoHandle.readyState === 4) {
				return 1;
			} else {
				return 0;
			}
		
		} else {
		
			if (videoHandle.readyState === 4) {
				return 1;
			} else {
				return 0;
			}
		
		}
	}

}
