<?php
// Connecting & selecting database
$dbconn = pg_connect("host=localhost dbname=photo_accounting user=postgres password=postgres")
    or die('Could not connect: ' . pg_last_error());
?>
