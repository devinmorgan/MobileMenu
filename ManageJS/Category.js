


// populate right sidebar with category information
	//helper functions
		//helper functions for helper functions
			function createNewOptionForInstruction(element, event) {
		        if (!event || event.which == 13) {
		            var options_ul = element.parentElement.parentElement;
		            var new_option_li = document.createElement("li");
		            new_option_li.className = "options_li";
		            new_option_li.innerHTML = '<label class="right_sidebar_li_label">Option </label>' +
		                                      '<input type="text" onkeydown="createNewOptionForInstruction(this,event)"'+
		                                          'class="options_input" />'+
		                                      '<span class="remove_right_sidebar_li" onclick="deleteRightSidebarListItem(this)">'+
												   '<div class="forward slash"></div>'+
												   '<div class="backward slash"></div>'+
											  '</span>';
		            options_ul.appendChild(new_option_li);
		            new_option_li.getElementsByTagName("input")[0].focus();
		        }
		    }
		    function createNewInstructionForServedWith() {
		        var instructions_ul = document.getElementById("instructions_ul");
		        var new_instruction_li = document.createElement("li");
		        new_instruction_li.className = "instructions_li";
		        new_instruction_li.innerHTML =  	'<label class="right_sidebar_li_label">Instruction </label>'+
		                                            '<input type="text" class="instruction_input" />'+
		                                            '<span class="remove_right_sidebar_li" onclick="deleteRightSidebarListItem(this)">'+
												   		'<div class="forward slash"></div>'+
												   		'<div class="backward slash"></div>'+
											  	    '</span>'+
			                                        '<ul class="options_ul">'+
			                                            '<li class="options_li">'+
			                                               '<label class="right_sidebar_li_label">Option </label>'+
			                                               '<input type="text" onkeydown="createNewOptionForInstruction(this,event)" class="options_input" />'+
			                                               '<span class="remove_right_sidebar_li" onclick="deleteRightSidebarListItem(this)">'+
														   	   '<div class="forward slash"></div>'+
															   '<div class="backward slash"></div>'+
													   	   '</span>'+
			                                            '</li>'+
			                                        '</ul>';
		        instructions_ul.appendChild(new_instruction_li);
		    }

			function createNewUpsaleItem() {
				var upsales_ul = document.getElementById("upsales_ul");
				var new_upsale_li = document.createElement("li");
				new_upsale_li.className = "upsales_li";
				new_upsale_li.innerHTML = '	<label class="right_sidebar_li_label">Item </label>'+
				                          	'<input type="text" class="upsales_item_input" />'+
				                          	'<label class="right_sidebar_li_label"> Price </label>'+
				                          	'<input type="text" class="upsales_price_input" />'+
				                          	'<span class="remove_right_sidebar_li" onclick="deleteRightSidebarListItem(this)">'+
											   	'<div class="forward slash"></div>'+
											    '<div class="backward slash"></div>'+
											'</span>';
				  
				 upsales_ul.appendChild(new_upsale_li);
			}
		function populateServedWith(served_with) {
			// 1st get the instructions ul
			var instructions_ul = document.getElementById("instructions_ul");
			instructions_ul.innerHTML = "";
			
			// recall that served_with is an encoded string that stores inctructionsk
			// and all of the options associated with them
				var sw_data = served_with.split(SERVED_WITH_SEGMENT_DELIMITER);
				if (served_with.length > 20) {
					for (var i = 0; i < sw_data.length -1; i++) {
						var instruction_value = sw_data[i].split(SERVED_WITH_INSTRUCTION_DELIMITER)[0];
						var options_list = sw_data[i].split(SERVED_WITH_INSTRUCTION_DELIMITER)[1].
							split(SERVED_WITH_OPTION_DELIMITER);
						// create an instructions_li and set the input value to instruction_value
							createNewInstructionForServedWith();
							var current_instruction_li = instructions_ul.lastChild;
							var current_instruction_input = current_instruction_li.getElementsByTagName("input")[0];
							current_instruction_input.value = enterHtml(instruction_value);

						// create and append an option_li to the option_ul that belongs to the instruction_ul
						// as each option_li is created set its input value to option
						for (var j = 0; j < options_list.length -1; j++) {
							var current_option_li = current_instruction_li.getElementsByTagName("ul")[0].lastChild;
							var current_option_input = current_option_li.getElementsByTagName("input")[0];
							// since each Served With already has 1 options input, we only want to add 1 less
							// than the number of options (of which there are length-1 already)
								if (j < options_list.length - 2) {
									createNewOptionForInstruction(current_option_input,null); /*pass null since there is no event*/
								}
							current_option_input.value = enterHtml(options_list[j]);
						}
					}
				}
		}

		function populateExtrasAndSubstitutions(upsales) {
			var upsales_ul = document.getElementById("upsales_ul");
			upsales_ul.innerHTML = "";
			// recall that upsales is an encoded string that stores items and
			// their corresponding prices
				var upsales_data = upsales.split(UPSALES_ITEM_PRICE_PAIRS_DELIMITER);
				if (upsales.length > 20 ) {
					for (var i = 0; i < upsales_data.length -1; i++) {
						var item_value = upsales_data[i].split(UPSALES_ITEM_DELIMITER)[0];
						var price_value = upsales_data[i].split(UPSALES_ITEM_DELIMITER)[1];

						// create an upsales_li for each item/price pair
							createNewUpsaleItem();

						// getthe price and input elements and set their values correctly
							var upsale_li_inputs = upsales_ul.lastChild.getElementsByTagName("input");
							var item_input = upsale_li_inputs[0];
							var price_input = upsale_li_inputs[1];

							item_input.value = enterHtml(item_value);
							price_input.value= enterHtml(price_value);
					}
				}
		}

	function populatRightSidebarWithCategoryInfo(element) {
		// get all of the static HTML elements that need to be updated
			var header = document.getElementById("right_sidebar_header");
			var title_input = returnFoodOrCategoryElementForClass("title","category");
			var from_time = returnFoodOrCategoryElementForClass("from_time","category");
			var until_time = returnFoodOrCategoryElementForClass("until_time","category");
			var type_input = returnFoodOrCategoryElementForClass("food_type_select","category");

		var category_identifier = element.getAttribute("data-category-identifier");

		// category has already been saved and is in the database
			if (category_identifier !== "") {
				// result is of the form {"category_name":category_name, "default_description":default_description, ...}
					function responseFunction(result) {
						category_dict = JSON.parse(result)[0];

						// supply the necessary information to all of the HTML elements
							header.innerHTML = category_dict["category_name"];
							title_input.value = category_dict["category_name"];
							// description_textarea.value = category_dict["default_description"];
							// price_input.value = category_dict["default_price"];
							from_time.value = category_dict["start_time"];
							until_time.value = category_dict["end_time"];
							type_input.value = category_dict["category_type"];

						// fill in for all of the Served With Values
							populateServedWith(category_dict["served_with"]);

						// fill in for all of the Extras & Substitutions
							populateExtrasAndSubstitutions(category_dict["upsales"]);

						// load category's food items after the category data has loaded
							loadFoodItemsForSelectedCategory();
					}

				var action = 4;
				var data_object = {"category_identifier":category_identifier};
				ajax(action,data_object,responseFunction,"populatRightSidebarWithCategoryInfo");

			}
		// category is a +New Category; it is not in database
			else {
				// provide the right sidebar header and the category title input with
				// the NEW category's default name. This is necessary so that the NEW
				// category gets saved with a title
					title_input.value = DEFAULT_CATEGORY_NAME;
					header.innerHTML = DEFAULT_CATEGORY_NAME;
					from_time.value = DEFAULT_SELECT_ELEMENT_VALUE;
					until_time.value = DEFAULT_SELECT_ELEMENT_VALUE;
					type_input.value = DEFAULT_SELECT_ELEMENT_VALUE;

				// since the category is a new one, save it
					saveMenuCategory();

				// reset the upsales and served with lists
					document.getElementById("instructions_ul").innerHTML = "";
					createNewInstructionForServedWith();
					document.getElementById("upsales_ul").innerHTML = "";
					createNewUpsaleItem();
			}
	}

