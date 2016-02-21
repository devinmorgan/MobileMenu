// Functions to toggle States (i.e. hide or show)
	

	
	function returnToMultiImgView() {
		// apply the hide class to single_img_view
			var single_img_view = document.querySelector("#single_img_view");
			hideElement(single_img_view);

		// make sure to reveal the multi_img_view if it was hidden
			var multi_img_view = document.querySelector("#multi_img_view");
			showElement(multi_img_view);

		// set body.overflow = hidden
			document.querySelector("body").style.overflow = "auto";

		// set the category talleys when you escape single_img_view
			updatedViewCountForCategoryHeaders();
	}




// Populate the screen with data Functions
	// helper function
		function numberItemsViewedInCategory(category_identifier) {
			var num_viewed = 0;
			for (var food_identifier in MASTER_CATEGORY_OBJECTS_DICT[ category_identifier ]["food_dict"]) {
				if (MASTER_CATEGORY_OBJECTS_DICT[ category_identifier ]["food_dict"]
					[ food_identifier ]["has_been_viewed"] == true) {
					num_viewed++;
				}
			}
			return num_viewed;
		}
	
	function updatedViewCountForCategoryHeaders(){
		var food_section_wrappers = document.querySelectorAll(".food_section_wrapper");
		for (var i = 0; i < food_section_wrappers.length; i++) {
			var category_identifier = food_section_wrappers[i].getAttribute("data-category-identifier");

			// if category_identifier is every === "undefined", then its because the user is trying to go
			// to their interest list in which case this function, updatedViewCountForCategoryHeaders,
			// has no point so just escape it
			if (category_identifier == null){
				break;
			}

			food_section_wrappers[i].querySelector(".header .category_talley").
				innerHTML = "Seen "+ numberItemsViewedInCategory(category_identifier) +
							" of " + Object.keys(MASTER_CATEGORY_OBJECTS_DICT[ category_identifier ]["food_dict"]).length;
		}
	}

	// helper functions 
		
		function populateCategorySectionWithFoods(category_identifier) {
			var food_section_ul = document.querySelector(".food_section_wrapper"+
				"[data-category-identifier='"+ category_identifier +"'] .food_section_img_list");
			var food_dict = MASTER_CATEGORY_OBJECTS_DICT[category_identifier]["food_dict"];

			for (var food_identifier in food_dict) {

				var photo_src = food_dict[ food_identifier ]["photo_src"];
				var food_name = food_dict[ food_identifier ]["food_name"];

				// create new food list_item
					var food_li = document.createElement("li");

				// set the appropriate attributes
					food_li.className = "food_section_img_li";
					food_li.setAttribute("onclick","showFoodInSingleImgView(this)");
					food_li.setAttribute("data-food-identifier",food_identifier);
					food_li.setAttribute("data-category-identifier",category_identifier);


				// set the innerHTML
					food_li.innerHTML = '<img class="food_section_img" src="'+ photo_src +'" alt="'+ food_name +'" draggable="false"/>'+
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
		function createFoodSectionForCategory(category_identifier) {
			var category_name = MASTER_CATEGORY_OBJECTS_DICT[ category_identifier ]["category_name"];
			var numb_foods = Object.keys( MASTER_CATEGORY_OBJECTS_DICT[category_identifier]["food_dict"] ).length;

			// create new_category_section div
				var new_category_section = document.createElement("div");

			// set the appropriate attributes
				new_category_section.className = "food_section_wrapper";
				new_category_section.setAttribute("data-category-identifier",category_identifier);

			// set its innerHTML
				new_category_section.innerHTML = 	'<div class="header">'+
														'<span class="header_title">'+ category_name +'</span>'+
														'<div class="category_talley">Seen 0 of '+ numb_foods +'</div>'+
													'</div>'+
													'<ul class="food_section_img_list"></ul>';
			// append it to multi_img_view
				document.querySelector("#multi_img_view").appendChild(new_category_section);

			// populate the food_section_img_list with appropriate foods
				populateCategorySectionWithFoods(category_identifier)
			
		}
	function loadAllPhotoObjectsAndCategories(restaurant_identifier) {
		var action = 1;
		var data_object = {
			"restaurant_identifier": restaurant_identifier
		};
	
		function responseFunction(result){
			if (!result) {
				// a restuarnt_identifier WAS PASSED but it WAS BAD
					alert("It appears that the restaurant you are trying to view doesn't exist :(\n\n"+
						"We will redirect you back to the homepage so you can search for a different one!");
					window.location.replace(MOBILE_MENU_HOMEPAGE_URL);
			}
			else {

				category_data_array = JSON.parse(result);
				for (var category_index = 0; category_index < Object.keys(category_data_array).length; category_index++) {

					var category_identifier = category_data_array[ category_index ]["category_identifier"];
							
					// Create a food_object for each food in the category to contains its data
						var category_dict_of_foods = {};
						var food_dict = category_data_array[ category_index ]["food_dict"];

						for (var food_index = 0; food_index < Object.keys(food_dict).length; food_index++) {
								var food_object = { 
									// database information
										"photo_src": 			food_dict[ food_index ]["photo_src"],
										"food_name": 			food_dict[ food_index ]["food_name"],
										"food_description": 	food_dict[ food_index ]["food_description"],
										"portion_prices": 		food_dict[ food_index ]["portion_prices"],
															// if the item is in HAS_BEEN_VIEWED_DICT, then it has been viewed already
										"has_been_viewed": 		HAS_BEEN_VIEWED_DICT[ food_dict[ food_index ]["food_identifier"] ] != null
								}

							// add the food object to the category's food dictionary
								category_dict_of_foods[  food_dict[ food_index ]["food_identifier"]  ] = food_object;

							// add category/ food pair to indexing array
								ALL_FOODS_LIST.push( [ 
														category_data_array[ category_index ]["category_identifier"],
														food_dict[ food_index ]["food_identifier"] 
													]);
						}

					// create the actual category object
						var category_object = {
							// category related info
								"category_name": 	category_data_array[ category_index ]["category_name"],
								"menu_position":	category_data_array[ category_index ]["menu_position"],
								"category_type": 	category_data_array[ category_index ]["category_type"],
								"served_with": 		category_data_array[ category_index ]["served_with"],
								"upsales": 			category_data_array[ category_index ]["upsales"],
								"food_dict": 		category_dict_of_foods
						}

					// add to master data structure
						MASTER_CATEGORY_OBJECTS_DICT[ category_identifier ] = category_object;
				}

				// called once the appropriate information has been added
					setRestaurantName(category_data_array[0]["restaurant_name"]);
					showCategoriesList();
					createInterestListDictFromHasBeenViewedDict();
					updatedViewCountForCategoryHeaders();
					createCategoryDropDownMenu();
					checkForPassedFoodIdentifiers();
			}		
		}

		ajax(action,data_object,responseFunction,"loadAllPhotoObjectsAndCategories");
	}
	
	// helper fucntion 
		function categoryIdentiferAtMenuPosition(menu_position) {
			for (var category_identifier in MASTER_CATEGORY_OBJECTS_DICT) {
				if (MASTER_CATEGORY_OBJECTS_DICT[ category_identifier ]["menu_position"] ==
					menu_position) {
					return category_identifier;
				}
			}
			console.log("ERROR @ categoryIdentiferAtMenuPosition: menu_position not found");
		}
	function showCategoriesList() {
		// clear the multi_img_view 
			var multi_img_view = document.querySelector("#multi_img_view");
			multi_img_view.innerHTML = "";

		// for each category in, at the correct menu_position, create its HTML
			for (var i = 0; i < Object.keys( MASTER_CATEGORY_OBJECTS_DICT ).length; i++) {
				// get the correct cagtegory_identifier
					var category_identifier = categoryIdentiferAtMenuPosition(i);

				// create ALL the html for the category
					createFoodSectionForCategory(category_identifier);
			}

		// if they are in single view, get out of it
			returnToMultiImgView();

		// used by "next" and "prev" photo to determine the next photo to show
			IS_VIEWING_INTEREST_LIST = false;

		// alter the search_search modal for all foods list
			prepareSearchFoodModalForAllFoodsList();
	}

