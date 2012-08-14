/*jslint  browser: true, indent: 4, plusplus: true, eqeq: true, */
/** COPYRIGHT Time at Task */
JSViewer = function () {

    "use strict";

    // Globals
    var my_key_codes, current_image_index,
        $, renderImage, showPrevImage, showNextImage, keyDownHandler, keyUpHandler,
        setKeyboardHandlers, toggleArrows, addArrows, loadImage, cacheGroup, log, images;

    images = {};
    current_image_index = 0; // keep track of the current image being viewed

    /**
     * Creates a shortcut for document.getElementById
     *
     * @param {id} the did of the element we want to get
     * @return {html object} The html object element
     */
    $ = function (id) {
        return document.getElementById(id);
    };

    /**
     * Renders an image on the screen
     *
     * @param {Y} Yui3 object
     * @param {total_number_images} the total number of images
     * @return {null} 
     */
    renderImage = function (Y, image_data) {
        /*
         This sets the image src to the image data and reposition the image arrows,
         then focus on the konto field
       */
        $('jsv_image').src = image_data.src;
        $('jsv_bilag').value = String(current_image_index + 1);
        $('jsv_konto').focus();
        $('jsv_link').href = image_data.src;

        var pos_top = Y.one('#jsv_image').get('height') - 200;

        pos_top += 'px';
        Y.one('#arrow_left').setStyle('bottom', pos_top);
        Y.one('#arrow_right').setStyle('bottom', pos_top);
    };

    log = function (m) {
        if (window.console) {
            window.console.log(m);
        }
    };

    /**
     * Renders the previous image on the screen
     *
     * @param {Y} Yui3 object
     * @param {total_number_images} the total number of images
     * @param {POST_CACHE} this is the number of images to render before we start caching again
     * @param {PRE_CACHE} this is the number of images to cached at a time
     * @return {null} 
     */
    showPrevImage = function (Y, total_number_images, POST_CACHE, PRE_CACHE) {
        return function (e) {
            if (e) {
                e.stopPropagation();
            }

            if (current_image_index > 0) {
                current_image_index--;
            }

            log(current_image_index);

            if (!images[current_image_index]) {
                cacheGroup(current_image_index, PRE_CACHE);
            }

            try {
              renderImage(Y, images[current_image_index]);
            } catch(e) {
              log(e)
            }
        };
    };

    /**
     * Renders the next image on the screen
     *
     * @param {Y} Yui3 object
     * @param {total_number_images} the total number of images
     * @param {POST_CACHE} this is the number of images to render before we start caching again
     * @param {PRE_CACHE} this is the number of images to cached at a time
     * @return {null} 
     */
    showNextImage = function (Y, total_number_images, POST_CACHE, PRE_CACHE) {
        return function (e) {
            if (e) {
                e.stopPropagation();
            }
            if ((current_image_index+1) < total_number_images) {
                current_image_index++;
            }

            log(current_image_index);

            renderImage(Y, images[current_image_index]);

            cacheGroup(current_image_index, PRE_CACHE);
        };
    };

    /**
     * Handles a keydown press
     *
     * @param {Y} Yui3 object
     * @param {total_number_images} the total number of images
     * @param {POST_CACHE} this is the number of images to render before we start caching again
     * @param {PRE_CACHE} this is the number of images to cached at a time
     * @return {null} 
     */
    keyDownHandler = function (Y, total_number_images, POST_CACHE, PRE_CACHE) {
        return function (e) {
            e.preventDefault();

            switch (e.keyCode) {
            case 13: // enter
            case 87: // w (next)
                showNextImage(Y, total_number_images, POST_CACHE, PRE_CACHE)(e);
                break;
            case 81: //q (previous)
                showPrevImage(Y, total_number_images, POST_CACHE, PRE_CACHE)(e);
                break;
            }
        };
    };

    /**
     * Handles a keyup event
     *
     * @param {Y} Yui3 object
     * @param {total_number_images} the total number of images
     * @param {POST_CACHE} this is the number of images to render before we start caching again
     * @param {PRE_CACHE} this is the number of images to cached at a time
     * @return {null} 
     */
    keyUpHandler = function (Y, total_number_images, POST_CACHE, PRE_CACHE) {
        return function (e) {
            e.preventDefault();

            var valas = my_codes[String.fromCharCode(e.keyCode).toLowerCase()];

            if (valas != undefined) {
                showNextImage(Y, total_number_images, POST_CACHE, PRE_CACHE)(e);
            }
        };
    };

    /**
     * Initialize the keyboard handlers
     *
     * @param {Y} Yui3 object
     * @param {total_number_images} the total number of images
     * @param {POST_CACHE} this is the number of images to render before we start caching again
     * @param {PRE_CACHE} this is the number of images to cached at a time
     * @return {null} 
     */
    setKeyboardHandlers = function (Y, total_number_images, POST_CACHE, PRE_CACHE) {
        Y.one('doc').on("key", keyDownHandler(Y, total_number_images, POST_CACHE, PRE_CACHE), 'enter,81,87');
        Y.one('doc').on("keyup", keyUpHandler(Y, total_number_images, POST_CACHE, PRE_CACHE));
    };

    /**
     * Handles hiding and showing of arrows
     *
     * @param {Y} Yui3 object
     * @param {show} if true, show the arrow, otherwise, hide them
     * @return {null} 
     */
    toggleArrows = function (Y, show) {
        return function (e) {
            Y.one('#arrow_left').setStyle('display', (show ? 'inline' : 'none'));
            Y.one('#arrow_right').setStyle('display', (show ? 'inline' : 'none'));
        };
    };

    /**
     * Add navigation arrows to the image
     *
     * @param {Y} Yui3 object
     * @param {POST_CACHE} this is the number of images to render before we start caching again
     * @param {PRE_CACHE} this is the number of images to cached at a time
     * @return {null} 
     */
    addArrows = function (Y, total_number_images, POST_CACHE, PRE_CACHE) {
        var pos_top, arrowLeft, arrowRight;

        pos_top = Y.one('#jsv_image').get('height') - 200;

        pos_top += 'px';

        arrowLeft = $a({
            'id': 'arrow_left',
            'href': '#',
            'style': 'display:none;text-decoration: none !important; font-weight: bold; font-size: 70px; color: #CC0000;position:absolute;bottom:' + pos_top + ';left:0;z-index:9999999'
        }, '<');

        arrowRight = $a({
            'id': 'arrow_right',
            'href': '#',
            'style': 'display:none;text-decoration: none; font-weight: bold; font-size: 70px; color: #CC0000;position:absolute;bottom:' + pos_top + ';z-index:999999'
        }, '>');

        $('jsv_link').appendChild(arrowLeft);
        $('jsv_link').appendChild(arrowRight);

        Y.one('#jsv_link').on('mouseover', toggleArrows(Y, true));
        Y.one('#jsv_link').on('mouseout', toggleArrows(Y, false));

        Y.one(arrowRight).on('click', showNextImage(Y, total_number_images, POST_CACHE, PRE_CACHE));
        Y.one(arrowLeft).on('click', showPrevImage(Y, total_number_images, POST_CACHE, PRE_CACHE));

    };

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
    loadImage = function (imageID) {
        var i = new Image()
        i.src = "?imageID=" + imageID + '&data=1&imageonly=1';

        images[imageID] = i;
    };

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
    cacheGroup = function (from, PRE_CACHE) {
        var i = 0, n;

        if (from > 0) {
            loadImage(from - 1);
            for (n = from - 2; n > 0; n--) {
              images[n] = null;
            }
        }
        for (i = 0; i < PRE_CACHE; i++) {
            loadImage(from + i);
        }
    };

    return {

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
        start : function (total_number_images, POST_CACHE, PRE_CACHE, from, key_codes) {

            my_key_codes = key_codes;

            YUI().use("io", "dump", "json-parse", 'node', 'event', 'transition', 'node-load', 'anim',  function (Y) {
                /*
                    We cache PRE_CACHE number of images at a time, starting from the first image
                */
                current_image_index = from;
                $('jsv_bilag').value = String(current_image_index + 1);

                cacheGroup(current_image_index, PRE_CACHE);

                var imageID = current_image_index;

                if (!$('jsv_image')) {
                    var image_link, first_image;
                    image_link = $a({
                        'style': 'position:relative;text-decoration:none;',
                        'id': 'jsv_link',
                        'href': '?imageID=' + imageID
                    });

                    first_image = $img({
                        'id': 'jsv_image',
                        'src': '?imageID=' + from + '&data=1&imageonly=1'
                    });

                    image_link.appendChild(first_image);

                    $('jsv_left').appendChild(image_link);

                    addArrows(Y, total_number_images, POST_CACHE, PRE_CACHE);
                    setKeyboardHandlers(Y, total_number_images, POST_CACHE, PRE_CACHE);
                }

                $('log').innerHTML = "";

                renderImage(Y, images[imageID]);
            });



        },
        debug: function() {
            log(images);
            log(current_image_index);
        }
    };

}();