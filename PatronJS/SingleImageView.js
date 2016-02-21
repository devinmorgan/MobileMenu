// GLOBAL VARIABLES
	// the minimum time a person must look at a photo to  consider them as 
	// having "viewed" the photo
		var MIN_TIME_TO_VIEW_FOOD = 1000;
	// stores the timer id for the timer that times whether you "viewed" a
	// food sufficiently long or not
		var VIEWING_FOOD_TIMER;
	// keeps track of the number of food items the users has browsed (ignores interest list)
	// per time entering single_img_view (this is NOT cumulative)
		var NUM_FOODS_BROWSED = 0;
	// keeps track of whether the previous BROWSE photo was a random photo or not
		var JUST_SAW_RANDOM_PHOTO = false;
	// for every (k-1) foods the users browses (NOT views, BROWSES), the k-th will a random food
		var FREQUENCY_OF_RANDOM_PHOTOS = 10;
	// ensures that only 1 css transformation can happen at a time
		var CURRENTLY_MOVING = false;
	// the height that the details screen has moved (relevant for mobile screens only)
		var DETAILS_DELTA_HEIGHT = 0;
	// the default title_header text for a random photo
		var RANDOM_PHOTO_HEADER_TEXT = "Random Food!";


 // EVENT LISTENTERS
	document.addEventListener("keydown",function(event) {
		// keydown only applies if you are in single image view
			var single_img_view = document.querySelector("#single_img_view");
			if (single_img_view.className && single_img_view.className.indexOf("hide") == -1){
				navigateFoodsWithArrowKeys(event);
				escapeSingleViewModeAsModal(event);
			}
	}, false);
	
		function hideAppropriateSingleImgViewBtn() {
			var single_img_view = document.querySelector("#single_img_view");
			var category_identifier = single_img_view.getAttribute("data-category-identifier");
			var food_identifier = single_img_view.getAttribute("data-food-identifier");

			// determine whether to show the add to interest list or remove btn
			var buttons_wrapper = document.querySelector("#interested_in_food_wrapper");
			var add_to_list_btn = document.querySelector("#add_to_list");
			var remove_from_list_btn = document.querySelector("#remove_from_list");
			
			// when the buttons should be visible, determine the right one to show
				if 	( (window.innerWidth > 650) || 
					( (window.innerWidth < 650) && (DETAILS_DELTA_HEIGHT > 0) )	){
						showElement(buttons_wrapper);
					// it is already in the interest list
						if (foodTypeArrayIndex(category_identifier, food_identifier) > -1) {
							
							hideElement(add_to_list_btn);
							showElement(remove_from_list_btn);
						}
					// it is not in their interest list
						else {
							hideElement(remove_from_list_btn);
							showElement(add_to_list_btn);
						}
				}
			// when the buttons should not be visible hide them both
				else if ( 	(window.innerWidth < 650) &&
							!(DETAILS_DELTA_HEIGHT > 0)	) {
					hideElement(buttons_wrapper);
				}
		}
		function noLongerMoving(){CURRENTLY_MOVING = false;}
	function tapOnDetails(element) {

		if (!CURRENTLY_MOVING) {
			CURRENTLY_MOVING = true;
			var details_rect = element.getBoundingClientRect();
			var image_element = document.querySelector(".food_item_img").getBoundingClientRect();

			if (window.innerWidth < 650) {
				// we want to move the details div to the top of the image element
					DETAILS_DELTA_HEIGHT = details_rect.top - image_element.top;

				element.style.bottom = DETAILS_DELTA_HEIGHT + 4 + "px";
				
				if (DETAILS_DELTA_HEIGHT > 0) {
					element.style.overflow = "auto";
				}
				else {
					element.style.overflow = "hidden";
					element.scrollTop = 0;
				}
				hideAppropriateSingleImgViewBtn();
			}	
		}
	}

	function revealSingleImgView() {
		// remove the hide class from single_img_view
			var single_img_view = document.querySelector("#single_img_view");
			showElement(single_img_view);

		// on mobile devices, we want to hind multi_img_view when single_img_view
		// is visibile to prevent multi_img_view from accidentally appearing
		if (window.innerWidth < 650) {
			hideElement(document.querySelector("#multi_img_view"));
		}

		// set body.overflow = hidden
			document.querySelector("body").style.overflow = "hidden";
	}


