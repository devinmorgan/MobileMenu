<?php

// for right now, I will declare the restaurant_identifier manually,
// instead of having to log in to set it
session_start();
// $_SESSION['restaurant_identifier'] = "1234567890";

$servername = "localhost";
$username = "nerdsrockmore";
$password = "Ilikepie2";
$dbname = "mobile_menu2";

// refers to the minimum number of HOURS that must pass before recording to create
// a person's is_interested value in the database as again (as a different entry)
$MIN_TIME_TO_RECOUNT_DATA = 12;

// parse the encoded json object
	$post_data_as_assoc_array = json_decode(file_get_contents('php://input'), true);

// action tell which case to trigger and data holds the json object from the js file
	$action = $post_data_as_assoc_array['action'];
	$data = $post_data_as_assoc_array['data'];

// this switch will handle all AJAX requests from Patron.js
switch ($action) {
	case 1: // load all menu category and food information
			try{
				// FIRST!!! set the restaurant_identifier
					$_SESSION['restaurant_identifier'] = $data["restaurant_identifier"];

				//create new PDO and set its error mode to exception
					$connection = new PDO("mysql:host=$servername;dbname=$dbname",$username,$password);
					$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);				

				// 1st get category_name, served_with, upsales (NOTE: we still need food_type)
					$sql_query1 = "SELECT category_identifier, menu_position, category_name, category_type,
					served_with, upsales FROM food_categories WHERE restaurant_identifier = :restaurant_identifier";

					// prepare statement for sql_query AND bind parameters
						$statement1 = $connection->prepare($sql_query1);
						$statement1->bindParam(':restaurant_identifier', $_SESSION['restaurant_identifier']);

						$statement1->setFetchMode(PDO::FETCH_ASSOC);
						$statement1->execute();

					// 1st sql  category_data_array STRUCTURE { 
					//		category_index: {
 					//			'category_identifier':category_identifier,
					//			'menu_position':menu_position,	
 					//			'category_name':category_name,
					//			'category_type':category_type,
 					//			'served_with':served_with,
					//	    	'upsales':upsales
 					//	    }
					//	}
						$category_data_array = $statement1->fetchAll();

						if (!sizeof($category_data_array))
						{
							// if the restaurant_identifier doesn't match a valid restaurant then
							// return NULL to let patron.js know. Otherwise proceed as normal
							echo NULL;
							break;
						}

				// 2rd, get the food information for EACH food item in the category
					$sql_query2 = "SELECT food_identifier, photo_src, food_name, food_description,
					portion_prices FROM food_items WHERE category_identifier = :category_identifier";

					// prepare statement2 whit sql_query2
						$statement2 = $connection->prepare($sql_query2);
						$statement2->bindParam(':category_identifier',$category_identifier);
						
						// we need to execute statement2 one time for each category
							for ($i = 0; $i < sizeof($category_data_array); $i++) {
								//use the category identifier from the return results
									$category_identifier = $category_data_array[$i]['category_identifier'];
									$statement2->execute();

								// add the food_count data to the categories array
									$category_data_array[$i]['food_dict'] = $statement2->fetchAll();

							}
					// 2nd sql category_data_array STRUCTURE { 
					//		category_index: {
					//			'category_identifier':category_identifier,
					//			'menu_position':menu_position,	
					//			'category_name':category_name,
					//			'category_type':category_type,
					//			'served_with':served_with,
					//			'upsales':upsales,
					//			'food_dict':{
					//				food_index: {
					//					'food_identifier':food_identifier,
					//					'photo_src':photo_src,
					//					'food_name':food_name,
					//					'food_description':food_description,
					//					'portion_prices':portion_prices,
					//					'has_been_viewed': 	BOOLEAN
					//				} 
					//			}
					//		}
					// }

				// 3rd also send back the name of the restaurant
					$category_data_array[0]["restaurant_name"] = getRestaurantName($connection);
					
				echo json_encode($category_data_array,JSON_FORCE_OBJECT);
				// echo $statement->fetchAll()[0]['category_identifier'];
			}
			catch(PDOException $exception) {
				echo $sql_query1 . "<br>" . $exception->getMessage();
				echo $sql_query2 . "<br>" . $exception->getMessage();
			}

			$connection = null;

		break;

	case 2: // record a person's is_interested status for a given food they "added" or "removed"
			// NOTE!!! this is not used to say that a person saw the food and does not like it (see case 6)
			// this ONLY handles when they click interested or the not interested buttons 
			try{
				//create new PDO and set its error mode to exception
					$connection = new PDO("mysql:host=$servername;dbname=$dbname",$username,$password);
					$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);				


				// 1st determine if we have logged the user's interest in this food within the past 12 hrs
				// this means they either have never been to the restaurant before or they were here >= 1 day ago
					$sql_query1 = "SELECT COUNT(entry_number) AS count FROM food_data
					WHERE food_identifier = :food_identifier AND person_identifier = :person_identifier 
					AND date_recorded >=  DATE_SUB(CURDATE(), INTERVAL ". $MIN_TIME_TO_RECOUNT_DATA ." HOUR)";

				// prepare statement for sql_query AND bind parameters
					$statement1 = $connection->prepare($sql_query1);
					$statement1->bindParam(':food_identifier', $data['food_identifier']);
					$statement1->bindParam(':person_identifier', $data['person_identifier']);

					$statement1->setFetchMode(PDO::FETCH_ASSOC);
					$statement1->execute();

				// the count should only be 1 or 0. So, if it is > 0 we know that data has recently
				// been entered
					$recently_entered_data = $statement1->fetchAll()[0]["count"];

				$sql_query2;
				// if data has recently been entered, then UPDATE the existing data
					if ($recently_entered_data > 0) {
						$sql_query2 = "UPDATE food_data SET is_interested = :is_interested
						WHERE food_identifier = :food_identifier AND person_identifier = :person_identifier";
					}
				// if data has not been recently entered, then INSERT the existing data
					else {
						$sql_query2 = "INSERT INTO food_data (food_identifier, person_identifier,
						is_interested) VALUES (:food_identifier, :person_identifier, :is_interested)";
					}

				// prepare statement for sql_query AND bind parameters
					$statement2 = $connection->prepare($sql_query2);
					$statement2->bindParam(':food_identifier', $data['food_identifier']);
					$statement2->bindParam(':person_identifier', $data['person_identifier']);
					$statement2->bindParam(':is_interested', $data['is_interested']);

					$statement2->setFetchMode(PDO::FETCH_ASSOC);
					$statement2->execute();

				// Next, if the user has filled out any survey information for this food, update their is_interested
				// status for the response_data
					upateResponseItemsWithInterestStatus(
						$connection,
						$data["person_identifier"],
						$data["food_identifier"],
						$data["is_interested"]
					);
			}
			catch(PDOException $exception) {
				echo "<br>" . $exception->getMessage();
			}

			$connection = null;

		break;

		case 3: // load a food's rate of interest data (THIS IS THE SAME as case 13 in Manage.php)
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
				//									"count"			:number of responses for this answer									
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
									$sql_query4 = "SELECT response_text, COUNT(DISTINCT person_identifier)
									AS count FROM response_items WHERE answer_identifier = :answer_identifier";
									$statement4 = $connection->prepare($sql_query4);
									$statement4->bindParam(':answer_identifier', $answer_identifier);
									$statement4->setFetchMode(PDO::FETCH_ASSOC);

									// loop through each answer in the question
										for ($j = 0; $j < sizeof($answer_data); $j++) {
											// once the parameters are defined, execute the statement
												$answer_identifier = $answer_data[$j]["answer_identifier"];
												$statement4->execute();

											// get this answer's response_data
												$response_data = $statement4->fetchAll();
												
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

		case 4: // 1st, updates the database saying the user has officially "viewed" the food
				// 2nd, checks to see if there is a relevant survey for this food
			try{
				//create new PDO and set its error mode to exception
					$connection = new PDO("mysql:host=$servername;dbname=$dbname",$username,$password);
					$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
				// if a person sees a food (for at least the required time), and then skips past it, indicate that
				// they are not interested in the food. We assume no interested by default
					recordThatPersonHasViewedFood(
						$connection,
						$data['food_identifier'],
						$data['person_identifier'],
						$MIN_TIME_TO_RECOUNT_DATA
					);
				// return the survey type of a food IFF the food has an active survey
				// AND the current user has not already provided a response		
					// get the survey_identifier for the given food
						$sql_query1 = "SELECT survey_identifier, end_date FROM survey_items
						WHERE food_identifier = :food_identifier";

						// prepare statement for sql_query1 AND bind parameters
							$statement1 = $connection->prepare($sql_query1);
							$statement1->bindParam(':food_identifier', $data['food_identifier']);
							$statement1->setFetchMode(PDO::FETCH_ASSOC);
							$statement1->execute();

					$survey_data = $statement1->fetchAll();
					// echo 1;
					// check to make sure the db returned a survey identifier
						if (sizeof($survey_data) == 0) {
							// if the food has no survey_identifier, it has no survey so quit here
								break;
						}
					$survey_data = $survey_data[0];
					// echo 2;
					// since the food has a survey, make sure that it is active and not an old one
						if ($survey_data["end_date"] != null) {
							// if there is an end_date, then its an old survey
								break;
						}
					
					$survey_identifier = $survey_data["survey_identifier"];

					// check if the person already responded to the survey
						$sql_query2 = "SELECT COUNT(entry_number) AS count FROM response_items
						WHERE survey_identifier = :survey_identifier 
						AND person_identifier = :person_identifier";

						// prepare statement for sql_query1 AND bind parameters
							$statement2 = $connection->prepare($sql_query2);
							$statement2->bindParam(':survey_identifier', $survey_identifier);
							$statement2->bindParam(':person_identifier', $data['person_identifier']);
							$statement2->setFetchMode(PDO::FETCH_ASSOC);
							$statement2->execute();
					// echo 3;
						$count = $statement2->fetchAll()[0]["count"];
						if ($count > 0) {
							// if the count is positive, the person already responed to the survey
								break;
						}
					// echo 4;
					// at this point, the food has a survey, it is active, and the person
					// has not already responed; return the survey type to the javascript
						echo TRUE;
			}
			catch(PDOException $exception) {
				echo "<br>" . $exception->getMessage();

			}

			$connection = null;

		break;

	case 5: // send survey data to the database and update survey's left count
			try{
				//create new PDO and set its error mode to exception
					$connection = new PDO("mysql:host=$servername;dbname=$dbname",$username,$password);
					$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);				

				// make these values variables since they won't change
					$person_identifier = $data["person_identifier"];
					$survey_identifier = $data["survey_identifier"];
					$checked_answer_identifiers = $data["checked_answer_identifiers"];
					$custom_answers_identifiers_and_responses = $data["custom_answers_identifiers_and_responses"];
					$food_identifier = $data["food_identifier"];
					$is_interested = checkIsInterestedStatusForFood($connection, $food_identifier, $person_identifier);

				// 1st update the database with the user's feedback
					// we will make a response item for each answer from the food_survey
						$sql_query1 = "INSERT INTO response_items (answer_identifier, person_identifier,
							response_text, is_interested, survey_identifier) VALUES (:answer_identifier, :person_identifier,
							:response_text, :is_interested, :survey_identifier)";
						$statement1 = $connection->prepare($sql_query1);
						$statement1->bindParam(':answer_identifier', $answer_identifier);
						$statement1->bindParam(':person_identifier', $person_identifier);
						$statement1->bindParam(':response_text', $response_text);
						$statement1->bindParam(':is_interested', $is_interested);
						$statement1->bindParam(':survey_identifier', $survey_identifier);
						$statement1->setFetchMode(PDO::FETCH_ASSOC);

					// add all of the selection answers to the database
						for ($i = 0; $i < sizeof($checked_answer_identifiers); $i++) {
							$answer_identifier = $checked_answer_identifiers[$i];
							$response_text = "1";
							$statement1->execute();
						}

					// add all of the response answers to the database
						foreach($custom_answers_identifiers_and_responses 
							/* the for loop sets the variables for us */
							as $answer_identifier => $response_text) {
							$statement1->execute();
						}

				// 2nd update the number of surveys remaining count
					$sql_query2 = "UPDATE survey_items SET surveys_remaining = surveys_remaining - 1
					WHERE survey_identifier = :survey_identifier AND surveys_remaining > 0";
					$statement2 = $connection->prepare($sql_query2);
					$statement2->bindParam(':survey_identifier', $survey_identifier);
					$statement2->execute();

				// 3rd check to see if the required number of people have been surveyed
					$sql_query3 = "SELECT surveys_remaining FROM survey_items 
					WHERE survey_identifier = :survey_identifier";
					$statement3 = $connection->prepare($sql_query3);
					$statement3->bindParam(':survey_identifier', $survey_identifier);
					$statement3->setFetchMode(PDO::FETCH_ASSOC);
					$statement3->execute();

				$surveys_remaining = $statement3->fetchAll()[0]["surveys_remaining"];
				// close the survey it has no surveys remaining
					if ($surveys_remaining == 0) {
						closeSurveyAndSetEndDate($connection ,$survey_identifier);
					}
			}
			catch(PDOException $exception) {
				echo "<br>" . $exception->getMessage();

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
	function getSurveyIdentifierForFoodIdentifer($connection, $food_identifier) {
		// Get the survey_identifier associated with food
			$sql_query = "SELECT survey_identifier FROM survey_items WHERE food_identifier = :food_identifier";
			$statement = $connection->prepare($sql_query);
			$statement->bindParam(':food_identifier', $food_identifier);
			$statement->setFetchMode(PDO::FETCH_ASSOC);
			$statement->execute();

		$result = $statement->fetchAll();
		if (sizeof($result)) {
			return $result[0]["survey_identifier"];
		}
		else {
			return null;
		}
	}

	function checkIsInterestedStatusForFood($connection, $food_identifier, $person_identifier) {
		$sql_query = "SELECT is_interested FROM food_data WHERE food_identifier = :food_identifier
		AND person_identifier = :person_identifier";
		$statement = $connection->prepare($sql_query);
		$statement->bindParam(':food_identifier', $food_identifier);
		$statement->bindParam(':person_identifier', $person_identifier);
		$statement->setFetchMode(PDO::FETCH_ASSOC);
		$statement->execute();

		$result = $statement->fetchAll();
		if (sizeof($result)) {
			return $result[0]["is_interested"];
		}
		else {
			return null;
		}
	}
// restuarnt related functions
	function getRestaurantName($connection) {
		$sql_query = "SELECT restaurant_name FROM restaurant 
		WHERE restaurant_identifier = :restaurant_identifier";
		$statement = $connection->prepare($sql_query);
		$statement->bindParam(':restaurant_identifier', $_SESSION['restaurant_identifier']);
		$statement->setFetchMode(PDO::FETCH_ASSOC);
		$statement->execute();

		return $statement->fetchAll()[0]["restaurant_name"];
	}
// performance related functions
	function recordThatPersonHasViewedFood($connection, $food_identifier, $person_identifier, $MIN_TIME_TO_RECOUNT_DATA) {
		// first we must see if the user has already viewed the food in the last 12 hrs in which case
		// we should do nothing		
			$sql_query1 = "SELECT COUNT(entry_number) AS count FROM food_data
			WHERE food_identifier = :food_identifier AND person_identifier = :person_identifier 
			AND date_recorded >=  DATE_SUB(CURDATE(), INTERVAL ". $MIN_TIME_TO_RECOUNT_DATA ." HOUR)";

		// prepare statement for sql_query AND bind parameters
			$statement1 = $connection->prepare($sql_query1);
			$statement1->bindParam(':food_identifier', $food_identifier);
			$statement1->bindParam(':person_identifier', $person_identifier);
			$statement1->setFetchMode(PDO::FETCH_ASSOC);
			$statement1->execute();

		// the count should only be 1 or 0. So, if it is > 0 we know that data has recently
		// been entered
			$recently_entered_data = $statement1->fetchAll()[0]["count"];

		// only if the user has not recently entered data do we need to record that he "viewed" the food
			if (!$recently_entered_data) {
				$sql_query2 = "INSERT INTO food_data (food_identifier, person_identifier,
				is_interested) VALUES (:food_identifier, :person_identifier, 0)"; /* 0 --> not interested, the default */

				// prepare statement for sql_query AND bind parameters
					$statement2 = $connection->prepare($sql_query2);
					$statement2->bindParam(':food_identifier', $food_identifier);
					$statement2->bindParam(':person_identifier', $person_identifier);
					$statement2->setFetchMode(PDO::FETCH_ASSOC);
					$statement2->execute();
			}
	}

// survey related functions
	function closeSurveyAndSetEndDate($connection ,$survey_identifier) {
		// we can close the survey by providing it with an end_date because
		// the software knows not to launch a survey if it has an end date
			$sql_query = "UPDATE survey_items SET end_date = CURDATE()
			WHERE survey_identifier = :survey_identifier";
			$statement = $connection->prepare($sql_query);
			$statement->bindParam(':survey_identifier', $survey_identifier);
			$statement->execute();
	}

	function upateResponseItemsWithInterestStatus($connection, $person_identifier, $food_identifier, $is_interested){
		$survey_identifier = getSurveyIdentifierForFoodIdentifer($connection, $food_identifier);
		// find all response_items with $person_identifier and $survey_identifier AND
		// update all the response items with new $is_interested value
		$sql_query = "UPDATE response_items SET is_interested = :is_interested 
		WHERE person_identifier = :person_identifier AND survey_identifier = :survey_identifier";
		$statement = $connection->prepare($sql_query);
		$statement->bindParam(':person_identifier', $person_identifier);
		$statement->bindParam(':survey_identifier', $survey_identifier);
		$statement->bindParam(':is_interested', $is_interested);
		$statement->execute();
	}

















?>