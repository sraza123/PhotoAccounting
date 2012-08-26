<?php
// Abort early if there is nothing to process
// if (!isset($_POST['id'])) { die(); }
if (!isset($_POST['image_id']) || empty($_POST['image_id']) || $_POST['image_id'] < 1) { die(); }

// $dbconn is declared in this "include_once"
include_once "includes/db.php";

// Extract request parameters trimming spaces as well
$image_id = trim($_POST['image_id']);
$entry_date = trim($_POST['date']);
$text = trim($_POST['text']);
$amount = trim($_POST['amount']);
$account = trim($_POST['account']);
$offset_account = trim($_POST['offset_account']);

// START : validation
// Store errors in this array using keys similar to that on the page
$errors = array();

// Check date
if (empty($entry_date)) { 
	// $entry_date = 'null';
	$entry_date = date('Y-m-d'); 
} else {
	if (($timestamp = strtotime($entry_date)) === false) {
		$errors['date'] = 'Please use an accepted date format i.e. 25-02-2012';
	} else {
		$entry_date = date('Y-m-d', $timestamp); 
	}
}

// Check text
if (empty($text)) {
	// Funny enough, the next line saves the string 'null'
	// $text = null;
	$text = '';
} else {
	if (strlen($text) > 9999) {
		$errors['tekst'] = 'Please use a maximum of 9999 characters';
	}
}

// Check amount
if (empty($amount)) {
	$amount = 0;
} else {
	if (!is_numeric($amount)) {
		$errors['belob'] = 'Please use a number i.e. 2.00';
	}
}

// Check account
if (empty($account)) {
	$account = 'null';
} else {
	// Next line is not 100% reliable
	// if (!is_int($account)) {
	if ((string)(int)$account !== (string)$account) {
		$errors['konto'] = 'Please use an integer i.e. 3120';
	}
}

// Check offset_account
if (empty($offset_account)) {
	$offset_account = 'null';
} else {
	// Next line is not 100% reliable
	// if (!is_int($offset_account)) {
	if ((string)(int)$offset_account !== (string)$offset_account) {
		$errors['modkonto'] = 'Please use an integer i.e. 4488';
	}
}
// END : validation

// Init the returned object
$detail = new stdClass;
$detail->status = 1;
// $detail->image_id = $image_id;
$detail->image_id = (int)$image_id;
// $detail->errors = null;

// Check if we should do db operations based on validation errors
if (empty($errors)) {
	// Sanitize database inputs
	$image_id = pg_escape_string($image_id);
	$entry_date = pg_escape_string($entry_date);
	$text = pg_escape_string($text);
	$amount = pg_escape_string($amount);
	$account = pg_escape_string($account);
	$offset_account = pg_escape_string($offset_account);

	// Construct SQL query
	$query = "UPDATE entries SET "
		."entry_date = '{$entry_date}', "
		."text = '{$text}', "
		."amount = {$amount}, "
		."account = {$account}, "
		."offset_account = {$offset_account} "
		."WHERE image_id = {$image_id}";
	$result = pg_query($query); // or die('Query failed: ' . pg_last_error());

	// Evaluate result
	if (!$result) {
		$errors['common'] = pg_last_error();
		
		$detail->status = 0;
		$detail->errors = $errors;
	} 

	// Free resultset
	pg_free_result($result);
} else {
	$detail->status = 0;
	$detail->errors = $errors;
}

// Closing connection
pg_close($dbconn);

// Print results in JSON
echo json_encode($detail);
?>
