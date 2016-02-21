<?php

// for right now, I will declare the restaurant_identifier manually,
// instead of having to log in to set it
session_start();
// $_SESSION['restaurant_identifier'] = "1234567890";

$servername = "localhost";
$username = "nerdsrockmore";
$password = "Ilikepie2";
$dbname = "mobile_menu2";

// parse the encoded json object
	$post_data_as_assoc_array = json_decode(file_get_contents('php://input'), true);

// action tell which case to trigger and data holds the json object from the js file
	$action = $post_data_as_assoc_array['action'];
	$data = $post_data_as_assoc_array['data'];

// this switch will handle all AJAX requests from Manage.js
switch ($action) {
	case 1: // update database when category is saved (existing or new)
			try {
				//create new PDO and set its error mode to exception
					$connection = new PDO("mysql:host=$servername;dbname=$dbname",$username,$password);
					$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

				$category_identifier = $data['category_identifier'];
				$sql_query = "";

				if ($category_identifier == "") {
					// it is a new category so give it a Unique Id
						$category_identifier = random_str(10);

					// new category ---> INSERT 
						$sql_query = "INSERT INTO food_categories (category_identifier,
						restaurant_identifier, menu_position, category_name, start_time, end_time, 
						category_type, served_with, upsales) VALUES (:category_identifier,
						:restaurant_identifier, :menu_position, :category_name, :start_time,
						:end_time, :category_type, :served_with, :upsales)";
				}
				elseif (strlen($category_identifier) == 10){
					// existing category ---> UPDATE
						$sql_query = "UPDATE food_categories 
						SET restaurant_identifier = :restaurant_identifier, menu_position = :menu_position, 
						category_name = :category_name, start_time = :start_time, end_time = :end_time,
						category_type = :category_type, served_with = :served_with, upsales = :upsales
						WHERE category_identifier = :category_identifier";
				}

				/// prepare statement for sql_query AND bind parameters
					$statement = $connection->prepare($sql_query);
					$statement->bindParam(':category_identifier', $category_identifier);
					$statement->bindParam(':restaurant_identifier', $_SESSION['restaurant_identifier']);
					$statement->bindParam(':menu_position', $data['menu_position']);
					$statement->bindParam(':category_name', $data['category_name']);
					$statement->bindParam(':served_with', $data['served_with']);
					$statement->bindParam(':upsales', $data['upsales']);
					$statement->bindParam(':start_time', $data['start_time']);
					$statement->bindParam(':end_time', $data['end_time']);
					$statement->bindParam(':category_type', $data['category_type']);

				// execute query
					$statement->execute();

				echo $category_identifier;
			}
			catch(PDOException $exception) {
				echo $sql_query . "<br>" . $exception->getMessage();
			}

			$connection = null;

		break;

	case 2: // load all menu categories
			try {
				//create new PDO and set its error mode to exception
					$connection = new PDO("mysql:host=$servername;dbname=$dbname",$username,$password);
					$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);				

				$sql_query = "SELECT category_identifier, category_name, menu_position FROM food_categories
				WHERE restaurant_identifier = :restaurant_identifier ORDER BY menu_position ASC";

				// prepare statement for sql_query AND bind parameters
					$statement = $connection->prepare($sql_query);
					$statement->bindParam(':restaurant_identifier', $_SESSION['restaurant_identifier']);

				$statement->setFetchMode(PDO::FETCH_ASSOC);
				$statement->execute();
		
				echo json_encode($statement->fetchAll(),JSON_FORCE_OBJECT);
			}
			catch(PDOException $exception) {
				echo $sql_query . "<br>" . $exception->getMessage();
			}

			$connection = null;

		break;

	case 3: // updates the database with each category's menu_position
			try {
				//create new PDO and set its error mode to exception
					$connection = new PDO("mysql:host=$servername;dbname=$dbname",$username,$password);
					$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

				$sql_query = "UPDATE food_categories SET menu_position = :menu_position
				WHERE category_identifier = :category_identifier";

				// prepare statement for sql_query AND bind parameters
					$statement = $connection->prepare($sql_query);
					$statement->bindParam(':menu_position',$menu_position);
					$statement->bindParam(':category_identifier',$category_identifier);

				for ($i = 0; $i < sizeof($data); $i++) {
					$category_identifier = $data[$i]["category_identifier"];
					$menu_position = $data[$i]["menu_position"];

					$statement->execute();
				}
			}
			catch(PDOException $exception) {
				echo $sql_query . "<br>" . $exception->getMessage();
			}

			$connection = null;

		break;

	case 4: // gets necessary data to populate right sidebar with category info
			try {
				//create new PDO and set its error mode to exception
					$connection = new PDO("mysql:host=$servername;dbname=$dbname",$username,$password);
					$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

				$sql_query = "SELECT category_name, start_time, end_time, category_type, served_with,
				upsales FROM food_categories WHERE category_identifier = :category_identifier";

				// prepare statement for sql_query AND bind parameters
					$statement = $connection->prepare($sql_query);
					$statement->bindParam(':category_identifier', $data["category_identifier"]);

				$statement->setFetchMode(PDO::FETCH_ASSOC);
				$statement->execute();

				echo json_encode($statement->fetchAll(),JSON_FORCE_OBJECT);
			}
			catch(PDOException $exception) {
				echo $sql_query . "<br>" . $exception->getMessage();
			}

			$connection = null;

		break;

	case 5: // deletes a category from the database
			try {
				//create new PDO and set its error mode to exception
					$connection = new PDO("mysql:host=$servername;dbname=$dbname",$username,$password);
					$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

				$category_identifier = $data["category_identifier"];

				// 1) delete the category entry from the database
					$sql_query1 = "DELETE FROM food_categories WHERE category_identifier = :category_identifier";
					$statement1 = $connection->prepare($sql_query1);
					$statement1->bindParam(':category_identifier', $category_identifier);
					$statement1->execute();
				
				// 2) get a list of food_identifiers for each food in the category and 
				// delete all of the information for each food 
					$sql_query2 = "SELECT food_identifier FROM food_items 
					WHERE category_identifier = :category_identifier";
					$statement2 = $connection->prepare($sql_query2);
					$statement2->bindParam(':category_identifier', $category_identifier);
					$statement2->setFetchMode(PDO::FETCH_ASSOC);
					$statement2->execute();

					$food_identifiers_list = $statement2->fetchAll();

					for ($i = 0; $i < sizeof($food_identifiers_list); $i++) {

						$food_identifier = $food_identifiers_list[$i]["food_identifier"];
						deleteFoodAndRelatedData($connection, $food_identifier);
					}
			}
			catch(PDOException $exception) {
				echo $sql_query . "<br>" . $exception->getMessage();
			}

			$connection = null;
		break;

	case 6: // collects the information about a food item to populate right sidebar
			try {
				//create new PDO and set its error mode to exception
					$connection = new PDO("mysql:host=$servername;dbname=$dbname",$username,$password);
					$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

				$sql_query = "SELECT photo_src, food_name, food_description, portion_prices
				 FROM food_items WHERE food_identifier = :food_identifier";

				// prepare statement for sql_query AND bind parameters
					$statement = $connection->prepare($sql_query);
					$statement->bindParam(':food_identifier', $data["food_identifier"]);

				$statement->setFetchMode(PDO::FETCH_ASSOC);
				$statement->execute();

				echo json_encode($statement->fetchAll(),JSON_FORCE_OBJECT);
			}
			catch(PDOException $exception) {
				echo $sql_query . "<br>" . $exception->getMessage();
			}

			$connection = null;
		break;

	case 7: // save a food to the food_items database
			try {
				//create new PDO and set its error mode to exception
					$connection = new PDO("mysql:host=$servername;dbname=$dbname",$username,$password);
					$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

				$food_identifier = $data['food_identifier'];
				$sql_query = "";

				if ($food_identifier == "") {
					// it is a new food so give it a Unique Id
						$food_identifier = random_str(10);

					// new food ---> INSERT 
						$sql_query = "INSERT INTO food_items (food_identifier,
						category_identifier, photo_src, food_name, food_description, portion_prices)
						VALUES (:food_identifier, :category_identifier, :photo_src, :food_name,
						:food_description, :portion_prices)";
				}
				elseif (strlen($food_identifier) == 10){
					// existing food ---> UPDATE
						$sql_query = "UPDATE food_items 
						SET category_identifier = :category_identifier, photo_src = :photo_src, food_name = :food_name,
						food_description = :food_description, portion_prices = :portion_prices
						WHERE food_identifier = :food_identifier";
				}

				// prepare statement for sql_query AND bind parameters
					$statement = $connection->prepare($sql_query);
					$statement->bindParam(':food_identifier', $food_identifier);
					$statement->bindParam(':category_identifier', $data['category_identifier']);
					$statement->bindParam(':photo_src', $data['photo_src']);
					$statement->bindParam(':food_name', $data['food_name']);
					$statement->bindParam(':food_description', $data['food_description']);
					$statement->bindParam(':portion_prices', $data['portion_prices']);

				// execute query
					$statement->execute();

				echo $food_identifier;
			}
			catch(PDOException $exception) {
				echo $sql_query . "<br>" . $exception->getMessage();
			}

			$connection = null;
		break;

	case 8: // load a categories foods when a category is selected
			try {
				//create new PDO and set its error mode to exception
					$connection = new PDO("mysql:host=$servername;dbname=$dbname",$username,$password);
					$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

				$sql_query = "SELECT food_identifier, photo_src, food_name FROM food_items
				WHERE category_identifier = :category_identifier";

				// prepare statement for sql_query AND bind parameters
					$statement = $connection->prepare($sql_query);
					$statement->bindParam(':category_identifier', $data['category_identifier']);

				$statement->setFetchMode(PDO::FETCH_ASSOC);
				$statement->execute();
				
				echo json_encode($statement->fetchAll(),JSON_FORCE_OBJECT);
			}
			catch(PDOException $exception) {
					echo $sql_query . "<br>" . $exception->getMessage();
				}

			$connection = null;
		break;

	case 9: // delete the food item that is selected
			try {
				//create new PDO and set its error mode to exception
					$connection = new PDO("mysql:host=$servername;dbname=$dbname",$username,$password);
					$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

				deleteFoodAndRelatedData($connection, $data['food_identifier']);

			}
			catch(PDOException $exception) {
				echo $sql_query . "<br>" . $exception->getMessage();
			}

			$connection = null;
		break;

	case 10: // saves photo path for a given food item
			try {
				//create new PDO and set its error mode to exception
					$connection = new PDO("mysql:host=$servername;dbname=$dbname",$username,$password);
					$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

					$sql_query = "UPDATE food_items SET photo_src = :photo_src
					WHERE food_identifier = :food_identifier";

					// prepare statement for sql_query AND bind parameters
						$statement = $connection->prepare($sql_query);
						$statement->bindParam(':photo_src', $data['photo_src']);
						$statement->bindParam(':food_identifier', $data['food_identifier']);

					$statement->execute();
			}
			catch(PDOException $exception) {
				echo $sql_query . "<br>" . $exception->getMessage();
			}

			$connection = null;
		break;

	case 11: // load a food's rate of interest data
			try {
				//create new PDO and set its error mode to exception
					$connection = new PDO("mysql:host=$servername;dbname=$dbname",$username,$password);
					$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

				$unit_time_size = $data["unit_time_size"];
				$history_depth = $data["history_depth"];
				$upper_bound = -1; /* dates are stored as yyyy-mm-dd hh-mm-ss but DATE_SUB()
				will produce yyyy-mm-dd so yyyy-mm-dd hh-mm-ss > than yyyy-mm-dd. We correct for this 
				with the -1 instead of 0*/
				$lower_bound = $unit_time_size;
				$data_array = [];

				// for each time interval that exists from now and history depth, we get this foods
				// view count, interest count, and some date during that time interval
					$sql_query = 	"SELECT 

										(SELECT COUNT(DISTINCT person_identifier) 
									     FROM food_data
									     WHERE food_identifier = :food_identifier
											AND date_recorded >= DATE_SUB(CURDATE(), INTERVAL :lower_bound DAY) 
									    	AND date_recorded <= DATE_SUB(CURDATE(), INTERVAL :upper_bound DAY) ) AS views_count,

									    (SELECT COUNT(DISTINCT person_identifier) 
									     FROM food_data 
									     WHERE is_interested = 1
									     	AND food_identifier = :food_identifier
											AND date_recorded >= DATE_SUB(CURDATE(), INTERVAL :lower_bound DAY) 
									   	 	AND date_recorded <= DATE_SUB(CURDATE(), INTERVAL :upper_bound DAY) ) AS interest_count

									FROM food_data 
									WHERE food_identifier = :food_identifier
										AND date_recorded >= DATE_SUB(CURDATE(), INTERVAL :lower_bound DAY) 
									    AND date_recorded <= DATE_SUB(CURDATE(), INTERVAL :upper_bound DAY) 
									LIMIT 1";
					$statement = $connection->prepare($sql_query);
					$statement->bindParam(':food_identifier', $data['food_identifier']);
					$statement->bindParam(':lower_bound', $lower_bound);
					$statement->bindParam(':upper_bound', $upper_bound);
					$statement->setFetchMode(PDO::FETCH_ASSOC);
							
					
					for ($i = 0; $i <= $history_depth; $i += $unit_time_size ){
						// get the timer interval for the data
							$date_recorded = date("Y-m-d", strtotime("-". $upper_bound ." day"));

						// run $sql_query first
							$statement->execute();
						// append the results to the data_array NOTE: they are in chronologically descending order
						// so the most recent is at index 0
							$results = $statement->fetchAll();
							$results[0]["date_recorded"] = $date_recorded;
							// print_r($results);
							array_push($data_array, $results);
						// then update the count to look at the next time interval
							$upper_bound += $unit_time_size;
							$lower_bound += $unit_time_size;
					}
				
				echo json_encode($data_array,JSON_FORCE_OBJECT);
			}
			catch(PDOException $exception) {
				echo $sql_query . "<br>" . $exception->getMessage();
			}

			$connection = null;
		break;

	case 12: // create a new survey for a food
			try {
				//create new PDO and set its error mode to exception
					$connection = new PDO("mysql:host=$servername;dbname=$dbname",$username,$password);
					$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

				// delete any existing surveys for the food
					deleteSurveyAndRelatedData($connection, $data["food_identifier"]);
					
				// create a new survey entry for the new survey
					$survey_identifier = createNewSurveyEntryForFood(
											$connection,
											$data["food_identifier"],
											// $data["survey_type"],
											$data["size"]
											// $data["greeting"]
										);

				// make a question entry in question_items for each question in the survey
					// also makes an answer_item for each choice associate with each question
					createQuestionsFromList($connection, $data["questions_list"],$survey_identifier);
					
			}
			catch(PDOException $exception) {
				echo  $exception->getMessage();
			}

			$connection = null;
		break;

	case 13: // load a survey respone data
			try {
				//create new PDO and set its error mode to exception
					$connection = new PDO("mysql:host=$servername;dbname=$dbname",$username,$password);
					$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

				// get the survey information
					$sql_query1 = "SELECT survey_identifier, survey_size, surveys_remaining, start_date,
					end_date FROM survey_items WHERE food_identifier = :food_identifier";
					$statement1 = $connection->prepare($sql_query1);
					$statement1->bindParam(':food_identifier', $data['food_identifier']);
					$statement1->setFetchMode(PDO::FETCH_ASSOC);
					$statement1->execute();

				$survey_data = $statement1->fetchAll();
				// $survey_data STRUCTURE::= {
				// 	0 :{
				// 			"survey_identifier" : survey_identifier,
				// 			"survey_size"		: survey_size,
				// 			"surveys_remaining"	: surveys_remaining,
				// 			"start_date"		: start_date,
				// 			"end_date"			: end_date,
				//			"question_data"		: {
				//				q_index : {
				//					"question_identifier" 	: question_identifier,
				//					"question_type"			: question_type,
				//					"question_text"			: question_text
				//					"answer_data"			: {
				//						a_index : {
				//							"answer_identifier"	:answer_identifier,
				//							"answer_text"		:answer_text,
				//							"response_data"		: {
				//								r_index : {
				//									"response_text"	:response_text,
				//									"cumulative_count"				:number of yes for this answer,
				//									"interested_count"				:number of interested ppl that said yes,
				//									"not_interested_count"			:number of not interested ppl that said yes,
				//								}
				//							}
				//						}
				//					}
				//				}
				//			}
				// 		}
				// 	}

				// get the question information
					$sql_query2 = "SELECT question_identifier, question_type, question_text
					FROM question_items WHERE survey_identifier = :survey_identifier";
					$statement2 = $connection->prepare($sql_query2);
					$statement2->bindParam(':survey_identifier', $survey_data[0]['survey_identifier']);
					$statement2->setFetchMode(PDO::FETCH_ASSOC);	
					$statement2->execute();

				$question_data = $statement2->fetchAll();

				// get the answer_information
					$sql_query3 = "SELECT answer_identifier, answer_text FROM answer_items
					WHERE question_identifier = :question_identifier";
					$statement3 = $connection->prepare($sql_query3);
					$statement3->bindParam(':question_identifier', $question_identifier);
					$statement3->setFetchMode(PDO::FETCH_ASSOC);

					// loop throught each question in the survey
						for ($i = 0; $i < sizeof($question_data); $i++ ){
							// once the parameters are defined, exeucte the statement
								$question_identifier = $question_data[$i]['question_identifier'];
								$statement3->execute();

							// get this question's answer_data
								$answer_data = $statement3->fetchAll();

								// get the response information for each answer
									$sql_query4 = "SELECT response_text, 
									(SELECT COUNT(DISTINCT person_identifier) 
										FROM response_items 
										WHERE answer_identifier = :answer_identifier) 
										AS cumulative_count, 

									(SELECT COUNT(DISTINCT person_identifier) 
										FROM response_items 
										WHERE is_interested = 1 
											AND answer_identifier = :answer_identifier) 
										AS interested_count, 

									(SELECT COUNT(DISTINCT person_identifier) 
										FROM response_items 
										WHERE is_interested = 0 
											AND answer_identifier = :answer_identifier) 
										AS not_interested_count 
										
									FROM response_items WHERE answer_identifier = :answer_identifier";
									$statement4 = $connection->prepare($sql_query4);
									$statement4->bindParam(':answer_identifier', $answer_identifier);
									$statement4->setFetchMode(PDO::FETCH_ASSOC);

									// loop through each answer in the question
										for ($j = 0; $j < sizeof($answer_data); $j++) {
											// echo $answer_data[$j]["answer_identifier"];
											// once the parameters are defined, execute the statement
												$answer_identifier = $answer_data[$j]["answer_identifier"];
												$statement4->execute();

											// get this answer's response_data
												$response_data = $statement4->fetchAll();
												// print_r( $response_data );
												
											// set the "response_data" attribute with each answer's $response_data
												$answer_data[$j]["response_data"] = $response_data;
										}

							// set the "answer_data" attribute with each question's $answer_data
								$question_data[$i]["answer_data"] = $answer_data;
						}

				// set the "question_data" attribute of the survey with $question_data
					$survey_data[0]["question_data"] = $question_data;

				echo json_encode($survey_data,JSON_FORCE_OBJECT);
			}
			catch(PDOException $exception) {
				echo  "<br>" . $exception->getMessage();
			}

			$connection = null;
		break;

		case 14: // delete the surey information for a given food
			try {
				//create new PDO and set its error mode to exception
					$connection = new PDO("mysql:host=$servername;dbname=$dbname",$username,$password);
					$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

				// delete any existing surveys for the food
					deleteSurveyAndRelatedData($connection, $data["food_identifier"]);
			}
			catch(PDOException $exception) {
				echo  $exception->getMessage();
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

// used to delete all the information related to a survey since a given survey is
// is spread out over 4 different tables
	/* must open a connection before calling this */
	//helper function
		function deleteSurveyRelatedInfoFromTable($connection, $table_name, $survey_identifier_list) {

			$sql_query = "DELETE FROM ". $table_name ." WHERE survey_identifier = :survey_identifier;";
				// prepare statement for sql_query AND bind parameters
					$statement = $connection->prepare($sql_query);
					$statement->bindParam(':survey_identifier', $survey_identifier);

			for ($i = 0; $i < sizeof($survey_identifier_list); $i++) {
				// define the parameter and execute the statement
					$survey_identifier = $survey_identifier_list[$i]["survey_identifier"];
					$statement->execute();
			}
		}
	function deleteSurveyAndRelatedData($connection, $food_identifier) { 
		// go to survey_items and see if there are any surveys that have the 
		// passed $food_identifier
			$sql_query1 = "SELECT survey_identifier FROM survey_items WHERE
			food_identifier = :food_identifier";

			// prepare statement for sql_query1 AND bind parameters
				$statement = $connection->prepare($sql_query1);
				$statement->bindParam(':food_identifier', $food_identifier);

			// set results format and execute the query		
				$statement->setFetchMode(PDO::FETCH_ASSOC);
				$statement->execute();

		$survey_identifier_list = $statement->fetchAll();
	
		// delete from survey_items, question_items, answer_items, response_items
		// anything that has the retrieved survey_identifier
			deleteSurveyRelatedInfoFromTable($connection, "survey_items", $survey_identifier_list);
			deleteSurveyRelatedInfoFromTable($connection, "question_items", $survey_identifier_list);
			deleteSurveyRelatedInfoFromTable($connection, "answer_items", $survey_identifier_list);
			deleteSurveyRelatedInfoFromTable($connection, "response_items", $survey_identifier_list);

	}

// used to create a new survey entry in the survey_items table
	/* must open a connection before calling this */
	function createNewSurveyEntryForFood($connection, $food_identifier, $survey_size) { 
		$survey_identifier = random_str(10);

		// create a new entry in survey_items for the new survey
			$sql_query1 = "INSERT INTO survey_items (food_identifier, survey_identifier,
				survey_size, surveys_remaining, start_date)
			VALUES (:food_identifier, :survey_identifier,:survey_size, :surveys_remaining, CURDATE())";
			
			// prepare statement for sql_query AND bind parameters
				$statement1 = $connection->prepare($sql_query1);
				$statement1->bindParam(':food_identifier', $food_identifier);
				$statement1->bindParam(':survey_identifier', $survey_identifier);
				$statement1->bindParam(':survey_size', $survey_size);
				// at the start, surveys_remaining = survey_size
					$statement1->bindParam(':surveys_remaining', $survey_size); 

				$statement1->execute();	

		return $survey_identifier;
	}

