<?php

/** COPYRIGHT Time at Task Aps*/

/** Post-Cache means images to be kept in memory after having been viewed (so one can quickly go backwards in the image gallery.*/
define("POST_CACHE", 2);
define("PRE_CACHE", 5);


   /**
   * Iterates over a directory and returns file objects.
   *
   * @param string $dir
   * @param mixed $filter
   * @param bool $recursive defaults to false
   * @param bool $addDirs return directories as well as files - defaults to false
   * @return array
   * 
   */
  function getFilesInDir($dir, $filter='', $recursive=false, $addDirs=false){
   
      $res = array();

      $dirIterator = new DirectoryIterator($dir);
      while($dirIterator->valid()) {
          
      	if(!$dirIterator->isDot()) {
              $file = $dirIterator->getPathname(); 
              $isDir = is_dir($file); 
              if(!$isDir || $addDirs){
                  if(empty($filter) || fnmatch($filter, $file)){
                      $res[] = $file; 
                  }
              }
              if($isDir && $recursive){
                  $res = array_merge(
                               $res, 
                               getFilesInDir($file, $filter='', $recursive));
              }
          }  
          $dirIterator->next();

     }

     return $res;     
   
  }  


if(isset($_GET['imageID']) && isset($_GET['imageonly'])){
    $files = getImagesInDir('images');
    if(!isset($_GET['data'])){
        header("Content-type: image/png"); 
        echo file_get_contents($files[$_GET['imageID']-1]);
    }
    else{
        header("Content-type: image/png"); 
        echo file_get_contents($files[$_GET['imageID']]);
    }
    die();
}

function getImagesInDir($dir){
  //  return array_slice(array_merge(getFilesInDir('images', '*.jp*g',false, false), getFilesInDir('images','*.png',false, false)), 0, PRE_CACHE);
  return array_merge(getFilesInDir('images', '*.jp*g',false, false), getFilesInDir('images','*.png',false, false));
}

if(isset($_GET['getimages'])){
     // Get all images files in current directory
    $files = getImagesInDir('images');
    echo json_encode($files);
    die();
}

$files = getImagesInDir('images');

?>
<!DOCTYPE html>
<html lang="en">
<head>
   <meta charset="utf8"/>
   <link rel="stylesheet" type="text/css" href="css/jviewer.css">
   <script src="js/gsdom.js"></script>
   <script src="js/jviewer.js"></script>
   <script src="http://yui.yahooapis.com/3.5.1/build/yui/yui-min.js"></script>
  
   <script>
   var $ = function(id){
return document.getElementById(id);
}
var my_codes = Array();
my_codes['y'] = 'yyyy';
my_codes['a'] = 'aaaa';
my_codes['b'] = 'bbbb';
my_codes['x'] = 'xxxx';
document.onkeydown=function(e){
var valas = my_codes[String.fromCharCode(e.which).toLowerCase()];
if(valas != undefined) {
$('jsv_account').value = valas;
//comment out the next line if you want the cursor to stay in the field.
$('jsv_account').blur();
}
}
  JSViewer.start(<?php echo count($files); ?>, <?php echo POST_CACHE; ?>, <?php echo PRE_CACHE; ?>, <?php echo isset($_GET['imageID'])?$_GET['imageID']:0; ?>,my_codes);
  

  
   </script>
</head>
<body>

<article id="jsv_left">
	<div id="log"></div>
	<div id="log2"></div>
</article>
<article id="jsv_right">
	<div id="flash_errors"></div>
   <form id="jsv_form">
       <ul>
           <li>
                <label for="jsv_enclosure_number">Enclosure Number</label>
                <div><input type="text" name="jsv_enclosure_number" id="jsv_enclosure_number" value="1" size="10"/><span id="error_enclosure_number" class="field_error"></span></div>
           </li>
           <li>
                <label for="jsv_offset_account">Offset Account</label>
                <div><input type="text" name="jsv_offset_account" id="jsv_offset_account" size="10"/><span id="error_offset_account" class="field_error"></span></div>
           </li>
           <li>
                <label for="jsv_date">Date</label>
                <div><input type="text" name="jsv_date" id="jsv_date" size="10"/><span id="error_date" class="field_error"></span></div>
           </li>
           <li>
                <label for="jsv_account">Account</label>
                <div><input type="text" name="jsv_account" id="jsv_account" size="10"/><span id="error_account" class="field_error"></span></div>
           </li>
           <li>
                <label for="jsv_amount">amount</label>
                <div><input type="text" name="jsv_amount" id="jsv_amount" size="10"/><span id="error_amount" class="field_error"></span></div>
           </li>
           <li>
                <label for="jsv_text">Text</label>
                <div><textarea name="jsv_text" id="jsv_text" cols="41"></textarea><br/><span id="error_text" class="field_error"></span></div>
           </li>
       </ul>
   </form>
</article>
</body>
</html>
