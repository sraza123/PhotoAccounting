<?php

/** COPYRIGHT Time at Task Aps*/


define("POST_CACHE", 1);
define("PRE_CACHE", 1);

function base64_encode_image ($imagefile) {
  $imgtype = array('jpg', 'jpeg', 'gif', 'png');
  $filename = file_exists($imagefile) ? htmlentities($imagefile) : die('Image file name does not exist');
  $filetype = pathinfo($filename, PATHINFO_EXTENSION);
  if (in_array($filetype, $imgtype)){
    $imgbinary = fread(fopen($filename, "r"), filesize($filename));
  } 
  else {
    die ('Invalid image type, jpg, gif, and png is only allowed');
  }
  //  return 'data:image/' . $filetype . ';base64,' . base64_encode($imgbinary);
   return base64_encode($imgbinary);
}

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
        header("Content-type: png"); 
        echo file_get_contents($files[$_GET['imageID']-1]);
    }
    else{
        echo base64_encode_image($files[$_GET['imageID']]);
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
   <link rel="stylesheet" type="text/css" href="jviewer.css">
   <script src="gsdom.js"></script>
   <script src="jviewer.js"></script>
   <script src="http://yui.yahooapis.com/3.5.1/build/yui/yui-min.js"></script>
   <script>
  JSViewer.start(<?php echo count($files); ?>, <?php echo POST_CACHE; ?>, <?php echo PRE_CACHE; ?>, <?php echo isset($_GET['imageID'])?$_GET['imageID']:1; ?>);
   </script>
</head>
<body>
<article id="jsv_left">
  <div id="log"></div>
  <div id="log2"></div>
</article>
<article id="jsv_right">
   <form id="jsv_form">
       <ul>
           <li>
                <label for="jsv_bilag">Bilag</label>
                <div><input type="text" name="jsv_bilag" id="jsv_bilag" value="1" /></div>
           </li>
           <li>
                <label for="jsv_date">Date</label>
                <div><input type="text" name="jsv_date" id="jsv_date" /></div>
           </li>
           <li>
                <label for="jsv_tekst">Tekst</label>
                <div><textarea name="jsv_tekst" id="jsv_tekst"></textarea>
           </li>
           <li>
                <label for="jsv_belob">Belob</label>
                <div><input type="text" name="jsv_belob" id="jsv_belob" /></div>
           </li>
           <li>
                <label for="jsv_konto">Konto</label>
                <div><input type="text" name="jsv_konto" id="jsv_konto" /></div>
           </li>
       </ul>
   </form>
</article>
</body>
</html>
