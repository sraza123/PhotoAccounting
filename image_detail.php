<?php
/*
-- -- The SQL to create the table in PostgreSQL is as follows :
CREATE TABLE entries (id SERIAL PRIMARY KEY, customer_id INT, entry_id INT, image_id INT, entry_date DATE, text VARCHAR(9999), amount NUMERIC(20, 2), account INT, offset_account INT);

-- -- The insert sample data like so :
INSERT INTO entries (customer_id, entry_id, image_id, entry_date, text, amount, account, offset_account) VALUES (1,1,1,'2012-08-14','TEST 1',1,1,1);
INSERT INTO entries (customer_id, entry_id, image_id, entry_date, text, amount, account, offset_account) VALUES (2,2,2,'2012-08-14','TEST 2',2,2,2);
INSERT INTO entries (customer_id, entry_id, image_id, entry_date, text, amount, account, offset_account) VALUES (5,5,5,'2012-08-14','TEST 5',5,5,5);
*/
// Abort early if there is nothing to process
if (!isset($_POST['id'])) { die(); }

// Connecting & selecting database
$dbconn = pg_connect("host=localhost dbname=photo_accounting user=postgres password=postgres")
    or die('Could not connect: ' . pg_last_error());

// Performing SQL query
$query = 'SELECT id, entry_date, text, amount, account, offset_account FROM entries WHERE image_id = ' . $_POST['id'];
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

// Print results
echo json_encode($detail);
?>
