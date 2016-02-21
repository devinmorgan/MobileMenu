// GLOBAL CONSTANTS
	var CLASS_TYPE_DICT = {"1":"single_response","2":"all_that_apply","3":"custom_response"};
	var INPUT_TYPE_DICT = {"1":"radio","2":"checkbox"};

// share link of food functions
	function getShareableLink() {
		var modal_overlay = document.querySelector(".modal_overlay.share_link");
		showElement(modal_overlay);

		var single_img_view = document.querySelector("#single_img_view");
		var category_identifier = single_img_view.getAttribute("data-category-identifier");
		var food_identifier = single_img_view.getAttribute("data-food-identifier");

		var food_name = MASTER_CATEGORY_OBJECTS_DICT[ category_identifier ]
			["food_dict"][ food_identifier ]["food_name"];

		// set the food name to the current food
			document.querySelector("#share_food_name").innerHTML = food_name;

		// create and set the link to be shared
			var food_link = THIS_PAGE_URL + "?data-food-identifier="+food_identifier +
				"&data-restaurant-identifier=" + RESTAURANT_IDENTIFIER;
			var link_input = document.querySelector("#share_link_input");
			link_input.value = food_link;

		// pre-highlight the link so the user need only copy
			link_input.focus();
			link_input.select();	
		
	}
	function hideShareFoodModal(element,event) {
		if (event.target == element) {
			hideElement(element);
		}
	}
	
// survey modal functions
	function hideSurveyModal() {
		var modal = document.querySelector(".modal_overlay.food_survey");
		hideElement(modal);
	}
	// helper functions
		function resetSurveyTriggersOnclickFunctions() {
			// resets the navigate through single view foods
				document.querySelector("#single_img_view .upper_item_wrapper").
					setAttribute("onclick","interpretPictureClick(this,event)");
		}

		function updateGreetingBasedOnFood() {
			var food_name  = document.querySelector("#single_img_view_header .header_title").innerHTML;

			document.querySelector(".patron_response.survey_greeting").innerHTML =
				"Help Restaurant Name improve their products by providing some feedback about "+
					"<b style='color:rgb(65, 67, 69)'>" +
						food_name+"</b>.";
		}

		// helpfer function for helper functions
			function createSurveyQuestionFieldset(question_identifier, question_type, question_text) {
				var class_name = CLASS_TYPE_DICT[question_type];

				// create the new list item
					var fieldset = document.createElement("fieldset");
				// set its appropriate attributes
					fieldset.className = "patron_response " + class_name + " fieldset";
					fieldset.setAttribute("data-question-identifier",question_identifier);

				// set the innerHTML
					fieldset.innerHTML = '<div>'+
								                '<span class="patron_response '+ class_name +' question_type_label">'+
								                    question_text+
								                    '<span class="fieldset_required_marker">*</span>'+
								                '</span>'+
								            '</div>'+
								            '<div class="patron_response '+ class_name +' content">'+
								                /* the answer options go inside here */
								            '</div>';

	            return fieldset;
			}
			function createAnswerForQuestionType12(a_index, answer_data, question_type, question_identifier) {
				var answer_identifier = answer_data[ a_index ]["answer_identifier"];
				var answer_text = answer_data[ a_index ]["answer_text"];
				var class_name = CLASS_TYPE_DICT[ question_type ];
				var input_type = INPUT_TYPE_DICT[ question_type ];
				// create the label
					var label = document.createElement("label");
				// assign relevant attributes
					label.className = "patron_response "+class_name+" label";
					label.setAttribute("for", answer_identifier);
				// create the innertHTML for the label
					label.innerHTML = 	'<input type="'+ input_type +'" id="'+ answer_identifier +'"' +
											 ' name="'+ question_identifier +'"'+
											' data-answer-identifier="'+ answer_identifier +'"'+
										' class="patron_response '+ class_name +' input"/>'+ answer_text;
	            return label;

			}
		function populateSurveyQuestionsAndResults(question_data) {
			// always reset the survey modal to blank to clear it of previous surveys
				var questions_wrapper = document.querySelector("#survey_fieldset_wrapper");
					questions_wrapper.innerHTML = "";
			// loop through each question in the survey
				for (var q_index = 0; q_index < Object.keys(question_data).length; q_index++) {
					var question_identifier = question_data[ q_index ]["question_identifier"];
					var question_type = question_data[ q_index ]["question_type"];
					var question_text = question_data[ q_index ]["question_text"];

					// create a question li here
						var fieldset = createSurveyQuestionFieldset(
											question_identifier,
											question_type,
											question_text
										  );

					var answer_data = question_data[ q_index ]["answer_data"]
					// for selection based responses
						if (question_type == 1 || question_type == 2) {
							
							for (var a_index = 0; a_index < Object.keys(answer_data).length; a_index++) {
								// create the answer_li
									var label = 
										createAnswerForQuestionType12(
											a_index,
											answer_data,
											question_type,
											question_identifier
										);
								// append the element to the fieldset's ul
									fieldset.querySelector(".patron_response.content").appendChild(label);
							}
						}
					// for custom responses
						else if (question_type == 3) {
							// a custom question will have exactly one answer_item
								var answer_identifier = answer_data[0]["answer_identifier"];

							// create response li's with each custom answer response
								var textarea = document.createElement("textarea");

							// set the appropriate attributes
								textarea.className = "patron_response custom_response textarea";
								textarea.setAttribute("data-answer-identifier",answer_identifier)
							
							// append the element to the fieldset's content div
								fieldset.querySelector(".patron_response.content").appendChild(textarea);
						}

					// append the fieldset to the food_survey_wrapper
						questions_wrapper.appendChild(fieldset);
				}

			// set the food name in the modal to clafiry which item the surve is for
				updateGreetingBasedOnFood();

			// once the survey modal is populated with the questions, show the survey modal
				showElement(document.querySelector(".modal_overlay.food_survey"));
		}
	function populateAndShowSurveyModalForFood(food_identifier) {
		var data_object = {"food_identifier":food_identifier};
		var action = 3;

		function responseFunction(result) {
			// alert(result);
			var survey_data =  JSON.parse(result)[0];

			// set the data-survey-identifier ,propety of the survey modal
				document.querySelector("#food_survey_wrapper").setAttribute(
					"data-survey-identifier",survey_data["survey_identifier"]);

			populateSurveyQuestionsAndResults(survey_data["question_data"]);
			resetSurveyTriggersOnclickFunctions();
		}

		ajax(action,data_object,responseFunction,"populateAndShowSurveyModalForFood");
	}