// functions to create entries for the 3 different question types in question_items
	function createQuestionsFromList($connection, $questions_list,$survey_identifier) {

		// create a new question_item for each question_passed
			// create the sql_query
				$sql_query1 = "INSERT INTO question_items (survey_identifier,
					question_identifier, question_type, question_text)
					VALUES(:survey_identifier, :question_identifier, :question_type,
					:question_text)";
			// bind the parameters
				$statement1 = $connection->prepare($sql_query1);
				$statement1->bindParam(':survey_identifier', $survey_identifier);
				$statement1->bindParam(':question_identifier', $question_identifier);
				$statement1->bindParam(':question_type', $question_type);
				$statement1->bindParam(':question_text', $question_text);


		// create a new answer_item for each choice associated with each question
			// create the sql_query
				$sql_query2 = "INSERT INTO answer_items (question_identifier,
					answer_identifier, answer_text, survey_identifier)
					VALUES(:question_identifier, :answer_identifier, :answer_text,
					:survey_identifier)";
			// bind the parameters
				$statement2 = $connection->prepare($sql_query2);
				$statement2->bindParam(':question_identifier', $question_identifier);
				$statement2->bindParam(':answer_identifier', $answer_identifier);
				$statement2->bindParam(':answer_text', $answer_text);
				$statement2->bindParam(':survey_identifier', $survey_identifier);

		for ($i = 0; $i < sizeof($questions_list); $i++) {
			// create a new question_item for each question_passed
				$question_text = $questions_list[$i]["question"];
				$question_identifier = random_str(10);
				$question_type = $questions_list[$i]["question_type"];
			// with the parameters defined, execute the statement
				$statement1->execute();	

			// question types 1 & 2 are selection based and will have positive length $answers_arrays
				if ($question_type == 1 || $question_type == 2) {
					$answers_array = $questions_list[$i]["choices"];
					for ($j = 0; $j < sizeof($answers_array); $j++) {
						// create a new answer_item for each choice associated with each qustion	
							$answer_text = $answers_array[$j];
							$answer_identifier = random_str(10);
						// with the parameters defined, execute the statment
							$statement2->execute();
					}
				}
			// questions type 3 is a custom response and will not have a positive length %answers_array
			elseif ($question_type == 3) {
				// create a new answer_item for each choice associated with each qustion	
						$answer_text = "CUSTOM RESPONSE";
						$answer_identifier = random_str(10);
				// with the parameters defined, execute the statment
					$statement2->execute();
			}
			
		}
	}

// functions to delete food data and information from database
	function deleteFoodAndRelatedData($connection, $food_identifier) {
		// 1) delete the food entry in food_items
			$sql_query1 = "DELETE FROM food_items WHERE food_identifier = :food_identifier";
			$statement1 = $connection->prepare($sql_query1);
			$statement1->bindParam(':food_identifier', $food_identifier);
		$statement1->execute();

		// 2) delete the survey_information for the food_item
			deleteSurveyAndRelatedData($connection, $food_identifier);

		// 3) delete the food_data for the food_item
			$sql_query2 = "DELETE FROM food_data WHERE food_identifier = :food_identifier";
			$statement2 = $connection->prepare($sql_query2);
			$statement2->bindParam(':food_identifier', $food_identifier);
		$statement2->execute();
	}














?>