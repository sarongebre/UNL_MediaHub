var jQuery = WDN.jQuery;
var player = null;
var mediaDetails = function() {
	var video;
	return {
		imageURL : 'http://itunes.unl.edu/thumbnails.php?url=',
		
		setVideoType : function(){
		
		},
		
		updateDuration : function() {
			if (!player){
				WDN.jQuery('#itunes_duration').attr('value', mediaDetails.findDuration(WDN.videoPlayer.createFallback.getCurrentInfo('duration')));
			} else {
				WDN.log(player.media.duration);
				WDN.jQuery('#itunes_duration').attr('value', mediaDetails.findDuration(player.media.duration));
			}
		},
		
		findDuration : function(duration) {
			return mediaDetails.formatTime(duration);
		},
		
		updateThumbnail : function(currentTime) {
			WDN.jQuery('#imageOverlay').css({'height' : WDN.jQuery("#thumbnail").height()-20 +'px' ,'width' : WDN.jQuery("#thumbnail").width()-60 +'px' }).show();
			var newThumbnail = new Image();
			newThumbnail.src = mediaDetails.imageURL + '&time='+mediaDetails.formatTime(currentTime)+'&rebuild';
			WDN.log(newThumbnail.src);
			newThumbnail.onload = function() {
				WDN.jQuery('#thumbnail').attr('src', newThumbnail.src).ready(function() {
					WDN.jQuery('#imageOverlay').hide();
				});
			};
		},
		
		currentPostion : function(video) {
			return mediaDetails.formatTime(video.currentTime);
		},
		
		formatTime : function(totalSec) { //time is coming in milliseconds
		    WDN.log(totalSec);
			hours = parseInt( totalSec / 3600 ) % 24;
			minutes = parseInt( totalSec / 60 ) % 60;
			seconds = Math.round(((totalSec % 60)*100)/100);

			return ((hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds));
		},

		/**
		 * Check if the given URL meets requirements
		 * 
		 * @return bool
		 */
		validURL : function(url) {
			unl_check = /^http:\/\/([^\/]+)\.unl\.edu\/(.*)/;
	        var r = unl_check.exec(url);
	        if (r == null) {
	            alert('Sorry, you must use a .unl.edu URL, or upload a valid file.');
	            return false;
	        }
	        return true;
		},

		// Grab the preview markup for the URL requested
		getPreview : function(url) {
			WDN.jQuery('#headline_main').html('Generating a thumbnail and setting up the media player. <img src="/wdn/templates_3.0/scripts/plugins/tinymce/themes/advanced/skins/unl/img/progress.gif" alt="progress animated gif" />');
			WDN.get('?view=mediapreview&format=partial&url='+url, function(data, textStatus){

				// Place the preview markup into the preview div
				WDN.jQuery('#headline_main').html(data).ready(function(){
		    		mediaDetails.scalePlayer();
		    		//Wait for it to scale and then load the mediaelement player.
		    		WDN.jQuery('#jwPlayer_0, video').load(function(){
		    			jQuery.getScript('http://www.unl.edu/wdn/templates_3.0/scripts/mediaelement.js', function(){
		    				player = new MediaElementPlayer('#player');
		    			});
		    		});
				});
				
			});
		},

		scalePlayer: function() {
			// Now scale down the player
			var thumbnail = new Image();
			thumbnail.src = WDN.jQuery('#thumbnail').attr('src')+'&time='+mediaDetails.formatTime(0);
			thumbnail.onload = function(){
				var calcHeight = (this.height * 460)/this.width;
				WDN.jQuery('#jwPlayer_0, video').attr('height', calcHeight);
				WDN.jQuery('#jwPlayer_0, video').attr('width', 460);
				WDN.jQuery('#videoDisplay object').attr('style', 'width:460px;height:'+calcHeight);
				WDN.jQuery('#thumbnail').attr('src', thumbnail.src);
			};
			thumbnail.onerror = '';
		}
	};
}();
WDN.jQuery(document).ready(function() {
    if (formView == 'edit'){ //we're editting, so hide the introduction and go straight to the form
    	
        WDN.jQuery("#feedlist").hide();
        WDN.jQuery("#formDetails, #formDetails form, #formDetails fieldset, #continue3").not("#addMedia").css({"display" : "block"});
        WDN.jQuery(".headline_main").css({"display" : "inline-block"});
        WDN.jQuery("#formDetails").removeClass("two_col right").addClass('four_col left');
    	if (mediaType == 'video') {
    		mediaDetails.imageURL = mediaDetails.imageURL + escape(WDN.jQuery("#url").val());
    		mediaDetails.scalePlayer();
    	}
    	WDN.jQuery("#fileUpload").hide();
    }
    WDN.jQuery("#mediaSubmit").click(function(event) { //called when a user adds video

    		if (document.getElementById("file_upload").value == '') {
    			if (!mediaDetails.validURL(document.getElementById("url").value)) {
    				return false;
    			}
    			mediaDetails.getPreview(WDN.jQuery("#url").val());
    			event.preventDefault();

    		} else {
    			// Hide the url field, user is uploading a file
    			WDN.jQuery('#media_url').closest('li').hide();
    		}

    		WDN.jQuery('#fileUpload').hide();

            WDN.jQuery("#addMedia, #feedlist").slideUp(400, function() {
                WDN.jQuery("#headline_main").slideDown(400, function() {
                    WDN.jQuery("#media_form").show().css({"width" : "930px"}).parent("#formDetails").removeClass("two_col right");
                    WDN.jQuery("#existing_media, #enhanced_header, #feedSelect, #maincontent form.zenform #continue3").slideDown(400);
                    WDN.jQuery("#media_url").attr("value", WDN.jQuery("#url").val());
                    WDN.jQuery(this).css('display', 'inline-block');
                });
            });

        });

    WDN.jQuery('a#setImage').click(function(){
    	var currentTime;
    	if (!player){
    		currentTime = WDN.videoPlayer.createFallback.getCurrentPosition() + .01;
    	} else {
    		currentTime = player.getCurrentTime();
    	}
    	
    	mediaDetails.updateThumbnail(currentTime);
    	return false;
    });
    
    //deal with the outpost extra information
    WDN.jQuery("#itunes_header ol").hide();
    WDN.jQuery("#mrss_header ol").hide();
    
    WDN.jQuery("#itunes_header legend").click(function() {
      WDN.jQuery("#itunes_header ol").toggle(400);
      return false;
    });
    WDN.jQuery("#mrss_header legend").click(function() {
      WDN.jQuery("#mrss_header ol").toggle(400);
      return false;
    });
    
    WDN.jQuery('span.embed').colorbox({inline: true, href:'#sharing', width:'600px', height:'310px'});
    WDN.jQuery.validation.addMethod('geo_long', 'This must be a valid longitude.', {min:-180, max:180});
    WDN.jQuery.validation.addMethod('geo_lat', 'This must be a valid latitude.', {min:-90, max:90});
    WDN.jQuery('#media_form').validation();
    
    //water info.
    if (WDN.jQuery('#water_cfs').val() == '') {
      WDN.jQuery('#water_cfs_form').hide();
    }
    
    if (WDN.jQuery('#water_maf').val() == '') {
        WDN.jQuery('#water_maf_form').hide();
    }
    
    WDN.jQuery('#show_cfs').click(function(){
      WDN.jQuery('#water_cfs_form').show();
      WDN.jQuery('#water_maf_form').hide();
      return false;
    });
    
    WDN.jQuery('#show_maf').click(function(){
      WDN.jQuery('#water_maf_form').show();
      WDN.jQuery('#water_cfs_form').hide();
      return false;
    });
    
    WDN.jQuery('#media_form').submit(function() {
        WDN.jQuery('#continue3').attr('disabled', 'disabled');
    })
    
    //Collapisible forms.
    WDN.jQuery('.collapsible > legend').append("<span class='toggle'>Expand</span>");
    WDN.jQuery('.collapsible > ol').hide();
    WDN.jQuery('.collapsible > legend').click(function(){
        if (WDN.jQuery(this).next('ol').is(":visible")) {
            WDN.jQuery(this).next('ol').hide(200);
            WDN.jQuery(this).find('.toggle').html('Expand');
        } else {
            WDN.jQuery(this).next('ol').show(200);
            WDN.jQuery(this).find('.toggle').html('Collapse');
        }
    });
});
WDN.loadJS("/wdn/templates_3.0/scripts/plugins/tinymce/jquery.tinymce.js", function() {
    WDN.jQuery("textarea#description").tinymce({
            // Location of TinyMCE script
            script_url : "/wdn/templates_3.0/scripts/plugins/tinymce/tiny_mce.js",
            theme : "advanced",
            skin : "unl",
            
            // Theme options
	        theme_advanced_buttons1 : "bold,italic,underline,strikethrough,|,|,bullist,numlist,|,link,unlink,anchor,|,removeformat,cleanup,help,code,styleselect,formatselect",
	        theme_advanced_buttons2 : "",
	        theme_advanced_buttons3 : "",
	        theme_advanced_toolbar_location : "top",
	        theme_advanced_toolbar_align : "left",
	        theme_advanced_statusbar_location : "bottom",
	        theme_advanced_resizing : true,
            theme_advanced_row_height : 33
    });
});