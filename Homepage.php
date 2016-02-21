<?php

// for right now, I will declare the restaurant_identifier manually,
// instead of having to log in to set it
session_start();
$_SESSION['restaurant_identifier'] = NULL;
$_SESSION["restaurant_name"] = NULL;

$servername = "localhost";
$username = "nerdsrockmore";
$password = "Ilikepie2";
$dbname = "mobile_menu2";

$MANAGE_HTML_ADDRESS = 'http://localhost/MobileMenu/Manage.html';

// parse the encoded json object
	$post_data_as_assoc_array = json_decode(file_get_contents('php://input'), true);

// action tell which case to trigger and data holds the json object from the js file
	$action = $post_data_as_assoc_array['action'];
	$data = $post_data_as_assoc_array['data'];

// this switch will handle all AJAX requests from Manage.js
switch ($action) {
	case 1: // find all restaurants with matching names
			try {
				//create new PDO and set its error mode to exception
					$connection = new PDO("mysql:host=$servername;dbname=$dbname",$username,$password);
					$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

				$sql_query = "SELECT restaurant_identifier, restaurant_name FROM restaurant 
				WHERE restaurant_name LIKE CONCAT('%', :query_string, '%')";

				/// prepare statement for sql_query AND bind parameters
					$statement = $connection->prepare($sql_query);
					$statement->bindParam(':query_string', $data["query_string"]);
					$statement->setFetchMode(PDO::FETCH_ASSOC);
					$statement->execute();

				echo json_encode($statement->fetchAll(),JSON_FORCE_OBJECT);
			}
			catch(PDOException $exception) {
				echo "case 1: <br>" . $exception->getMessage();
			}

			$connection = null;

		break;

	case 2: // login the restaurant owner
			try {
				//create new PDO and set its error mode to exception
					$connection = new PDO("mysql:host=$servername;dbname=$dbname",$username,$password);
					$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

				$sql_query = "SELECT restaurant_identifier, restaurant_name FROM restaurant 
				WHERE owner_email = :owner_email AND owner_password = :owner_password";

				/// prepare statement for sql_query AND bind parameters
					$statement = $connection->prepare($sql_query);
					$statement->bindParam(':owner_email', $data["owner_email"]);
					$statement->bindParam(':owner_password', $data["owner_password"]);
					$statement->setFetchMode(PDO::FETCH_ASSOC);
					$statement->execute();

				$results = $statement->fetchAll();

				// check to see whether there is an account matching the supplied information
					if (sizeof($results) != 0) {
						// then the account exists so set the correct session information
							$_SESSION['restaurant_identifier'] = $results[0]["restaurant_identifier"];
							$_SESSION["restaurant_name"] = $results[0]["restaurant_name"];
					}
					else {
						// the account does not exist
							break;
					}

				echo json_encode($results,JSON_FORCE_OBJECT);
			}
			catch(PDOException $exception) {
				echo "case 2: <br>" . $exception->getMessage();
			}

			$connection = null;

		break;
	
	default:
		# code...
		break;
}


// Generic helper functions
function random_str($length, $keyspace = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
{
    $str = '';
    $max = mb_strlen($keyspace, '8bit') - 1;
    for ($i = 0; $i < $length; ++$i) {
        $str .= $keyspace[rand(0, $max)];
    }
    return $str;
}












?>