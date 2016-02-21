// functions for Interest List foods and HTML
	function addFoodToInterestList() {
		// collect the category & and food identifer to obtain the
		// objects index in the ALL_FOODS_LIST
			var single_img_view = document.querySelector("#single_img_view");
			var category_identifier = single_img_view.getAttribute("data-category-identifier");
			var food_identifier = single_img_view.getAttribute("data-food-identifier");
			var current_food_index = getIndexOfCurrentFood(category_identifier,food_identifier);

		// collect the food's "type"
			var food_type = MASTER_CATEGORY_OBJECTS_DICT[ category_identifier ]["category_type"];

		// add the food to the appropriate "type" in INTEREST_LIST_DICT (make sure it is not already that list)
			if (INTEREST_LIST_DICT[ food_type ].indexOf( current_food_index ) == -1) {
				// adds the food to the interest list
					INTEREST_LIST_DICT[ food_type ].push(current_food_index);

				// adds the food to HAS_BEEN_VIEWED_DICT
					HAS_BEEN_VIEWED_DICT[ food_identifier ] = food_type;

				// stores the updated INTEREST_LIST_DICT in local storage to be used by a user if
				// the page crashes or if they come back without making an account
					if (typeof(Storage) !== "undefined") {
					    localStorage.setItem("HAS_BEEN_VIEWED_DICT", JSON.stringify(HAS_BEEN_VIEWED_DICT));
					}
					else {
					    console.log("local storage not supported on this browser");
					}

				// update the database with the person's is_interested status for this food
					recordInterestInFoodItem(true, food_identifier);
			}

		// since they added it to their list, mark it as being viewed
			MASTER_CATEGORY_OBJECTS_DICT[ category_identifier ][ "food_dict" ]
			[ food_identifier ][ "has_been_viewed" ] = true;

		// switch the buttons now that the item has been added
			hideAppropriateSingleImgViewBtn();
	}

	// helper function
		function foodTypeArrayIndex(category_identifier, food_identifier) {

			var ALL_FOODS_LIST_index = getIndexOfCurrentFood(category_identifier,food_identifier);

			for (var type in INTEREST_LIST_DICT) {
				for (var i = 0; i < Object.keys(INTEREST_LIST_DICT[type]).length;i++) {
					if (INTEREST_LIST_DICT[type][i] === ALL_FOODS_LIST_index) {
						return i;
					}
				}
			}
			return -1;
		}
	function removeFromInterestList() {
		// collect the category & and food identifer to obtain the
		// objects index in the ALL_FOODS_LIST
			var single_img_view = document.querySelector("#single_img_view");
			var category_identifier = single_img_view.getAttribute("data-category-identifier");
			var food_identifier = single_img_view.getAttribute("data-food-identifier");
			var food_type = MASTER_CATEGORY_OBJECTS_DICT[ category_identifier ]["category_type"];
			
		var food_type_array_index = foodTypeArrayIndex(category_identifier, food_identifier);
		// checks to make sure that the item is in INTEREST_LIST_DICT so it can actually
		// delete it
			if (food_type_array_index > -1) {
				INTEREST_LIST_DICT[ food_type ].splice(food_type_array_index,1);

				// "0" implies not interested because it does not correspond to a real type index
					HAS_BEEN_VIEWED_DICT[ food_identifier ] = "0";

				// stores the updated INTEREST_LIST_DICT in local storage to be used by a user if
				// the page crashes or if they come back without making an account
					if (typeof(Storage) !== "undefined") {
					    localStorage.setItem("HAS_BEEN_VIEWED_DICT", JSON.stringify(HAS_BEEN_VIEWED_DICT));
					}
					else {
					    console.log("local storage not supported on this browser");
					}

				// update the database with the person's is_interested status for this food
					recordInterestInFoodItem(false, food_identifier);
			}

		if (IS_VIEWING_INTEREST_LIST) {
			// if single image view, return to multi image view
				returnToMultiImgView();
			// refresh the interest list to to get rid of food
				showInterestList();
		}
		else {
			// switch the buttons now that the item has been removed
				hideAppropriateSingleImgViewBtn();
		}
	}
	// helper function
		function blurUnselectedFoodsIfNecessary() {
			for (var food_type in FOOD_TYPE_KEYS) {
				// get all of the food_li for of food_type in the interest list
					var food_li_array = document.querySelectorAll(".food_section_wrapper"+
						"[data-food-type='"+ food_type +"'] .food_section_img_li");

				// we will also change the header of the type too if a selected food exists
					var food_type_header = document.querySelector(".food_section_wrapper"+
						"[data-food-type='"+ food_type +"'] .chossen_food_name");

				// see if there are any selected elements of the current type
					var food_type_class_name = "selected_food_of_type_"+food_type;
					var selected_element = document.querySelector("."+food_type_class_name);

				// make all the other ones opacity of UNSELECTED_FOOD_OPACITY or 1
				// depending on whether there is a selected_element
					for (var i = 0; i < food_li_array.length; i++) {
						food_li_array[i].style.opacity = (selected_element != null) ?
						UNSELECTED_FOOD_OPACITY : 1;
					}

				// if there is a selected element, make its opacity 1 and 
					if (selected_element) {
						selected_element.style.opacity = 1;

						// set the currently selected food name in the foood_type_header
							food_type_header.innerHTML = "Your favorite is <b>" + selected_element.
							querySelector(".food_item_title").innerHTML +"</b>!";
					}
					else {
						// reset the currently selected food name in the foood_type_header
							food_type_header.innerHTML = DEFAULT_FOOD_TYPE_SUBHEADER;
					}
			}
		}
	function selectInterestedFood(element) {
		var category_identifier = element.getAttribute("data-category-identifier");
		var food_identifier = element.getAttribute("data-food-identifier");

		var food_type_wrapper = element.parentElement.parentElement;
		var food_type = food_type_wrapper.getAttribute("data-food-type");
		var food_type_class_name = "selected_food_of_type_"+food_type;

		var previously_selected_element = document.querySelector("."+food_type_class_name);
		// if there are any other selected foods for this type, unselect them (there will be at most 1)
			if (previously_selected_element === element) {
				// they are de-selecting the currently selected food
					previously_selected_element.className = "food_section_img_li";
				
				// save to FAVORITES_DICT
					FAVORITES_DICT[food_type] = "";
			}
			else {
				if (previously_selected_element) {
					// they are selecting a new food
						previously_selected_element.className = "food_section_img_li";
				}
				// now highlight the selected element
					element.className = "food_section_img_li "+food_type_class_name;
				// save to FAVORITES_DICT
					FAVORITES_DICT[food_type] = food_identifier;	
			}
			
		if (typeof(Storage) !== "undefined") {
		    localStorage.setItem("FAVORITES_DICT", JSON.stringify(FAVORITES_DICT));
		}
		else {
		    console.log("local storage not supported on this browser");
		}

		blurUnselectedFoodsIfNecessary();
	}
	// helper functions
		function populateInterestListSections() {

			for (var food_type in FOOD_TYPE_KEYS) {
				var food_section_ul = document.querySelector(".food_section_wrapper"+
					"[data-food-type='"+ food_type +"'] .food_section_img_list");

				var indecies_of_foods_in_type = INTEREST_LIST_DICT[ food_type ];
				// for each food in the type's add it to the section list
					for (var i in indecies_of_foods_in_type) {
						var all_foods_list_index = indecies_of_foods_in_type[i];

						var category_identifier = ALL_FOODS_LIST[ all_foods_list_index ]
							[ALL_FOODS_LIST_CATEGORY_IDENTIFIER];
						var food_identifier = ALL_FOODS_LIST[ all_foods_list_index ]
							[ALL_FOODS_LIST_FOOD_IDENTIFIER];

						var food_dict =  MASTER_CATEGORY_OBJECTS_DICT[ category_identifier ]["food_dict"];
						var photo_src = food_dict[ food_identifier ]["photo_src"];
						var food_name = food_dict[ food_identifier ]["food_name"];

						// create new food list_item
							var food_li = document.createElement("li");

						// supply the appropriate className depending on whether the food has been selected or not
							// 1 food was selected
								if (food_identifier == FAVORITES_DICT[ food_type ]) {
									var food_type_class_name = "selected_food_of_type_"+food_type;
									food_li.className = "food_section_img_li " + food_type_class_name;
								}
							// NO foods were selected
								else {
									food_li.className = "food_section_img_li";
								}

						// set the appropriate attributes
							food_li.setAttribute("onclick","doubleclick(this, showFoodInSingleImgView, selectInterestedFood)");
							food_li.setAttribute("data-food-identifier",food_identifier);
							food_li.setAttribute("data-category-identifier",category_identifier);

						// set the innerHTML
							food_li.innerHTML = '<img class="food_section_img" src="'+ photo_src +'" alt="'+ food_name +'" />'+
												'<div class="food_item_info_wrapper desktop">'+
											        '<h4 class="food_item_title desktop">'+ food_dict[ food_identifier ]["food_name"] +'</h4>'+
											        '<p class="food_item_details_p desktop">'+ food_dict[ food_identifier ]["food_description"] +'</p>'+
											    '</div>';

						// append the element to the ul
							food_section_ul.appendChild(food_li);
						// once the food_li is made, this will append the served_with contents to it
							var served_with_ul = document.createElement("ul");
							served_with_ul.className = "food_item_info_ul desktop";
							populateServedWith(served_with_ul,served_with_ul, MASTER_CATEGORY_OBJECTS_DICT[ category_identifier ]["served_with"]);
							food_li.querySelector(".food_item_info_wrapper.desktop").appendChild(served_with_ul);
					}
			}
			blurUnselectedFoodsIfNecessary();
		}

	function showInterestList() {
		// clear the multi_img_view 
			var multi_img_view = document.querySelector("#multi_img_view");
			multi_img_view.innerHTML = "";

		// for each food type, create a new section wrapper
			for (var i = 1; i <= 4; i++) {
				// create the element
					var section_wrapper = document.createElement("div");

				// set the appropriate attributes
					section_wrapper.className = "food_section_wrapper";
					section_wrapper.setAttribute("data-food-type",""+i+"")

				// set the inner HTML
					section_wrapper.innerHTML = '<div class="header">'+
													'<div class="header_title">'+FOOD_TYPE_KEYS[i]+'</div>'+
													'<div class="chossen_food_name">'+ DEFAULT_FOOD_TYPE_SUBHEADER +'</div>'+
												'</div>'+
												'<ul class="food_section_img_list"></ul>';
												
				// append it to multi_img_view
					multi_img_view.appendChild(section_wrapper);
			}

		// populate each food type section with its foods
			populateInterestListSections();

		// then quit out of the single view and show it
			returnToMultiImgView();

		// used by "next" and "prev" photo to determine the next photo to show
			IS_VIEWING_INTEREST_LIST = true;
		// change the search search_food modal appropriately
			prepareSearchFoodModalForInterestList();
	}