//4 conditions to lauch a survey
	//1) Is there a currently an active survey for the food being displayed?
	//2) Did the user already provide feedback for this survey already?
	//3) Did the user wait the required amount of time to have "viewed" the food?
// NOTE: this function also records that the person has viewed the food by creating an entry where 
// is_intersted = 0, by default
	
	// This function checks if the food has an active survey AND
	// if the current user has not already provide a response. If 
	// both condition hold, the function sets the appropriate elements
	// onclick functions to lauch the survey depending on the survey's type
	// functions that send data to the database
	// function recordUserHasViewedFood(food_identifier) {
		
	// 	var data_object = {
	// 		"food_identifier": 		food_identifier,
	// 		"person_identifier": 	PERSON_IDENTIFIER
	// 	}

	// 	function responseFunction(result) {
	// 		// alert(result);
	// 	}
	// 	var action = 6;

	// 	ajax(action,data_object,responseFunction,"recordUserHasViewedFood");
	// }
		function checkFoodForNewSurveyAndRecordUserViewedFood(food_identifier) {
			var data_object = {
				"food_identifier":food_identifier,
				"person_identifier": PERSON_IDENTIFIER
			};
			var action = 4;

			function responseFunction(result) {
				// alert(result);
				// surveys are only triggered when you try to leave a food item
					if (result == true){
						document.querySelector("#single_img_view .upper_item_wrapper").
						setAttribute("onclick", "populateAndShowSurveyModalForFood('"+ 
						food_identifier +"')");
					}
			}

			ajax(action,data_object,responseFunction,"checkFoodForNewSurveyAndRecordUserViewedFood");
		}
	
// functions to collect survey data and send it to the database
// IMPORTANT NOTE: this does not currently perform form validation
	function collectAndSendSurveyData() {
		// handles the selction based answers
			var selection_answers = document.querySelectorAll(".patron_response.label input");
			var checked_answer_identifiers = [];

			// loop through all of selction answers to find the ones that were "checked"
				for (var i = 0; i < selection_answers.length; i++) {
					// we only want to update the database with selected answers that people "checked"
						if (selection_answers[i].checked) {
							checked_answer_identifiers.push(selection_answers[i].getAttribute("data-answer-identifier"));
						}
				}

			var text_answers = document.querySelectorAll(".patron_response.textarea");
			var custom_answers_identifiers_and_responses = {};
			// loop through all of the custom response and get their values
				for (var i = 0; i < text_answers.length; i++) {
					// we only want to send response that are not blank (THIS DOES NOT COUNT as form validation)
						if (text_answers[i].value != "") {
							custom_answers_identifiers_and_responses[ 
								text_answers[i].getAttribute("data-answer-identifier")] = text_answers[i].value;
						}
				}

			var survey_identifier = document.querySelector("#food_survey_wrapper").
				getAttribute("data-survey-identifier");
			var food_identifier = document.querySelector("#single_img_view").getAttribute("data-food-identifier");
			var data_object = {
				"checked_answer_identifiers"				:checked_answer_identifiers,
				"custom_answers_identifiers_and_responses"	:custom_answers_identifiers_and_responses,
				"person_identifier"							:PERSON_IDENTIFIER,
				"survey_identifier"							:survey_identifier,
				"food_identifier"							:food_identifier
			};
			var action = 5;

			function responseFunction(result) {
				// alert(result);
				// now that the survey data has been sent to the database, exit out of the survey modal
				hideSurveyModal();
			}

			ajax(action,data_object,responseFunction,"collectAndSendSurveyData");

			
	}

