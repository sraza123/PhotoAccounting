<?php
// Abort early if there is nothing to process
// if (!isset($_POST['id'])) { die(); }
if (!isset($_POST['image_id'])) { die(); }

// $dbconn is declared in this "include_once"
include_once "includes/db.php";

// Sanitize database inputs
// $id = pg_escape_string($_POST['id']);
// $image_id = pg_escape_string($_POST['id']);
$image_id = pg_escape_string($_POST['image_id']);
$entry_date = pg_escape_string($_POST['date']);
$text = pg_escape_string($_POST['tekst']);
$amount = pg_escape_string($_POST['belob']);
$account = pg_escape_string($_POST['konto']);
$offset_account = pg_escape_string($_POST['modkonto']);

// Construct SQL query
$query = "UPDATE entries SET "
	."entry_date = '{$entry_date}', "
	."text = '{$text}', "
	."amount = '{$amount}', "
	."account = '{$account}', "
	."offset_account = '{$offset_account}' "
	."WHERE image_id = {$image_id}";
$result = pg_query($query); // or die('Query failed: ' . pg_last_error());

// Evaluate result
$detail = new stdClass;
$detail->status = 1;
$detail->message = 'OK';
if (!$result) {
	$detail->status = 0;
	$detail->message = pg_last_error();
} 

// Free resultset
pg_free_result($result);

// Closing connection
pg_close($dbconn);

// Print results in JSON
echo json_encode($detail);
?>
