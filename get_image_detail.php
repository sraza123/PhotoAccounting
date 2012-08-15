<?php
// See sql/photo_accounting.sql for the relevant table structure & sample data

// Abort early if there is nothing to process
if (!isset($_POST['image_id'])) { die(); }

// $dbconn is declared in this "include_once"
include_once "includes/db.php";

// Sanitize database inputs
$image_id = pg_escape_string($_POST['image_id']);

// Performing SQL query
$query = "SELECT id, entry_date, text, amount, account, offset_account FROM entries WHERE image_id = {$image_id}";
$result = pg_query($query) or die('Query failed: ' . pg_last_error());

// Store results
$detail = null;
while ($row = pg_fetch_assoc($result)) {
	$detail = new stdClass;
	$detail->date = $row['entry_date'];
	$detail->tekst = $row['text'];
	$detail->belob = $row['amount'];
	$detail->konto = $row['account'];
	$detail->modkonto = $row['offset_account'];
}

// Free resultset
pg_free_result($result);

// Closing connection
pg_close($dbconn);

// Print results in JSON
echo json_encode($detail);
?>