function selectCategory(element) {
	// hide all tabs not related to category and show the category tab
	unselectEveryThing();
	returnFoodOrCategoryElementForClass("right_sidebar_container","category").
		style.display = "block";

	var menu_category_items = document.getElementsByClassName("left_sidebar_tab_li");
	for (var i = 0; i < menu_category_items.length;i++) {
		if (menu_category_items[i] === element) {
			menu_category_items[i].className = "left_sidebar_tab_li item item_selected";
		}
		else {
			menu_category_items[i].className = "left_sidebar_tab_li item";
		}

	}
	populatRightSidebarWithCategoryInfo(element);
	// in case the user is on a mobile device
		hideLeftSidebar();
		showRightSidebar();
}

// create new menu category functions
	function createNewMenuCategory(category_name, category_identifier, menu_position)
	{
		var categories_list = document.getElementById("menu_categories_list");
		// set parametes to default if not supplied as function arguments
			category_name = typeof category_name !== "undefined" ? category_name : "Untitled Category";
			category_identifier = typeof category_identifier !== "undefined" ? category_identifier : "";
			menu_position = typeof menu_position !== "undefined" ? menu_position : 
				categories_list.getElementsByTagName("li").length;

		// create the HTML element for the new food category
			new_category_item = document.createElement("li");

		// add relevant attriubtes to the category HTML element
			new_category_item.className = "left_sidebar_tab_li item";
			new_category_item.setAttribute("onclick","selectCategory(this)");

			// attributes that allow reording of list via drag and drop
				new_category_item.setAttribute("draggable","true");
				new_category_item.setAttribute("ondragstart","dragstart(event)");
				new_category_item.setAttribute("ondragend","dragend(event)");
				new_category_item.setAttribute("ondragover","dragover(event)");
				new_category_item.setAttribute("ondragenter","dragenter(event)");
				new_category_item.setAttribute("ondragleave","dragleave(event)");
				new_category_item.setAttribute("ondrop","drop(event)");
				new_category_item.setAttribute("data-list-index",menu_position);

			// holds the reference to the categories Id in the database
				new_category_item.setAttribute("data-category-identifier", category_identifier)

		new_category_item.innerHTML =  '<div class="menu_icon_container">'+
									  		'<div class="pseudo_content"></div>'+
										  	'<div class="pseudo_content"></div>'+
										  	'<div class="pseudo_content"></div>'+
										  	'<div class="pseudo_content"></div>'+
										  	'<div class="pseudo_content"></div>'+
										'</div>'+
										'<span class="category_name">' + category_name + '</span>';

		
		categories_list.appendChild(new_category_item);
		
		// if it is a new category auto-click it
			if (category_identifier == "")
			{
				new_category_item.click();
			}
	}

