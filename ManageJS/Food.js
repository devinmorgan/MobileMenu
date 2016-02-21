// selecting food functions

		// helper Functions
			function populatePortionsAndPrices(portion_prices) {
				var portions_ul = document.getElementById("portions_ul");
				portions_ul.innerHTML = "";
				// recall that portion_prices is an encoded string that stores items and
				// their corresponding prices
					var portions_data = portion_prices.split(PORTIONS_ITEM_PRICE_PAIRS_DELIMITER);
					if (portion_prices.length > 20 ) {
						for (var i = 0; i < portions_data.length -1; i++) {
							var item_value = portions_data[i].split(PORTIONS_ITEM_DELIMITER)[0];
							var price_value = portions_data[i].split(PORTIONS_ITEM_DELIMITER)[1];

							// create an portions_li for each item/price pair
								createNewPortionSize();

							// getthe price and input elements and set their values correctly
								var portions_li_inputs = portions_ul.lastChild.getElementsByTagName("input");
								var item_input = portions_li_inputs[0];
								var price_input = portions_li_inputs[1];

								item_input.value = enterHtml(item_value);
								price_input.value= enterHtml(price_value);
						}
					}
			}
		function populatRightSidebarWithFoodInfo(element)
		{
			var food_identifier = element.getAttribute("data-food-identifier");

			// food already exists in database
				if (food_identifier !== "") {

					var data_object = {"food_identifier":food_identifier};
					var action = 6;

					function responseFunction(result) {
						var food_dict = JSON.parse(result)[0];

						// set the right_sidebar_header to the food name and the title_element
							document.getElementById("right_sidebar_header").innerHTML = enterHtml(food_dict["food_name"]);
							returnFoodOrCategoryElementForClass("title","food").value = enterHtml(food_dict["food_name"]);

						// set the right_sidebar image to appropriate src
							document.getElementById("right_sidebar_image_wrapper").
								getElementsByTagName("img")[0].src = food_dict["photo_src"];

						// set the food_description to appropriate text
							returnFoodOrCategoryElementForClass("right_sidebar_textarea","food").value = enterHtml(food_dict["food_description"]);

						populatePortionsAndPrices(food_dict["portion_prices"]);

						// load the survey data for the food
							populateSurveyTabWithFoodData();
					}

					ajax(action,data_object,responseFunction,"populatRightSidebarWithFoodInfo");
				}
			// food is a NEW FOOD and does not exist in the database yet 
				else {
					document.getElementById("right_sidebar_header").innerHTML = DEFAULT_FOOD_NAME;
					returnFoodOrCategoryElementForClass("title","food").value = DEFAULT_FOOD_NAME;

					// set the right_sidebar image to appropriate src
						document.getElementById("right_sidebar_image_wrapper").
							getElementsByTagName("img")[0].src = DEFAULT_FOOD_PHOTO_SRC;

					// set the food_descrtiption to appropriate text
						returnFoodOrCategoryElementForClass("right_sidebar_textarea","food").value = "";

					// clear out the portion size list AND add a blank li
						var portions_ul = document.getElementById("portions_ul");
						portions_ul.innerHTML = "";
						createNewPortionSize();
				}
			
		}
	function selectFoodObject(element)
	{
		// check if the item is already selected, if it is deselect it
			if (element.className.indexOf("food_selected") != -1) {
				hideRightSidebarElements();
				element.className = "food_entry";
			}
		// if it is not already selected, select it
			else {
				// switch the right sidebar to the food right sidebar
					var food_container = returnFoodOrCategoryElementForClass("right_sidebar_container","food");
					var category_container = returnFoodOrCategoryElementForClass("right_sidebar_container","category");

					// showRightSidebarElements();
					food_container.style.display = "block";
					category_container.style.display = "none";

				// populate the Title and the Header with name of food
					populatRightSidebarWithFoodInfo(element);

				// highlight the food with blue border AND unhighlight all other foods
					unhighlightFoodItems();
					element.className = "food_entry food_selected";

				// clear the performance graph so that another foods performance isn't visible
					resetPerformanceTab();
				// clear out the survey results for this food
					clearFoodSurveyResults();
				// set the survey tab back to survey results NOT create new survey
					hideNewSurveyTab();
				// automatically draw the performance plot of the food for convinience
					// drawPerformanceGraph();
			}

		
		// if the user is in mobile, toggle the rightsidebar
			toggleRightSidebar();
	}

// creating new food functions
	function createNewFoodItem()
	{
		var category_li = document.querySelectorAll(".left_sidebar_tab_li.item.item_selected")[0];
		var category_identifier = category_li.getAttribute("data-category-identifier");

		// create the food item li for the category_content_list (the main feed)
			new_food_item =document.createElement("li");

		// give the food li the appropriate attributes
			new_food_item.className = "food_entry";
			new_food_item.setAttribute("onclick","selectFoodObject(this)");
			new_food_item.setAttribute("data-food-identifier",DEFAULT_FOOD_IDENTIFIER);

		new_food_item.innerHTML =   '<div class="img_and_title_wrapper">'+
									    '<img class="food_item_img" src="'+DEFAULT_FOOD_PHOTO_SRC+'" alt="Picture of '+ DEFAULT_FOOD_NAME +'" />'+
									    '<div class="food_item_info_wrapper">'+
									        '<h4 class="food_item_title">'+ DEFAULT_FOOD_NAME +'</h4>'+
									    '</div>'+
									'</div>';
		// append food item to list
			var food_items_list = document.getElementById("category_content_list");
			food_items_list.insertBefore(new_food_item,food_items_list.firstChild);
			new_food_item.click();

		// once a new food is made it should be saved 
			// saveFoodItem();
	}
	
	function createNewPortionSize() {
		var portions_ul = document.getElementById("portions_ul");
		var new_portion_li = document.createElement("li");
		new_portion_li.className = "portions_li";
		new_portion_li.innerHTML = 	'<label class="right_sidebar_li_label">Size </label>'+
		                          	'<input type="text" class="portions_item_input" />'+
		                          	'<label class="right_sidebar_li_label"> Price </label>'+
		                          	'<input type="text" class="portions_price_input" />'+
		                          	'<span class="remove_right_sidebar_li" onclick="deleteRightSidebarListItem(this)">'+
									   	'<div class="forward slash"></div>'+
									    '<div class="backward slash"></div>'+
									'</span>';
		  
		 portions_ul.appendChild(new_portion_li);
	}
