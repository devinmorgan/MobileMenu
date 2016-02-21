<?php

echo "<table style='border: solid 1px black;'>";
echo "<tr><th>Id</th><th>Firstname</th><th>Lastname</th></tr>";

class TableRows extends RecursiveIteratorIterator {
	function __construct($iterator) {
		parent::__construct($iterator, self::LEAVES_ONLY);
	}

	function current() {
		return "<td style='width:150px;border:1px solid black;'>" .
		parent::current() . "</td>";
	}

	function beginChildren() {
		echo "<tr>";
		echo "hello";
	}

	function endChildren() {
		echo "</tr>" . "\n";
		echo "HELLO";
	}
}

$servername = "localhost";
$username = "devinm";
$password = "IlikeXAMPP2";
$dbname = "manageDB";


try {
	$connection = new PDO("mysql:host=$servername;dbname=$dbname",$username, $password);
	// set the PDO error mode to exception
	$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	// sql_query to delete a record
	$sql_query = "UPDATE MyGuests SET lastname='Doe' WHERE id=4";

	// Prepare statement
	$statement = $connection->prepare($sql_query);

	// execture the query
	$statement->execute();

	// echo a message to say the UPDATE succeeded
	echo $statement->rowCount() . " records UPDATED successfully";

}
catch(PDOException $exception) {
	echo "Error: " . $exception->getMessage();
}

$connection = null;
echo "</table>";

?>