// save menu category
	//helper functions
		function collectServedWithDataFromRightSidebar() {
			var instruction_ul = document.getElementsByClassName("instructions_li");
			var encoded_string = "";
			for (var i = 0; i < instruction_ul.length; i++) {
				var instruction_value = instruction_ul[i].getElementsByClassName("instruction_input")[0].value;

				// add instruction followd by instruction delimiter
					if (instruction_value != "") {
						encoded_string += instruction_value + SERVED_WITH_INSTRUCTION_DELIMITER;
					}

				var options_li = instruction_ul[i].getElementsByClassName("options_ul")[0].
					getElementsByTagName("li");
				for (var j = 0; j < options_li.length; j++) {
					var option_value = options_li[j].getElementsByClassName("options_input")[0].value;

					// add option followed by option delimiter
						if (option_value != "") {
							encoded_string += option_value + SERVED_WITH_OPTION_DELIMITER
						}
				}

				// complete this segment of the string by adding the segment delimeter
					encoded_string += SERVED_WITH_SEGMENT_DELIMITER;
			}
			return encoded_string;
		}
		function collectUpsalesDataFromRightSidebar() {
			var upsales_li = document.getElementsByClassName("upsales_li");
			var encoded_string = "";
			for (var i = 0; i < upsales_li.length; i++) {
				var input_list = upsales_li[i].getElementsByTagName("input");
				var item_value = input_list[0].value;
				var price_value = input_list[1].value;
				// add item_value AND price_value followed by delimiter
				if (item_value != "" && price_value != "") {
					encoded_string += item_value + UPSALES_ITEM_DELIMITER + price_value + UPSALES_ITEM_PRICE_PAIRS_DELIMITER;
				}
			}
			return encoded_string;
		}
	function saveMenuCategory() {
		// gets the category list item that will be "saved"
			var category_li = document.querySelectorAll(".left_sidebar_tab_li.item.item_selected")[0];
		// update the database with new info
			var category_name_input = returnFoodOrCategoryElementForClass("title","category");
			var category_name = escapeHtml( category_name_input.value );
			var start_time = escapeHtml(returnFoodOrCategoryElementForClass("from_time","category").value);
			var end_time = escapeHtml(returnFoodOrCategoryElementForClass("until_time","category").value);
			var category_type = escapeHtml(returnFoodOrCategoryElementForClass("food_type_select","category").value);

			var category_identifier = category_li.getAttribute("data-category-identifier");
			var menu_position = getElementIndex(category_li);

		// get all of the served_with and upsales information
			var served_with = escapeHtml(collectServedWithDataFromRightSidebar());
			var upsales = escapeHtml(collectUpsalesDataFromRightSidebar());

			var category_object = {
				"category_name":category_name,
				"start_time":start_time,
				"end_time":end_time,
				"category_type":category_type,
				"category_identifier":category_identifier,
				"menu_position":menu_position,
				"served_with":served_with,
				"upsales":upsales
			};
		
			function responseFunction(result) {
				// new categories don't have a value for data-category-identifer, this gives them one AND
				// if the category aready exists, it gives them the same one...
					category_li.setAttribute("data-category-identifier",result.substring(0,10));
				// change the title of the list item in the category list (menu_categories_list)
					category_li.getElementsByTagName("span")[0].innerHTML = category_name;
					document.getElementById("right_sidebar_header").innerHTML = category_name;
			}

			var action = 1;
			// form validation of category inputs before performing any ajax
				var instructions_ul = document.querySelector("#instructions_ul");
				var upsales_ul = document.querySelector("#upsales_ul");
				if (inputIsNotBlank( category_name_input ) &&
					noChildInputsAreEmpty( instructions_ul ) &&
					noChildInputsAreEmpty( upsales_ul ) ){
					ajax(action,category_object,responseFunction,"saveMenuCategory");
				}
			
	}