// functions for navigating through foods
	function getAllFoodIndexForRandomPhoto() {
		// make a list of all the foods you have not seen yet
			var unseen_foods_list = [];
			for (var all_foods_list_index = 0; all_foods_list_index < 
				 ALL_FOODS_LIST.length; all_foods_list_index++) {

				var category_identifier = ALL_FOODS_LIST[ all_foods_list_index ]
					[ ALL_FOODS_LIST_CATEGORY_IDENTIFIER ];
				var food_identifier = ALL_FOODS_LIST[ all_foods_list_index ]
					[ ALL_FOODS_LIST_FOOD_IDENTIFIER ];

				if (MASTER_CATEGORY_OBJECTS_DICT[ category_identifier ]
					[ "food_dict" ][ food_identifier ][ "has_been_viewed" ] == false) {
					unseen_foods_list.push(all_foods_list_index);
				}
			}

		if (unseen_foods_list.length > 0) {
			return unseen_foods_list[ Math.floor((Math.random() *
			unseen_foods_list.length)) ];
		}
		else {
			return false;
		}	
	}
	// helper function 
		function resetFadeOutAnimations() {
			var fade_out_list = document.querySelectorAll(".fade_out");
			for (var i = 0; i < fade_out_list.length; i++) {
				var old_object = fade_out_list[i];
				var new_object = old_object.cloneNode(true);
				old_object.parentNode.replaceChild(new_object, old_object);
			}
		}
		function getIndexOfCurrentFood(category_identifier,food_identifier) {
			for (var i = 0; i < Object.keys(ALL_FOODS_LIST).length; i++) {
				if (ALL_FOODS_LIST[i][0] === category_identifier &&
					ALL_FOODS_LIST[i][1] === food_identifier) {
					return i;
				}
			}
		}
		//helper function for helper function
			function appropriateAllFoodIndexInInterestList(all_food_index, get_next_photo) {
				var oneD_interest_list = [];
				var interest_list_index = 0;
				var found_index = false;
				
				// construct the 1D version of interest list and find the location
				// of the current food
					for (var type in INTEREST_LIST_DICT) {
						for (var index in INTEREST_LIST_DICT[ type ]) {

							oneD_interest_list.push(INTEREST_LIST_DICT[ type ][ index ]);

							if (INTEREST_LIST_DICT[ type ][ index ] == all_food_index) {
								found_index = true;
							}

							if (!found_index) {
								interest_list_index++;
							}
						}
					}

				// next means 1 to the right
					if (get_next_photo) {
						// if the user is at the end of the list and tries to go forward
						// loop them to the begining of the list
							return (interest_list_index == oneD_interest_list.length - 1) ?  
							oneD_interest_list[0] : oneD_interest_list[ interest_list_index + 1 ];
					}
				// previous means 1 to the left
					else {
						// if the user is at the beginning of the list and tries to go back
						// loop them to the end of the list
							return (interest_list_index == 0) ? 
							oneD_interest_list[ oneD_interest_list.length - 1 ] :
							oneD_interest_list[ interest_list_index - 1 ];
					}
			}
			function justSawRandomPhoto(answer) {
				// set the global variable to the correct value
					JUST_SAW_RANDOM_PHOTO = answer;
				// change the class of item_contents accordingly
					if (JUST_SAW_RANDOM_PHOTO) {
						// reveal the star by providing .item_contents with the new class
							document.querySelector(".item_contents").className = 
							"item_contents random_item_content";
					}
					else {
							document.querySelector(".item_contents").className = 
							"item_contents";
					}
			}
	// helper function
		function populateWithAppropriatePhoto(get_next_photo) {
			var single_img_view = document.querySelector("#single_img_view");

			var category_identifier = single_img_view.getAttribute("data-category-identifier");
			var food_identifier = single_img_view.getAttribute("data-food-identifier");
			
			var all_food_index = getIndexOfCurrentFood(category_identifier,food_identifier);
			var food_type = MASTER_CATEGORY_OBJECTS_DICT[ category_identifier ]["category_type"];
			// var food_type_index = INTEREST_LIST_DICT[ food_type ].indexOf(all_food_index);

			var new_all_food_index;

				if (IS_VIEWING_INTEREST_LIST) {
					new_all_food_index = appropriateAllFoodIndexInInterestList(all_food_index, get_next_photo);

					// reset the system to not think the previous food was random
						justSawRandomPhoto(false);
				}
				else {
					var random_food_index = getAllFoodIndexForRandomPhoto();
					// if they are NOT in their interest list
						// it IS time for a random photo
							if ( (NUM_FOODS_BROWSED > 0) && /* don't do this on their first photo view */
								 (random_food_index != false) &&/* make sure there are still unseen photos left */
								 (NUM_FOODS_BROWSED % FREQUENCY_OF_RANDOM_PHOTOS == 0) /* time for random photo */) {

								new_all_food_index = random_food_index;

								// tell the system that we just viewed a random photo
									justSawRandomPhoto(true);
							}
						// it is NOT time for a random photo
							else if (get_next_photo) {
									if (JUST_SAW_RANDOM_PHOTO) {
										// set the index to where it was before the random photo
											all_food_index = ALL_FOOD_INDEX_FOR_LAST_FOOD ;
									}
								
								// if the user is at the end of the list and tries to go forward
								// loop them to the begining of the list
									new_all_food_index = (all_food_index == ALL_FOODS_LIST.length - 1) ? 0 : all_food_index + 1;

								// reset the system to not think the previous food was random
									justSawRandomPhoto(false);
									ALL_FOOD_INDEX_FOR_LAST_FOOD = new_all_food_index;
							}
							else {
									if (JUST_SAW_RANDOM_PHOTO) {
										// set the index to where it was before the random photo
											all_food_index = ALL_FOOD_INDEX_FOR_LAST_FOOD ;
									}

								// if the user is at the beginning of the list and tries to go back
								// loop them to the end of the list
									new_all_food_index = (all_food_index == 0) ? ALL_FOODS_LIST.length - 1 : all_food_index - 1;

								// reset the system to not think the previous food was random
									justSawRandomPhoto(false);
									ALL_FOOD_INDEX_FOR_LAST_FOOD = new_all_food_index;
							}
					// increase the browse count by 1
						NUM_FOODS_BROWSED++;
				}
			
			var new_category_identifier = ALL_FOODS_LIST[ new_all_food_index ][ ALL_FOODS_LIST_CATEGORY_IDENTIFIER ];
			var new_food_identifier = ALL_FOODS_LIST[ new_all_food_index ][ ALL_FOODS_LIST_FOOD_IDENTIFIER ];
			populateSingleImgView(new_category_identifier, new_food_identifier);
		}
	function interpretPictureClick(element, event) {
		// get the coordinates of the user's click
			var x_pos = event.clientX;
			var y_pos = event.clientY;
			var img_rect = element.getBoundingClientRect();

		// determine if the click happened on the left or right side of the photos or in the middle
			// click was on left edge of photo --> reveal prev photo
				if (x_pos < img_rect.left +  img_rect.width * FRACTIONAL_PROXIMITY_TO_IMG_EDGE) {

					populateWithAppropriatePhoto(false);
				}
			// click was on right edge of photo --> reveal next photo
				else if (x_pos > img_rect.left + img_rect.width - img_rect.width * FRACTIONAL_PROXIMITY_TO_IMG_EDGE) {

					populateWithAppropriatePhoto(true);
				}
			// click was  in the middle
				else {
					// reveal the "go back btn"
					resetFadeOutAnimations();
				}
	}

	function navigateFoodsWithArrowKeys(event){
		var single_img_view = document.querySelector("#single_img_view");
		var category_identifier = single_img_view.getAttribute("data-category-identifier");
		var food_identifier = single_img_view.getAttribute("data-food-identifier");
		var current_food_index = getIndexOfCurrentFood(category_identifier,food_identifier);

		// user clicks left --> go to previous
			if (event.which == 37) {
				populateWithAppropriatePhoto(false);
			}
		// user clicks right --> go to next	
			else if (event.which == 39) {
				populateWithAppropriatePhoto(true);
			}
	}

	function processNavigationClick(element,event){
		if(event.target==element){
			returnToMultiImgView();
		}
	}

