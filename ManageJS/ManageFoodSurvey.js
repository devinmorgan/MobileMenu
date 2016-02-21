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



// GLOBAL CONSTANTS
var CLASS_TYPE_DICT = {"1":"single_response","2":"all_that_apply","3":"custom_response"};


// Functions
function revealNewSurveyTab() {
	// hide the survey results sub-tab
		hideElement(document.querySelector(".diagnosis_tab_container[data-survey-tab='1']"));
	// show the create new survey sub-tab
		showElement(document.querySelector(".diagnosis_tab_container[data-survey-tab='2']"));
}
function hideNewSurveyTab() {
	// hide the survey results sub-tab
		hideElement(document.querySelector(".diagnosis_tab_container[data-survey-tab='2']"));
	// show the create new survey sub-tab
		showElement(document.querySelector(".diagnosis_tab_container[data-survey-tab='1']"));
}

function createNewFeedbackQuestion(element, question_type) {
	var question_type = (question_type != null) ? question_type :
		element.getAttribute("data-question-type");
	var className = CLASS_TYPE_DICT[question_type];

	var questions_list = document.querySelector(".create_survey.questions_list[data-question-type='"+ question_type +"']");

	// create the list item
    	var question_li = document.createElement("li");

    // assigne it the appropriate properties
	    question_li.className = className + " create_survey question_li";

	// create its innerHTML NOTE: each question must have at least 2 possible options for it to be useful
		question_li.innerHTML = '<input type="text" class="'+ className +' create_survey question_input" />'+
                                '<span class="remove_right_sidebar_li" onclick="deleteQuestionOrAnswer(this)">'+
							   		'<div class="forward slash"></div>'+
							   		'<div class="backward slash"></div>'+
						  	    '</span>'+
                                '<ul class="'+ className +' create_survey answers_list" data-question-type="'+ question_type+'">'+
                                    '<li class="'+ className +' create_survey answer_li">'+
                                        '<input type="text" onkeydown="createNewAnswer(this)" '+
                                        		'class="'+ className +' create_survey answer_input" data-question-type="'+ question_type +'" />'+
                                        '<span class="remove_right_sidebar_li" onclick="deleteQuestionOrAnswer(this)">'+
									   	    '<div class="forward slash"></div>'+
										    '<div class="backward slash"></div>'+
								   	    '</span>'+
                                    '</li>'+
                                    '<li class="'+ className +' create_survey answer_li">'+
                                        '<input type="text" onkeydown="createNewAnswer(this)" '+
                                        		'class="'+ className +' create_survey answer_input" data-question-type="'+ question_type +'" />'+
                                        '<span class="remove_right_sidebar_li" onclick="deleteQuestionOrAnswer(this)">'+
									   	    '<div class="forward slash"></div>'+
										    '<div class="backward slash"></div>'+
								   	    '</span>'+
                                    '</li>'+
                                '</ul>';
    // append the list item to the list
    	questions_list.appendChild(question_li);
}

// if the person presses enter the element is passed as this
// when using this function to create new "answers" programatically, we will need to pass
// the last answer_li of the last question_li in the questions_list of choice
function createNewAnswer(element, question_type) {
	if (event.which == 13 || question_type != null) {
		var question_type = (question_type != null) ? question_type :
			element.getAttribute("data-question-type");
		var className = CLASS_TYPE_DICT[question_type];

		// we need to know which answer list to append the li to
			var target_answer_list;

		// if somebody presses enter, then the element will be passed and not the question_type
			if (element) {
				// so we can just get the li's parent ---> answers_list
				target_answer_list = element.parentElement.parentElement;
			}
		// if the computer is create the lists itself, it will pass the question_type and not the element
			else if (question_type) {
				// so we want to get the last answer_list in the HTML document
					var list_of_answer_lists = document.querySelectorAll(".create_survey.answers_list[data-question-type='"+ question_type +"']");
					target_answer_list = list_of_answer_lists[ list_of_answer_lists.length - 1 ];
			} 

		// create the list itme
	    	var answer_li = document.createElement("li");

	    // add the className and the data-question-type so that it can call createNewAnswer itself if prompted
		    answer_li.className = className + " create_survey answer_li";

		// set the innerHTML of the 
			answer_li.innerHTML =  	'<input type="text" onkeydown="createNewAnswer(this)" class="'+ 
										className +' create_survey answer_input" data-question-type="'+
									question_type +'"/>'+
			                        '<span class="remove_right_sidebar_li" onclick="deleteQuestionOrAnswer(this)">'+
								   	    '<div class="forward slash"></div>'+
									    '<div class="backward slash"></div>'+
							   	    '</span>';

	    target_answer_list.appendChild(answer_li);
	}
}