// load restaurant categories
	function loadRestaurantCategories() {
		var action = 2;
		function responseFunction(result) {
			// the result will be a JSON object of the form {"category name":"category identifer"}
				categories_list = JSON.parse(result);

			for (var pointer in categories_list) {
				var category_name = categories_list[pointer]['category_name'];
				var category_identifier = categories_list[pointer]['category_identifier'];
				var menu_position = categories_list[pointer]['menu_position'];

				createNewMenuCategory(category_name, category_identifier, menu_position);
			}
		}

		ajax(action,{},responseFunction,"loadRestaurantCategories");
	}

// delete menu category
	function deleteMenuCategory() {
		var message = "Deleting a category permanently removes all the category's information"+
		" and ALL of its foods' information too. Would you still like to continue?";

		if (confirm(message)) {
			// gets the list item that will be deleted
				var category_li = document.querySelectorAll(".left_sidebar_tab_li.item.item_selected")[0];

			var category_identifier = category_li.getAttribute("data-category-identifier");

			function responseFunction(result) {
				// alert(result);
				// removes the category from the menu_categories_list AND re-evaluates menu positions
					var categories_list = document.getElementById("menu_categories_list");
					categories_list.removeChild(category_li);
					indexListItemsOfList(categories_list);

					unselectEveryThing();
			}

			var data_object = {"category_identifier":category_identifier};
			var action = 5;

			ajax(action,data_object,responseFunction,"deleteMenuCategory");
		}
	}
