// functions for Single Img view
	// helper functions
		// helper functions for helper function
			function createNewPortionSize(portion ,price) {
				var new_portion_li = document.createElement("li");
				new_portion_li.className = "food_item_info_li portions_and_price";
				new_portion_li.innerHTML = '<span class="food_item_info_span_L portions_and_price">'+enterHtml(portion)+'</span>'+
				              			   '<span class="food_item_info_span_R portions_and_price">'+enterHtml(price)+'</span>';
				  
				return new_portion_li;
			}
		function populatePortionsAndPrices(portion_prices) {
			var section_wrapper = document.querySelector(".item_details_component.portions_and_price");

			var portions_ul = document.querySelector(".food_item_info_ul.portions_and_price");
			portions_ul.innerHTML = "";
			// recall that portion_prices is an encoded string that stores items and
			// their corresponding prices
				var portions_data = portion_prices.split(PORTIONS_ITEM_PRICE_PAIRS_DELIMITER);
				if (portion_prices.length > 20 ) {
					// display the section
						showElement(section_wrapper);

					// populate its contents
						for (var i = 0; i < portions_data.length -1; i++) {
							var portion = portions_data[i].split(PORTIONS_ITEM_DELIMITER)[0];
							var price = portions_data[i].split(PORTIONS_ITEM_DELIMITER)[1];

							// create an portions_li for each item/price pair
								portions_ul.appendChild(createNewPortionSize(portion, price));
						}
				}
				else {
					// hide the section
						hideElement(section_wrapper);
				}
		}
		// helper functions for helper function
			function createNewUpsaleItem(item ,price) {
				var new_portion_li = document.createElement("li");
				new_portion_li.className = "food_item_info_li substitutions_and_extras";
				new_portion_li.innerHTML = '<span class="food_item_info_span_L substitutions_and_extras">'+
												enterHtml(item)+
										    '</span>'+
				              			    '<span class="food_item_info_span_R substitutions_and_extras">'+
				              			   		enterHtml(price)+
				              			   	'</span>';
				  
				return new_portion_li;
			}
		function populateExtrasAndSubstitutions(upsales) {
			var section_wrapper = document.querySelector(".item_details_component.substitutions_and_extras");

			var upsales_ul = document.querySelector(".food_item_info_ul.substitutions_and_extras");
			upsales_ul.innerHTML = "";
			// recall that upsales is an encoded string that stores items and
			// their corresponding prices
				var upsales_data = upsales.split(UPSALES_ITEM_PRICE_PAIRS_DELIMITER);
				if (upsales.length > 20 ) {
					// display the section
						showElement(section_wrapper);

					// populate its contents
						for (var i = 0; i < upsales_data.length -1; i++) {
							var item = upsales_data[i].split(UPSALES_ITEM_DELIMITER)[0];
							var price = upsales_data[i].split(UPSALES_ITEM_DELIMITER)[1];

							// create an upsale_li for each item/price pair
								upsales_ul.appendChild(createNewUpsaleItem(item, price));
						}
				}
				else {
					// hide the section
						hideElement(section_wrapper);
				}
		}
		// helper functions for helper function
			function createNewServedWithLI(instructions, options_list) {
		        var new_served_with_li = document.createElement("li");
		        new_served_with_li.className = "food_item_info_li served_with";
		        var innerHTML = instructions+' ';
		        // create and append an option_li to the option_ul that belongs to the instruction_ul
				// as each option_li is created set its input value to option
					for (var j = 0; j < options_list.length; j++) {
						innerHTML += enterHtml(options_list[j])
						if (j <= options_list.length - 4) {
							 innerHTML += ", ";
						}
						else if (j == options_list.length - 3) {
							innerHTML += ", and ";
						}
					}

				new_served_with_li.innerHTML = innerHTML;
				return new_served_with_li;
		    }
		function populateServedWith(wrapper,ul,served_with) {
			var section_wrapper = wrapper;
			// 1st get the instructions ul
			var served_with_ul = ul;
			served_with_ul.innerHTML = "";
			
			// recall that served_with is an encoded string that stores inctructions
			// and all of the options associated with them
				var sw_data = served_with.split(SERVED_WITH_SEGMENT_DELIMITER);
				if (served_with.length > 20) {
					// display the section
						showElement(section_wrapper);

					// populate its contents
						for (var i = 0; i < sw_data.length -1; i++) {
							var instructions = sw_data[i].split(SERVED_WITH_INSTRUCTION_DELIMITER)[0];
							var options_list = sw_data[i].split(SERVED_WITH_INSTRUCTION_DELIMITER)[1].
								split(SERVED_WITH_OPTION_DELIMITER);

							// create a served_with_li for each item/price pair
								served_with_ul.appendChild(createNewServedWithLI(instructions, options_list));
						}
				}
				else {
					// hide the section
						hideElement(section_wrapper);
				}
		}

	//helper function
		function populateSingleImgView(category_identifier, food_identifier) {
			var category_object = MASTER_CATEGORY_OBJECTS_DICT[ category_identifier ];
			var num_foods = Object.keys( category_object["food_dict"] ).length;
			var food_object = category_object["food_dict"][ food_identifier ];
			
			// populate the screen with the necessary data
				if (JUST_SAW_RANDOM_PHOTO) {
					// alter the title of .header_title with RANDOM_PHOTO_HEADER_TEXT 
						document.querySelector("#single_img_view .header_title").innerHTML =
						RANDOM_PHOTO_HEADER_TEXT;
				} 
				else {
					document.querySelector("#single_img_view_header .header_title").innerHTML = food_object["food_name"];
				}
				document.querySelector("#single_img_view_header .category_talley").innerHTML = category_object["category_name"];
				document.querySelector("#single_img_view .food_item_img").src = food_object["photo_src"];
				document.querySelector(".item_details_component .food_title_header").innerHTML = food_object["food_name"];
				document.querySelector("#single_img_view .item_details_component .food_item_details_p").innerHTML = food_object["food_description"];

				var section_wrapper = document.querySelector("#single_img_view .item_details_component.served_with");
				var served_with_ul = document.querySelector("#single_img_view .food_item_info_ul.served_with");
				populateServedWith(section_wrapper, served_with_ul, category_object["served_with"]);
				populateExtrasAndSubstitutions(category_object["upsales"]);
				populatePortionsAndPrices(food_object["portion_prices"]);

			// set the single_img_view with food identifier and category identifier
				var single_img_view =  document.getElementById("single_img_view");
				single_img_view.setAttribute("data-food-identifier", food_identifier);
				single_img_view.setAttribute("data-category-identifier", category_identifier);


			// indicate that the photo has now been seen for MIN_TIME_TO_VIEW_FOOD
			// in order to consider it as "viewed"
				clearTimeout(VIEWING_FOOD_TIMER);
				VIEWING_FOOD_TIMER = setTimeout(function() { 
										// set has_been_viewed to true in the MASTER_CATEGORY_OBJECTS_DICT
											food_object["has_been_viewed"] = true;

											// WARNING PUT IT INSIDE THE IF STATEMENT BELOW!!
												checkFoodForNewSurveyAndRecordUserViewedFood(food_identifier); 

										// add the food to the HAS_BEEN_VIEWED_DICT and save
											if (HAS_BEEN_VIEWED_DICT[ food_identifier ] == null) {

												// only check if food has a survey after they have seen
												// the food the first time. This way we only ask a user once
												// if they would be willing to provide feedback -->AND<--
												// by default, add a food_data entry to the database with is_interested = 0
												// this will mean that they "viewed" the food but it was not sufficiently
												// interesting (hence 0 and not 1)
													// checkFoodForNewSurveyAndRecordUserViewedFood(food_identifier);

												HAS_BEEN_VIEWED_DICT[ food_identifier ] = "0";
												if (typeof(Storage) !== "undefined") {
												    localStorage.setItem("HAS_BEEN_VIEWED_DICT", JSON.stringify(HAS_BEEN_VIEWED_DICT));
												}
												else {
												    console.log("local storage not supported on this browser");
												}
											}

									}, MIN_TIME_TO_VIEW_FOOD);		

			// for screen sizes larger than 650px, tap on details will never get called so we
			// must call this here to determine which buttn to display
				if (window.innerWidth > 650) {
					hideAppropriateSingleImgViewBtn();
				}
		}	
	function showFoodInSingleImgView(element) {
		// we want to make sure that whenever you click to view a particular food, you
		// always see it when you click on it (as oppossed to seeing a random food)
		// and that you are not in "random food" mode
			NUM_FOODS_BROWSED = 0;
			document.querySelector(".item_contents").className = "item_contents";

		var food_identifier = element.getAttribute("data-food-identifier");
		var category_identifier = element.getAttribute("data-category-identifier");

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

// functions that specifically apply to desktop view
	function escapeSingleViewModeAsModal(e) {
		if (e.keyCode == 27 &&
			window.innerWidth > 650) {
			returnToMultiImgView();
		}
	}






