function deleteQuestionOrAnswer(element) {
	var list_item = element.parentElement;
	var list = list_item.parentElement;
	// if never let there be fewer than 2 options for a selection question otherwise that 
	// defeats the pupose of it being a selection
	if (list.getElementsByTagName("li").length > 2) { 
		list.removeChild(list_item);
	}
	
}

// functions to collect survey information from input fields
	// helper function
		// helper functions for helper functions
			function getQuestionsForQuestionType(question_type) {

				// get all of the questions li of from the ul with data-question-type = question_type
					var questions_li = document.querySelectorAll(".create_survey.questions_list"+
						"[data-question-type='"+ question_type +"'] .question_li");
				// initialize the dict that will store the questions and their answers
					var question_array = [];

				// loop through each question_li to get both the question text and the corresponding options
					for (var i = 0; i < questions_li.length; i++) {

						// get the questions text from the input
							var question_text = escapeHtml( questions_li[i].
								querySelector(".create_survey.question_input").value );

							if (question_text != "")
							{
								// loop through the entire list of possible answers to the question
									var options_li = questions_li[i].querySelectorAll(".create_survey.answer_li");
									var question_choices = [];

									for (var j = 0; j < options_li.length; j++) {

										var choice = escapeHtml( options_li[j].
											querySelector(".create_survey.answer_input").value );
										// store the option in the question_choices array
											if (choice != "") {
												question_choices.push(choice);
											}		
									}

								// assign the question text to the array of choices
									question_array.push({
										"question"		:question_text,
										"choices"		:question_choices,
										"question_type"	:question_type
									});
							}

						
					}

				return question_array;
			}
		function collectNewSurveyInformation() {
			// var survey_type = document.querySelector('input[name="survey_type"]:checked').value;
			var size = escapeHtml( document.querySelector("#survey_size_select").value );
			// var greeting = document.querySelector("#feedback_message_textarea").value;
			var food_identifier = escapeHtml( document.querySelector(".food_entry.food_selected").
				getAttribute("data-food-identifier") );
			var type1Qs = getQuestionsForQuestionType(1);
			var type2Qs = getQuestionsForQuestionType(2);
			var type3Qs = getQuestionsForQuestionType(3);

			return {
				"food_identifier"	:food_identifier,
				"size"				:size,
				"questions_list"	:type1Qs.concat(type2Qs).concat(type3Qs)
			};
		}
	function createSurvey() {
		var message = "Creating a new survey will delete any existing or past surveys from the database."+
			"Would you still like to continue?";

		
		var data_object = collectNewSurveyInformation();
		var action = 12;

		function responseFunction(result) {
			// alert(result);
			// hide the create survey tab and display the results tab
				hideNewSurveyTab();

			// since its a new survey, refresh the survey data being displayed
				populateSurveyTabWithFoodData();
		}
		// preform necessary form validation
			var single_response_ul = document.querySelector(".create_survey.single_response.questions_list");
			var all_that_apply_ul = document.querySelector(".create_survey.all_that_apply.questions_list");
			var custom_response_ul = document.querySelector(".create_survey.custom_response.questions_list");

			if (noChildInputsAreEmpty( single_response_ul ) &&
				noChildInputsAreEmpty( all_that_apply_ul ) &&
				noChildInputsAreEmpty( custom_response_ul ) ) {

				if (confirm(message)) {
					ajax(action,data_object,responseFunction,"createSurvey");
				}
			}
	}
// functions to cancel/ delete a survey for a given food
	function cancelFoodSurvey() {
		var message = "Canceling a survey will delete all of its information from the database."+
			"Would you still like to continue?";

			if (confirm(message)) {
				var food_identifier = document.querySelector(".food_entry.food_selected").
					getAttribute("data-food-identifier");


				var data_object = {"food_identifier":food_identifier};
				var action = 14;

				function responseFunction(result) {
					// alert(result);
					clearFoodSurveyResults();
				}

				ajax(action,data_object,responseFunction,"cancelFoodSurvey");
			}	
	}


