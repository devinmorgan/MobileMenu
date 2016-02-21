// EVENT LISTENERS
	document.addEventListener('click', function(e){
		e = e || window.event;

		var target = e.target || e.srcElement;

		closeDropDownMenus(e,target);
		
	}, false);






//call this to make sure things disappear when they are clicked outside of
	function closeDropDownMenus(event,target)
	{
		// if an icon was clicked then this function is irrelevant
		    if(target.className && target.className.indexOf("icon") != -1) {
		    	return;
	    	}

		var drop_down_menus = document.getElementsByClassName("drop_down_menu");
		var icons = document.getElementsByClassName("highlight_icon");

		// hide all dd menus
			for (var i = 0; i <drop_down_menus.length; i++) {
				hideElement(drop_down_menus[i]);
			}
		// unhighlight all dd icons
			for (var i = 0; i < icons.length; i++) {
				icons[i].className = icons[0].className.replace("highlight_icon","");
				i--;
			}	
	}


// toggle the state of dd_menus
	function toggleNavMenu() {
		var nav_menu = document.querySelector(".navigation_menu");
		if (nav_menu.className.indexOf("show") == -1) {
			showElement(nav_menu);
			// nav_menu.className = "navigation_menu drop_down_menu show_dd_menu";

			var nav_icon_lines = document.getElementsByClassName("nav_icon_lines");
			for (var i = 0; i < nav_icon_lines.length; i++) {
				nav_icon_lines[i].className = "nav_icon_lines highlight_icon";
			}
		}
		else {
			hideElement(nav_menu);
			// nav_menu.className = "navigation_menu drop_down_menu";

			var nav_icon_lines = document.getElementsByClassName("nav_icon_lines");
			for (var i = 0; i < nav_icon_lines.length; i++) {
				nav_icon_lines[i].className = "nav_icon_lines";
			}
		}
	}

	function toggleCategoriesMenu() {
		var categories_menu = document.querySelector(".categories_menu");
		if (categories_menu.className.indexOf("show") == -1) {
			// make sure to update the view counts before showing the menu
				updatedViewCountForCategoryDD();
			// show the menu
				showElement(categories_menu);
			// highlight the "i" icon
				document.getElementsByClassName("categories_icon")[0].className = "categories_icon highlight_icon";
			
		}
		else {
			hideElement(categories_menu);
			document.getElementsByClassName("categories_icon")[0].className = "categories_icon";
			
		}
	}

// function for scroll window to height of specified category
	function scrollToCategoryHeader(element) {
		// just in case the user is in single_img_view OR is in interest_list
			showCategoriesList();

		// find the category header for the clicked on category
			var category_identifier = element.getAttribute("data-category-identifier");
			var category_header = document.querySelector(".food_section_wrapper"+
						"[data-category-identifier='"+ category_identifier +"']");

		var category_rect = category_header.getBoundingClientRect();
		var new_y_height = category_rect.top - LOWER_HEADER_HEIGHT + window.scrollY;
		// get the height the header is from the top
		window.scrollTo(0, new_y_height);


	}
// update dd_menus with data functions
	function updatedViewCountForCategoryDD(){
		var category_menu_options = document.querySelectorAll(".categories_menu .dd_menu_option");
		for (var i = 0; i < category_menu_options.length; i++) {
			var category_identifier = category_menu_options[i].getAttribute("data-category-identifier");

			category_menu_options[i].getElementsByClassName("menu_option_secondary_info")[0].
				innerHTML = "Seen "+ numberItemsViewedInCategory(category_identifier) +
							" of " + Object.keys(MASTER_CATEGORY_OBJECTS_DICT[ category_identifier ]["food_dict"]).length;
		}
	}
	function createCategoryDropDownMenu() {
			for (var i = 0; i < Object.keys( MASTER_CATEGORY_OBJECTS_DICT ).length; i++) {
				// get the correct cagtegory_identifier
					var category_identifier = categoryIdentiferAtMenuPosition(i);


				var category_name = MASTER_CATEGORY_OBJECTS_DICT[category_identifier]["category_name"];
				var numb_foods = Object.keys( MASTER_CATEGORY_OBJECTS_DICT[category_identifier]["food_dict"] ).length;

				var category_li = document.createElement("li");

				// set its necessary attributes
					category_li.className = "dd_menu_option";
					category_li.setAttribute("data-category-identifier",category_identifier);
					category_li.setAttribute("onclick","scrollToCategoryHeader(this)");

				// set its innerHTML
					category_li.innerHTML = '<div class="menu_option_primary_info">'+ category_name +'</div>'+
			    							'<div class="menu_option_secondary_info">Seen '+ 0 +' of '+ numb_foods +'</div>';

				// append it to the category dd menu
					 document.querySelector(".categories_menu").appendChild(category_li);
				
			}
			
		}







































