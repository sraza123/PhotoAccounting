<?php
// See sql/photo_accounting.sql for the relevant table structure & sample data

// Abort early if there is nothing to process
if (!isset($_POST['image_id']) || empty($_POST['image_id']) || $_POST['image_id'] < 1) { die(); }

// $dbconn is declared in this "include_once"
include_once "includes/db.php";

// Sanitize database inputs
$image_id = pg_escape_string($_POST['image_id']);

// Performing SQL query
$query = "SELECT id, entry_date, text, amount, account, offset_account FROM entries WHERE image_id = {$image_id}";
$result = pg_query($query) or die('Query failed: ' . pg_last_error());

// Get number of rows
$rows = pg_num_rows($result);

if ($rows == 0) {
	// Insert a new row with default values and get its id
	$create_query = "INSERT INTO entries (customer_id, entry_id, image_id) VALUES (1, {$image_id}, {$image_id}) RETURNING id";
	$create_result = pg_query($create_query); // or die('Create query failed: ' . pg_last_error());
	$create_row = pg_fetch_array($create_result);
	$create_id = $create_row[0];

	// Get the newly created row. Yes, we intentionally overwrite the earlier '$result' variable
	$query = "SELECT * FROM entries WHERE id = {$create_id}";
	$result = pg_query($query); // or die('Query failed: ' . pg_last_error());
}

// If a record was found, set it
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