// functions to populate the 1st survey tab (i.e. to display survey results)
	// helper functions 
		function clearFoodSurveyResults() {
			// provide reset values to the survey info elements
				document.querySelector("#survey_info_duration").innerHTML = "N/A";
				// document.querySelector("#survey_info_type").innerHTML = "N/A";
				document.querySelector("#survey_info_progress").innerHTML = "N/A";
				// document.querySelector("#survey_greeting_text").innerHTML = 
				// 	"This food has no active or past survey.";

			// clear all of the question lists
				document.querySelector(".survey_results.single_response.questions_list").
					innerHTML = "";
				document.querySelector(".survey_results.all_that_apply.questions_list").
					innerHTML = "";
				document.querySelector(".survey_results.custom_response.questions_list").
					innerHTML = "";
		}
		// helpfer function for helper functions
			function createSurveyQuestionLi(question_identifier, question_type, question_text) {
				var class_name = CLASS_TYPE_DICT[question_type];

				// create the new list item
					var question_li = document.createElement("li");
				// set its appropriate attributes
					question_li.className = "survey_results " + class_name + " question_li";
					question_li.setAttribute("data-question-identifier",question_identifier);

				// set the innerHTML
					question_li.innerHTML =     '<div class="survey_results '+ class_name +' question_text">'+
													"Question: "+question_text+
												'</div>'+
											    '<svg class="survey_results '+ class_name +' response_graph"></svg>'+
											    '<ul class="survey_results '+ class_name +' answers_list">'+
											    '</ul>'+
											    '<select onchange="plotCorrectData(this)" class="survey_results '+ class_name +' data_select"></select>';

                return question_li;
			}
			function createAnswerForQuestionType12(a_index, answer_data, question_type) {
				var answer_identifier = answer_data[a_index]["answer_identifier"];
				var answer_text = enterHtml( answer_data[a_index]["answer_text"] );
				var class_name = CLASS_TYPE_DICT[question_type];

				// create the list item
					var answer_li = document.createElement("li");
				// assign relevant attributes
					answer_li.className = "survey_results "+class_name+" answer_li";
					answer_li.setAttribute("data-answer-identifier", answer_identifier);
				// create the innertHTML for the answer_li
					answer_li.innerHTML = answer_text;

                return answer_li;

			}
			function createSelectForQuestionType12(question_type, data_array, description) {
				var class_name = CLASS_TYPE_DICT[question_type];

				// create the list item
					var option = document.createElement("option");
				// assign relevant attributes
					option.className = "survey_results "+class_name+" data_option";
					option.setAttribute("value", JSON.stringify(data_array) );
				// create the innertHTML for the option
					option.innerHTML = description;

                return option;
			}
		function populateSurveyQuestionsAndResults(question_data, num_ppl_surveyd) {
			// loop through each question in the survey
				for (var q_index = 0; q_index < Object.keys(question_data).length; q_index++) {
					var question_identifier = question_data[ q_index ]["question_identifier"];
					var question_type = question_data[ q_index ]["question_type"];
					var question_text = enterHtml( question_data[ q_index ]["question_text"] );

					// create a question li here
						var question_li = createSurveyQuestionLi(
											question_identifier,
											question_type,
											question_text
										  );

					var answer_data = question_data[ q_index ]["answer_data"];
					// for selection based responses
						if (question_type == 1 || question_type == 2) {
							var class_name = CLASS_TYPE_DICT[ question_type ];

							var answers_list = question_li.querySelector("ul.answers_list");
							var question_svg = question_li.querySelector("svg.response_graph");
							var data_select = question_li.querySelector("select.data_select");

							var cumulative_data_array = [];
							var interested_data_array = [];
							var not_interested_data_array = [];
							// console.log(answer_data);
							for (var a_index = 0; a_index < Object.keys(answer_data).length; a_index++) {
								// get the correct yes count for each data type
									var response_data = answer_data[ a_index ]["response_data"];
									var cumulative_yes, interested_yes, not_interested_yes;

									if (!Object.keys(response_data).length){
										console.log("it was empty");
										cumulative_yes = 0;
										interested_yes = 0;
										not_interested_yes = 0;
									}
									else {
										// each entry in response_data will have the count value so we need only look at the 1st entry
											cumulative_yes = response_data[0]["cumulative_count"];
											interested_yes = response_data[0]["interested_count"];
											not_interested_yes = response_data[0]["not_interested_count"];
											
									}
									console.log("answer:" + answer_data[ a_index ]["answer_text"]);
											console.log("cumulate:"+cumulative_yes);
											console.log("interested:"+interested_yes);
											console.log("not interested:"+not_interested_yes);
								cumulative_data_array.push(cumulative_yes);
								interested_data_array.push(interested_yes);
								not_interested_data_array.push(not_interested_yes);

								// append the answer options to the answer ul below each bar in the graph
									answers_list.appendChild( createAnswerForQuestionType12(a_index, answer_data, question_type) );
							}

							// append the select options to the select
								data_select.appendChild( createSelectForQuestionType12(
												question_type,
												cumulative_data_array,
												"Cumulative Responses"
											) );
								data_select.appendChild( createSelectForQuestionType12(
												question_type,
												interested_data_array,
												"Interested Responses"
											) );
								data_select.appendChild( createSelectForQuestionType12(
												question_type,
												not_interested_data_array,
												"Not Interested Responses"
											) );

							// create graph with all of the options' values
								var graph_object = new responseGraph(question_svg, cumulative_data_array);
								graph_object.drawGraph();
						}
					// for custom responses
						else if (question_type == 3) {
							// a custom question will have exactly one answer_item
								var response_data = answer_data[0]["response_data"];

							for (var r_index = 0; r_index < Object.keys(response_data).length; r_index++) {
								// create response li's with each custom answer response
									var custom_response_li = document.createElement("li");
								// set the appropriate attributes
									custom_response_li.className = "survey_results custom_response answer_li";
								// set the innerHTML
									custom_response_li.innerHTML = enterHtml( response_data[ r_index ]["response_text"] );
								// append the element to the question_li's ul
									question_li.querySelector(".answers_list").appendChild(custom_response_li);
							}
						}

					// append the question_li to the appropriate question_list
						var question_list = document.querySelector(".survey_results.questions_list"+
							"[data-question-type='"+ question_type +"']");
						question_list.appendChild(question_li);

				}
		}
	function populateSurveyTabWithFoodData() {
		var food_identifier = document.querySelector(".food_entry.food_selected").
			getAttribute("data-food-identifier");

		var data_object = {"food_identifier":food_identifier};
		var action = 13;

		function responseFunction(result) {
			// alert(result);
			var survey_data =  JSON.parse(result)[0];

			// if the food has an active survey
				if (survey_data["start_date"] != null) {
					var start_date = survey_data["start_date"].split(" ")[0];
					var end_date = (survey_data["end_date"] == null) ? 
						"Present" : survey_data["end_date"].split(" ")[0];
					document.querySelector("#survey_info_duration").innerHTML = start_date + " to " + end_date;

					// var survey_type = survey_data["survey_type"];
					// document.querySelector("#survey_info_type").innerHTML = 
					// 	 NOTE: possible values are 1-->interseted or 2--> not interested 
					// 	(survey_data["survey_type"] == 1) ? "Interested" : "Not Interested";

					var survey_size = survey_data["survey_size"];
					var surveys_remaining = survey_data["surveys_remaining"];
					var num_ppl_surveyd = survey_size - surveys_remaining;
					document.querySelector("#survey_info_progress").innerHTML = num_ppl_surveyd +
						" of " + survey_size + " people";

					// surveys no longer have cutom greetings so clear this element 
						// document.querySelector("#survey_greeting_text").innerHTML = "";

					populateSurveyQuestionsAndResults(survey_data["question_data"], num_ppl_surveyd);
				}
			// once the food survey data has been loaded, we need to populate the performance tab 
				drawPerformanceGraph();
		}

		// if there is no active survey, set everything the blank
			clearFoodSurveyResults();	

		ajax(action,data_object,responseFunction,"populateSurveyTabWithFoodData");
	}





    
    






















































    
    






































































