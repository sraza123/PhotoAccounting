/** COPYRIGHT Time at Task */
JSViewer = function () {

    // Globals
    var my_key_codes;
    var cached_count = 0;
    var cache_group = 1;
    var image_index = 0; // keep track of image being cached
    var current_image_index = 0; // keep track of the current image being viewed

     /**
      * Creates a shortcut for document.getElementById
      *
      * @param {id} the did of the element we want to get
      * @return {html object} The html object element
      */
     var $ = function (id) {
         return document.getElementById(id);
     }

     /**
      * Renders an image on the screen
      *
      * @param {Y} Yui3 object
      * @param {total_number_images} the total number of images
      * @return {null} 
      */
     var renderImage = function (Y, total_number_images, image_data) {
         if (current_image_index > total_number_images-1) {
             current_image_index = total_number_images-1;
         }
         else if (current_image_index < 0) {
             current_image_index = 0;
         }
         else if (!localStorage.getItem('img-'+current_image_index)) {
             current_image_index--;
         }
         else {
             /*
               This sets the image src to the image data and reposition the image arrows,
               then focus on the konto field
             */
              $('jsv_image').src='data:image/png;base64,' +image_data;
              $('jsv_bilag').value = current_image_index*1+1+'';
              $('jsv_konto').focus();
              $('jsv_link').href = '?imageID='+(current_image_index+1)+'&imageonly=1';
              var pos_top = Y.one('#jsv_image').get('height')-200;
              pos_top+='px';
              Y.one('#arrow_left').setStyle('bottom',pos_top);
              Y.one('#arrow_right').setStyle('bottom',pos_top);

         }
     }

     /**
      * Renders the previous image on the screen
      *
      * @param {Y} Yui3 object
      * @param {total_number_images} the total number of images
      * @param {POST_CACHE} this is the number of images to render before we start caching again
      * @param {PRE_CACHE} this is the number of images to cached at a time
      * @return {null} 
      */
     var showPrevImage = function (Y,total_number_images,POST_CACHE, PRE_CACHE) {
         return function (e) {
             if (e) {
                   e.stopPropagation();
             }

             current_image_index--;
             if (current_image_index>=0) {
                if (localStorage.getItem('img-'+current_image_index)) {
                    renderImage(Y,total_number_images, localStorage.getItem('img-'+current_image_index));
                }
                else {
                    // alert("No more images");
                }
             }
         }
     }

     /**
      * Renders the next image on the screen
      *
      * @param {Y} Yui3 object
      * @param {total_number_images} the total number of images
      * @param {POST_CACHE} this is the number of images to render before we start caching again
      * @param {PRE_CACHE} this is the number of images to cached at a time
      * @return {null} 
      */
     var showNextImage = function (Y,total_number_images,POST_CACHE, PRE_CACHE) {
         return function (e) {
                 if (e) {
                      e.stopPropagation();
                  }
                  // Check if we need to preload some more images
                  if ((current_image_index+1) % POST_CACHE == 0) {
                      cache_group++;
                      // Cache the next group of images
                      if (PRE_CACHE*(cache_group-1)<total_number_images) {
                          cacheGroup(Y, PRE_CACHE*(cache_group-1), total_number_images, POST_CACHE, PRE_CACHE);
                      }
                  }
                 if (localStorage.getItem('img-'+(current_image_index*1+1))) {
                     current_image_index++;
                      renderImage(Y,total_number_images,localStorage.getItem('img-'+current_image_index));
                }
         }
     }

     /**
      * Handles a keydown press
      *
      * @param {Y} Yui3 object
      * @param {total_number_images} the total number of images
      * @param {POST_CACHE} this is the number of images to render before we start caching again
      * @param {PRE_CACHE} this is the number of images to cached at a time
      * @return {null} 
      */
     var keyDownHandler = function (Y,total_number_images,POST_CACHE, PRE_CACHE) {
          return function (e) {
              e.preventDefault();
              switch(e.keyCode) {
              case 13: // enter
              case 87: // w (next)
                  showNextImage(Y,total_number_images,POST_CACHE, PRE_CACHE)(e);
                break;
              case 81: //q (previous)
                  showPrevImage(Y,total_number_images,POST_CACHE, PRE_CACHE)(e);
                break;
              }
          }
      }

     /**
      * Handles a keyup event
      *
      * @param {Y} Yui3 object
      * @param {total_number_images} the total number of images
      * @param {POST_CACHE} this is the number of images to render before we start caching again
      * @param {PRE_CACHE} this is the number of images to cached at a time
      * @return {null} 
      */
     var keyUpHandler = function (Y,total_number_images,POST_CACHE, PRE_CACHE) {
         return function (e) {
              e.preventDefault();
              var valas = my_codes[String.fromCharCode(e.keyCode).toLowerCase()];
              if (valas != undefined) {
                      current_image_index++;
                      renderImage(Y,total_number_images,localStorage.getItem('img-'+current_image_index));
              }
              /*switch(e.keyCode) {
              case 65:
                current_image_index++;
                renderImage(Y,total_number_images,localStorage.getItem('img-'+current_image_index));
                break;
              }*/
          }
      }

     /**
      * Initialize the keyboard handlers
      *
      * @param {Y} Yui3 object
      * @param {total_number_images} the total number of images
      * @param {POST_CACHE} this is the number of images to render before we start caching again
      * @param {PRE_CACHE} this is the number of images to cached at a time
      * @return {null} 
      */
     var setKeyboardHandlers = function (Y, total_number_images,POST_CACHE, PRE_CACHE) {
         Y.one('doc').on("key", keyDownHandler(Y,total_number_images, POST_CACHE, PRE_CACHE), 'enter,81,87');
         Y.one('doc').on("keyup", keyUpHandler(Y,total_number_images, POST_CACHE, PRE_CACHE));
     }

     /**
      * Handles connection error when trying to get image data from the server
      *
      * @return {function} 
      */
     var getImageDataFailure = function () {
         return function (x,o) {
         }
     }

     /**
      * Handles hiding and showing of arrows
      *
      * @param {Y} Yui3 object
      * @param {show} if true, show the arrow, otherwise, hide them
      * @return {null} 
      */
      var toggleArrows = function (Y, show) {
         return function (e) {
             Y.one('#arrow_left').setStyle('display', (show?'inline':'none'));
             Y.one('#arrow_right').setStyle('display', (show?'inline':'none'));
         }
     }

     /**
      * Add navigation arrows to the image
      *
      * @param {Y} Yui3 object
      * @param {POST_CACHE} this is the number of images to render before we start caching again
      * @param {PRE_CACHE} this is the number of images to cached at a time
      * @return {null} 
      */
     var addArrows = function (Y,total_number_images,POST_CACHE, PRE_CACHE) {
         var pos_top = Y.one('#jsv_image').get('height')-200;
         pos_top+='px';
         var arrowLeft = $a({'id':'arrow_left','href':'#', 'style': 'display:none;text-decoration: none !important; font-weight: bold; font-size: 70px; color: #CC0000;position:absolute;bottom:'+pos_top+';left:0;z-index:9999999'}, '<');
         var arrowRight = $a({'id':'arrow_right','href':'#', 'style': 'display:none;text-decoration: none; font-weight: bold; font-size: 70px; color: #CC0000;position:absolute;bottom:'+pos_top+';z-index:999999'}, '>');

         $('jsv_link').appendChild(arrowLeft);
         $('jsv_link').appendChild(arrowRight); 

         Y.one('#jsv_link').on('mouseover', toggleArrows(Y, true));
         Y.one('#jsv_link').on('mouseout', toggleArrows(Y, false));

         Y.one(arrowRight).on('click', showNextImage(Y,total_number_images,POST_CACHE, PRE_CACHE));
         Y.one(arrowLeft).on('click', showPrevImage(Y,total_number_images,POST_CACHE, PRE_CACHE));

     }

     /**
      * After we get the image data we render the image data on the screen
      *
      * @param {Y} Yui3 object
      * @param {imageID} the id of image we want to get
      * @param {total_number_images} the total number of images
      * @param {POST_CACHE} this is the number of images to render before we start caching again
      * @param {PRE_CACHE} this is the number of images to cached at a time
      * @return {function} 
      */
     var getImageDataSuccess = function (Y,imageID,total_number_images, POST_CACHE, PRE_CACHE, isFirst) {
         return function (x,o) {
          /*
            Once we have the image data we save it to local storage, and if we have finished caching 
            the first group of images, we render the first image on the screen.
          */
             try{
                 if (!$('jsv_image')) {
                     $('log').innerHTML = "";
                 }
                 if (isFirst) {
                     if (!$('jsv_image')) {
                        var image_link = $a({'style':'position:relative;text-decoration:none;','id':'jsv_link','href':'?imageID='+imageID});
                        var first_image = $img({'id':'jsv_image','src':'data:image/png;base64,' +o.responseText});
                        image_link.appendChild(first_image);
                             $('jsv_left').appendChild(image_link);
                        addArrows(Y, total_number_images,POST_CACHE, PRE_CACHE);
                        setKeyboardHandlers(Y, total_number_images, POST_CACHE, PRE_CACHE);
                     }
                     else {

                     }
                     $('log').innerHTML = "";
                 }
                     localStorage.setItem('img-'+imageID+'', o.responseText);
                 cached_count++;
                  } 
             catch (e) {
                 alert(e+ 'imageID='+imageID);
             }
         }
     }

     /**
      * Use ajax to get the image data
      *
      * @param {Y} Yui3 object
      * @param {imageID} the id of image we want to get
      * @param {total_number_images} the total number of images
      * @param {POST_CACHE} this is the number of images to render before we start caching again
      * @param {PRE_CACHE} this is the number of images to cached at a time
      * @return {null} 
      */
     var loadImageToLocalStorage = function (Y,imageID,total_number_images,POST_CACHE, PRE_CACHE, isFirst) {
          /*
           This get the images data for an image from the server
           and if successful, saves it to local storage
          */
          var cfg = {
               on : {
                  success : getImageDataSuccess(Y,imageID,total_number_images, POST_CACHE, PRE_CACHE, isFirst),
                  failure : getImageDataFailure()
               }
          }
          Y.io("?imageID="+imageID+'&data=1&imageonly=1', cfg);
      }

     /**
      * Use ajax to get the image data
      *
      * @param {Y} Yui3 object
      * @param {from} position to start getting images from
      * @param {total_number_images} the total number of images
      * @param {POST_CACHE} this is the number of images to render before we start caching again
      * @param {PRE_CACHE} this is the number of images to cached at a time
      * @return {null} 
      */
     var cacheGroup = function (Y, from, total_number_images, POST_CACHE, PRE_CACHE) {
          var i = 0;
          cached_count = 0;
          /*
          We get the image data for each image from the server and save it to local storage
          */
          for(i=0;i<PRE_CACHE;i++) {
              loadImageToLocalStorage(Y,from+i,total_number_images,POST_CACHE, PRE_CACHE, i==0);
          }
      }

     /**
      * Use ajax to get the image data
      *
      * @param {Y} Yui3 object
      * @param {from} position to start getting images from
      * @param {total_number_images} the total number of images
      * @param {POST_CACHE} this is the number of images to render before we start caching again
      * @param {PRE_CACHE} this is the number of images to cached at a time
      * @return {null} 
      */
     var cachePreviousGroup = function (Y, from, total_number_images, POST_CACHE, PRE_CACHE) {
          var i = 0;
          cached_count = 0;
          /*
          We get the image data for each image from the server and save it to local storage
          */
          for(i=0;i<PRE_CACHE;i++) {
              loadImageToLocalStorage(Y,from-i,total_number_images,POST_CACHE, PRE_CACHE, i==0);
          }
      }
       
       return{

            /**
            * Initializes the Yui3 object and gets things rolling,.
            *
            * @param {Y} Yui3 object
            * @param {from} position to start getting images from
            * @param {total_number_images} the total number of images
            * @param {POST_CACHE} this is the number of images to render before we start caching again
            * @param {PRE_CACHE} this is the number of images to cached at a time
            * @return {null} 
            */
           start : function (total_number_images, POST_CACHE, PRE_CACHE, from,key_codes) {
           
           my_key_codes = key_codes;

              YUI().use("io", "dump", "json-parse", 'node', 'event', 'transition', 'node-load', 'anim',  function (Y) {
                    /*
                      We use html5 local storage to store image, but first we need to clear local storage.
                    */
                    localStorage.clear();

                    /*
                      We cache PRE_CACHE number of images at a time, starting from the first image
                    */
                    current_image_index = from-1;
                       $('jsv_bilag').value = current_image_index*1+1+'';
                    cacheGroup(Y, current_image_index, total_number_images, POST_CACHE, PRE_CACHE);

                    // If we're not starting from the beginning, then we also need to cache the previous images
                    if (current_image_index>0) {
                            cachePreviousGroup(Y, current_image_index, total_number_images, POST_CACHE, PRE_CACHE);
                    }

               });
           },

               
       }

}();