// deleting food functions
	function deleteFoodItem()
	{
		var message = "Deleting a food will perminately remove all of its data from the database." +
		"Would you still like to continue?";

		if (confirm(message)) {
			// gets the list item that will be deleted AND food_identifier
				var food_li = document.querySelectorAll(".food_entry.food_selected")[0];
				var food_identifier = food_li.getAttribute("data-food-identifier");

			function responseFunction(result) {
				// removes the category from the ul (menu_categories_list)
					food_li.parentElement.removeChild(food_li);
				// resets right sidebar
					hideRightSidebarElements();
			}

			var data_object = {"food_identifier":food_identifier};
			var action = 9;

			ajax(action,data_object,responseFunction,"deleteFoodItem");
		}
	}
// saving food functions
		function collectPortionPricesFromRightSidebar() {
			var portions_li = document.getElementsByClassName("portions_li");
			var encoded_string = "";
			for (var i = 0; i < portions_li.length; i++) {
				var input_list = portions_li[i].getElementsByTagName("input");
				var item_value = input_list[0].value;
				var price_value = input_list[1].value;
				// add item_value AND price_value followed by delimiter
				if (item_value != "" && price_value != "") {
					encoded_string += item_value + PORTIONS_ITEM_DELIMITER + price_value + PORTIONS_ITEM_PRICE_PAIRS_DELIMITER;
				}
			}
			return encoded_string;
		}
	function saveFoodItem()
	{
		// gets the food li that will be "saved"
			var food_li = document.querySelectorAll(".food_entry.food_selected")[0];
		// update the database with new info
			var food_name_input = returnFoodOrCategoryElementForClass("title","food");
			var food_name = escapeHtml( food_name_input.value );
			var photo_src = document.getElementById("right_sidebar_image_wrapper").
				getElementsByTagName("img")[0].src;
			var food_description = escapeHtml(returnFoodOrCategoryElementForClass("right_sidebar_textarea","food").value);
			var portion_prices = escapeHtml(collectPortionPricesFromRightSidebar());
			
			var food_identifier = food_li.getAttribute("data-food-identifier");
			var category_identifier = document.querySelectorAll(".left_sidebar_tab_li.item.item_selected")[0].
				getAttribute("data-category-identifier");

			var food_object = {
				"food_identifier":food_identifier,
				"category_identifier":category_identifier,
				"photo_src":photo_src,
				"food_name":food_name,
				"food_description":food_description,
				"portion_prices":portion_prices,
			};

		function responseFunction(result) {
			// new foods don't have a value for data-food-identifer, this gives them one AND
			// if the food aready exists, it gives them the same one...
				food_li.setAttribute("data-food-identifier",result.substring(0,10));

			// update the attributes of the food li according to what was saved
				food_li.getElementsByClassName("food_item_title")[0].innerHTML = food_name;
				food_li.getElementsByTagName("img")[0].src = photo_src;
			
			// update the right sidebar header with new food name
				document.getElementById("right_sidebar_header").innerHTML = food_name;
		}
		// perform form validation before attempting ajax
			var portions_ul = document.querySelector("#portions_ul");
			var action = 7;
			if (inputIsNotBlank(food_name_input) &&
			 	noChildInputsAreEmpty(portions_ul) ){ /* it will be 20 if there is no portion/ price value */
				ajax(action,food_object,responseFunction,"saveFoodItem");
			}
	}

// Functions to help with food photo uploads
	// this triggers the folder browser once Change Photo is clicked
		function browsePhotos(element) {
			element.getElementsByClassName("photo_browse_input")[0].click();
		}
	// this submits the form when the user selects a file in their folder browser
		function submitNewFoodPhoto(element) {
			element.parentElement.getElementsByClassName("photo_submit_input")[0].
				click();
			element.parentElement.getElementsByClassName("photo_browse_input")[0].value = "";
		}
	// this sends the file info to the Photo_Uploads.php for processing
		function uploadPhotoToSever() {
			
			// 1st get the src for the photo just uploaded
			    var iFrameBody = document.getElementById('photo_upload_iframe').
			    	contentDocument.getElementsByTagName('body')[0];
			    	// alert(iFrameBody.innerHTML);// <--- fix this
			    var photo_src = JSON.parse(iFrameBody.innerHTML)[0]["file_location"];

				var food_li = document.querySelectorAll(".food_entry.food_selected")[0];
				var food_identifier = food_li.getAttribute("data-food-identifier");

				var data_object = {
					"photo_src":photo_src,
					"food_identifier":food_identifier
				};

				function responseFunction(result) {

					// change the photo src of the right sidebar
						document.getElementById("right_sidebar_image_wrapper").
							getElementsByTagName("img")[0].src = photo_src;
					// change the photo src of the food item
						food_li.getElementsByTagName("img")[0].src = photo_src;
				}

				var action = 10;
				ajax(action,data_object,responseFunction,"uploadPhotoToSever");

		}



