// search for food in CURRENT LIST modal functions
	function hideSearchForFoodModal(element,event) {
		if (event.target == element) {
			hideElement(element);
		}
	}
	// helper function
		function prepareSearchFoodModalForAllFoodsList(){
			var modal = document.querySelector(".modal_overlay.food_search");
			// change the placeholder message
				modal.querySelector("input").setAttribute("placeholder","Search All Foods");
			// clear the input of anyting previously typed
				modal.querySelector("input").value = "";
			// clear the list of any previous results
				modal.querySelector("ul").innerHTML = "";
		}
		function prepareSearchFoodModalForInterestList(){
			var modal = document.querySelector(".modal_overlay.food_search");
			// change the placeholder message
				modal.querySelector("input").setAttribute("placeholder","Search Interest List");
			// clear the input of anyting previously typed
				modal.querySelector("input").value = "";
			// clear the list of any previous results
				modal.querySelector("ul").innerHTML = "";
		}
	function showSearchForFoodModal() {
		// show the modal
			showElement( document.querySelector(".modal_overlay.food_search") );
		// foucus the input element
			document.querySelector("input.food_search").focus();
	}
	
	function showSearchedFoodItem(element) {
		var food_identifier = element.getAttribute("data-food-identifier");
		var category_identifier = element.getAttribute("data-category-identifier");

		// hide the search for food modal
			hideElement( document.querySelector(".modal_overlay.food_search") );

		// show the food in single image view
			// populate single img view
				populateSingleImgView(category_identifier, food_identifier)

			if (window.innerWidth < 650) {
				// reset the height of  the details for the next food
					tapOnDetails(document.querySelector(".lower_item_wrapper"));
					CURRENTLY_MOVING = false;
			}

			// reveal it
				revealSingleImgView();
	}
	// helper functions
		// helper functions for helper function
			function addFoodToSearchResultsList(food_name, food_identifier, category_identifier, results_list){
				// create the element
					var list_item = document.createElement("li");
				// set the appropriate properties
					list_item.className = "food_search";
					list_item.setAttribute("data-food-identifier",food_identifier);
					list_item.setAttribute("data-category-identifier",category_identifier);
					list_item.setAttribute("onclick", "showSearchedFoodItem(this)");
				// set the innerHTML
					list_item.innerHTML = food_name;
				// append the li to the provided list
				results_list.appendChild(list_item);
			}
		function searchAllFoodsListForMatch(query, results_ul) {
			for (var category_identifier in MASTER_CATEGORY_OBJECTS_DICT) {
				var food_dict = MASTER_CATEGORY_OBJECTS_DICT[ category_identifier ]["food_dict"];
				for (var food_identifier in food_dict) {
					var food_name = food_dict[ food_identifier ][ "food_name" ];
					if (food_name.toLowerCase().indexOf( query.toLowerCase() ) != -1) {
						addFoodToSearchResultsList(
							food_name, 
							food_identifier, 
							category_identifier, 
							results_ul
						);
					}
				}
			}
		}
		function searchInterestListForMatch(query, results_ul) {
			for (var food_type in INTEREST_LIST_DICT) {
				var food_type_list = INTEREST_LIST_DICT[ food_type ];
				for (var i = 0; i < food_type_list.length; i++) {
					var category_identifier = 
						ALL_FOODS_LIST[ food_type_list[i] ][ ALL_FOODS_LIST_CATEGORY_IDENTIFIER ];
					var food_identifier = 
						ALL_FOODS_LIST[ food_type_list[i] ][ ALL_FOODS_LIST_FOOD_IDENTIFIER ];
					var food_name = MASTER_CATEGORY_OBJECTS_DICT
						[ category_identifier ]["food_dict"][ food_identifier ]["food_name"];
					if (food_name.toLowerCase().indexOf( query.toLowerCase() ) != -1) {
						addFoodToSearchResultsList(
							food_name, 
							food_identifier, 
							category_identifier, 
							results_ul
						);
					}
				}
			}
		}
	function populateSearchResultsFromQuery(element) {
		// clear the search results list
			var results_ul = document.querySelector("ul.food_search");
			results_ul.innerHTML = "";

		var query = element.value;
		// var test = query.replace(/[^a-zA-Z0-9]/gi, "");
		// make sure the string is something sensical
			if (query != "") {
				// we want to show the appropriate results depending on which
				// list the user is looking at
					if (IS_VIEWING_INTEREST_LIST) {
						searchInterestListForMatch(query, results_ul);
					}
					else {
						searchAllFoodsListForMatch(query, results_ul);
					}
			}
	}