// interest_list data handling and processing
	function createInterestListDictFromHasBeenViewedDict() {
		// NOTE: this function inherently checks whether a food still exists or not
		// so if the restaurant's data base changes, this will funciton takes prevents
		// outdated items from being added to the interest list

		// loop through each food in the ALL_FOODS_LIST
			for (var all_foods_list_index = 0; all_foods_list_index < ALL_FOODS_LIST.length;
				all_foods_list_index++) {
					// check to see if any of those foods are in HAS_BEEN_VIEWED_DICT
					// and if their value is NOT "0" (i.e. "1"-"4")
						for (var food_identifier in HAS_BEEN_VIEWED_DICT) {
							if (HAS_BEEN_VIEWED_DICT[ food_identifier ] != "0" && 
								ALL_FOODS_LIST[ all_foods_list_index ]
								[ ALL_FOODS_LIST_FOOD_IDENTIFIER ] == food_identifier) {

								INTEREST_LIST_DICT[ HAS_BEEN_VIEWED_DICT[ food_identifier ] ].push(all_foods_list_index);
								
								break;
							}
						}
			}
	}
	function trimIllegalInterestListItems() {
		// if for whatever reason, an item is deleted or added while a somebody is using
		// this and they refresh the page, we want to make sure that the SAVED interest list
		// data is still valid
		for (var type in INTEREST_LIST_DICT) {
			for (var i = 0; i < INTEREST_LIST_DICT[ type ].length; i++) {
				if (INTEREST_LIST_DICT[ type ][i] >= ALL_FOODS_LIST.length){
					INTEREST_LIST_DICT[ type ].splice(i,1);
				}
			}
		}
	}
	function recordInterestInFoodItem(is_interested, food_identifier) {

		// we only want to collect data from people that have localStorage (i.e. they
		// they will have constant person_identifier) so that the data does not get
		// contaminated with duplicate data
			if (PERSON_IDENTIFIER != null) /* <----No person_identifier IMPLIES no localStorage f*/{
				//------------------------------------------------------------------------------//
				// TESTING FOR GEO-VALIDITY GOES HERE <-------------							//
				// Here is where we would want to check either the IP address or the person's 	//
				// approximate GPS to make sure they are actually at the restaurant and not 	//
				// causually taking the survey somewhere else (which would contaminate the data)//
				//------------------------------------------------------------------------------//

				// Assuming the person has BOTH a persistent unique_identifier AND is actually at
				// the restaurant, we will proceed to submit their data to the database
					var action = 2;
					var data_object = {
						"food_identifier": food_identifier,
						"person_identifier": PERSON_IDENTIFIER,
						"is_interested": is_interested
					}

					function responseFunction(result) {
						// alert(result);
					}
					ajax(action,data_object,responseFunction,"recordInterestInFoodItem");
			}
	}
	
