<?php
// See sql/photo_accounting.sql for the relevant table structure & sample data

// Abort early if there is nothing to process
if (!isset($_POST['image_id'])) { 
	header("HTTP/1.1 500 Server error");
	die("Invalid request");
}

if ($_POST['image_id'] < 0) {
	header("HTTP/1.1 404 Not Found");
	die("Invalid request");
}

// $dbconn is declared in this "include_once"
require_once "includes/db.php";

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
$detail = array();
while ($row = pg_fetch_assoc($result)) {
	$detail = new stdClass;

	// This returns date strings like 2012-03-28
	// $detail->date = $row['entry_date'];

	// This returns date strings like 28-03-2012
	if (($timestamp = strtotime($row['entry_date'])) === false) {
		$detail->date = date('d-m-Y');
	} else {
		$detail->date = date('d-m-Y', $timestamp); 
	}

	$detail->text = $row['text'];
	$detail->amount = $row['amount'];
	$detail->account = $row['account'];
	$detail->offset_account = $row['offset_account'];
}

// Free resultset
pg_free_result($result);

// Closing connection
pg_close($dbconn);

// Print results in JSON
echo json_encode($detail);
