//=================================================//
//========Visual and Aesthetic Functions==========//
//=================================================//

// GLOBAL VARIABLES
	var phpFile = "Manage.php"

	var SERVED_WITH_SEGMENT_DELIMITER = "frGaQfOMjZ";
	var SERVED_WITH_INSTRUCTION_DELIMITER = "Mh0MDYFeRb";
	var SERVED_WITH_OPTION_DELIMITER = "djhdR1D7hO";

	var UPSALES_ITEM_PRICE_PAIRS_DELIMITER = "RHVaDD0TZa";
	var UPSALES_ITEM_DELIMITER = "WlDaAcTWs4";

	var PORTIONS_ITEM_PRICE_PAIRS_DELIMITER = "NgQg2W6Dpn";
	var PORTIONS_ITEM_DELIMITER = "VxZcCo8SdT";

	var DEFAULT_FOOD_PHOTO_SRC = "http://localhost/MobileMenu/Images/no_image_available.png";
	var DEFAULT_FOOD_NAME = "Untitled Food";
	var DEFAULT_FOOD_IDENTIFIER = "";

	var DEFAULT_CATEGORY_NAME = "Untitled Category";

	var DEFAULT_SELECT_ELEMENT_VALUE = -1;
	var DEFAULT_RIGHT_SIDEBAR_WIDTH = "350px";
	var DEFAULT_GRAPH_WIDTH = 280;

	// used to determine how much to resize the rightsidebar
		var START_X_COORDINATE = 0;
		

//EVENT LISTENERS
	document.addEventListener('click', function(e){
		e = e || window.event;

		var target = e.target || e.srcElement;

		clickedOutside(e,target);
		
	}, false);

	//call this whereever event.stopPropogation() is used to make sure things disappear when they are clicked outside of
		function clickedOutside(e,target)
		{
			// ensures the options drop down menu disappears as necessary
			if (target && target.className && target.className.indexOf("right_sidebar_options_btn") == -1)
			{
				displayNoneForClass("right_sidebar_options_dd");
			}
		}

	function bodyOnLoad() {
		// call any functions necessary to initialize the page onload
			loadRestaurantCategories();
		// give iFrame appropriate onload
			document.getElementById("photo_upload_iframe").onload = uploadPhotoToSever;
	}

	// used to determine how much to resize the rightsidebar
		document.addEventListener("mouseup", function(event){
			endResizeRightSidebar(event)
		},false);

	// used to navigate food items with the arrow keys
		document.addEventListener("keydown", function(event){
			goToAdjacentFood(event);
		},false);

// Functions to Load items from Database
	function loadFoodItemsForSelectedCategory() {
		// 1st clear the main food list
			document.getElementById("category_content_list").innerHTML = "";

		// 2nd get the category_identifier of the currently selected catogry
			var category_identifier = document.querySelectorAll(".left_sidebar_tab_li.item.item_selected")[0].
				getAttribute("data-category-identifier");
			var data_object = {"category_identifier":category_identifier};

		function responseFunction(result) {
			// the result will be a JSON object of the form {pointer: {dictionary} }
				foods_list = JSON.parse(result);
			for (var pointer in foods_list) {
				// determine food item's attributes depending on whether it is NEW or not
					var food_identifier = foods_list[pointer]["food_identifier"];
					var photo_src = foods_list[pointer]["photo_src"];
					var food_name = foods_list[pointer]["food_name"];
					
				// create the food item li for the category_content_list (the main feed)
					new_food_item = document.createElement("li");

				// give the food li the appropriate attributes
					new_food_item.className = "food_entry";
					new_food_item.setAttribute("onclick","selectFoodObject(this)");
					new_food_item.setAttribute("data-food-identifier",food_identifier);

				new_food_item.innerHTML = 	'<div class="img_and_title_wrapper">'+
											    '<img class="food_item_img" src="'+photo_src+'" alt="Picture of '+ food_name +'" />'+
											    '<div class="food_item_info_wrapper">'+
											        '<h4 class="food_item_title">'+ food_name +'</h4>'+
											    '</div>'+
											'</div>';
				// append food item to list
					document.getElementById("category_content_list").appendChild(new_food_item);

			}
		}

		var action = 8;
		ajax(action,data_object,responseFunction,"loadFoodItemsForSelectedCategory");
	}

// used to delete Instruction/ Option pairs, Extras & Substitutions, and Portion/ Price pairs
	function deleteRightSidebarListItem(element) {
        var ul = element.parentElement.parentElement;
        // this doesn't work for instruction li because there is always at least
        // 2 li elements in instructions_ul. But, with +New Served With, it doesn't
        // really matter
        if (ul.getElementsByTagName("input").length > 1) { 
            var li = element.parentElement;
            ul.removeChild(li); 
        }
    }

// Functions that work with both Category and Food for right_sidebar
	function selectRightAndLeftSidebarTabs(element)
	{
		// displays the appropriate tab AND hides the irrelevent ones
			var tab_number = element.getAttribute("data-tab-number");
			var target_tab_class = element.getAttribute("data-tab-className");

			var tab_wrappers = document.getElementsByClassName(target_tab_class);
			for (var i = 0; i < tab_wrappers.length; i++)
			{
				if (tab_wrappers[i].getAttribute("data-tab-number") == tab_number)
				{
					tab_wrappers[i].style.display = "block";
				}
				else
				{
					tab_wrappers[i].style.display = "none";
				}
			}

		//underlines the correct tab AND un-underlines the irrelevent ones
			var tab_headers_class = element.className.split(" ")[0];
			var tab_headers = document.getElementsByClassName(tab_headers_class);
			for (var i = 0; i < tab_headers.length; i++)
			{
				if (tab_headers[i].getAttribute("data-tab-number") == tab_number)
				{
					tab_headers[i].className = tab_headers_class + " tab_selected";
				}
				else
				{
					tab_headers[i].className = tab_headers_class;
				}
			}
	}
	
	function displayOptionsMenu(element)
	{
		//grab the options DD menu of interest (there is on for categories and for foods)
			var parent_div = element.parentElement;
			var target_menu = parent_div.getElementsByClassName("right_sidebar_options_dd")[0];

		//this will togle the options DD's visibility
			var is_visilbe_dict = {true:"block",false:"none"};
			var is_visible = target_menu.style.display == "none";
			target_menu.style.display = is_visilbe_dict[is_visible];

	}


// helps right sidebar resize
	function startResizeRightSidebar(event){
		START_X_COORDINATE = event.clientX;
	}
	function endResizeRightSidebar(event){
		if (START_X_COORDINATE != 0) {

			// get the total distance to resize
				var delta_x = START_X_COORDINATE - event.clientX;


			// check to make sure the right sidebar is never less than 300px
				var current = parseInt(document.querySelector("#category_content_wrapper").style.marginRight,"10");
				if (current + delta_x < 300) {
						resetToDefaultSize();
				}
			// if it is not, resize the appropriate elements
				else {	
					document.querySelector("#category_content_wrapper").style.marginRight = delta_x + current +"px";

					current = parseInt(document.querySelector("#right_sidebar_resize_pillar").style.right,"10");
					document.querySelector("#right_sidebar_resize_pillar").style.right = current + delta_x + "px";

					current = parseInt(document.querySelector("#right_sidebar_wrapper").style.width,"10");
					document.querySelector("#right_sidebar_wrapper").style.width = current + delta_x + "px";

				}

			// set START_X_COORDINATE back to 0 
				START_X_COORDINATE = 0; 
		}
	}
	function resetToDefaultSize() {
		// resize the appropriate elements
			document.querySelector("#category_content_wrapper").style.marginRight = DEFAULT_RIGHT_SIDEBAR_WIDTH;
			document.querySelector("#right_sidebar_wrapper").style.width = DEFAULT_RIGHT_SIDEBAR_WIDTH;
			document.querySelector("#right_sidebar_resize_pillar").style.right = DEFAULT_RIGHT_SIDEBAR_WIDTH;
	}
// navigate food items with arrow keys
	function goToAdjacentFood(event) {
		var current = document.querySelector(".food_selected");
		var typing_in_input = document.activeElement.tagName == "TEXTAREA" ||
			document.activeElement.tagName == "INPUT";
		// user clicks up arrow or left arrow --> go to previous
			if ((event.which == 37 || event.which == 38) && current && !typing_in_input) {
				var previous = current.previousSibling ? current.previousSibling : current.parentElement.lastChild;
				selectFoodObject(previous);
			}
		// user clicks down arrow or right arrow --> go to next	
			else if ((event.which == 39 || event.which == 40) && current && !typing_in_input) {
				var next = current.nextSibling ? current.nextSibling : current.parentElement.firstChild;
				selectFoodObject(next);
			}
	}
	
//Generic Helper Functions
	function escapeHtml(text) {
		var map = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;'
		};

		return text.replace(/[&<>"']/g, function(m) { return map[m]; });
	}
	function enterHtml(encodedString) {
	    var textArea = document.createElement('textarea');
	    textArea.innerHTML = encodedString;
	    return textArea.value;
	}

	function hideRightSidebarElements()
	{
		// clear out the inputs in right sidebar category
		document.getElementById("right_sidebar_header").innerHTML = "";
			returnFoodOrCategoryElementForClass("title","category").value = ""
			// returnFoodOrCategoryElementForClass("right_sidebar_textarea","category").value = "";
			// returnFoodOrCategoryElementForClass("price","category").value = "";
			returnFoodOrCategoryElementForClass("from_time","category").value = -1;
			returnFoodOrCategoryElementForClass("until_time","category").value = -1;
			returnFoodOrCategoryElementForClass("food_type_select","category").value = -1;
		displayNoneForClass("right_sidebar_container");
	}
	function unhighlightFoodItems()
	{
		var list = document.getElementsByClassName("food_selected");
		for (var i = 0; i < list.length; i++)
		{
			list[i].className = "food_entry";
		}
	}

	function displayNoneForClass(class_name)
	{
		var list_of_items = document.getElementsByClassName(class_name);
		for (var i = 0; i < list_of_items.length; i++)
		{
			list_of_items[i].style.display = "none";
		} 
	}
	function displayBlockForClass(class_name)
	{
		var list_of_items = document.getElementsByClassName(class_name);
		for (var i = 0; i < list_of_items.length; i++)
		{
			list_of_items[i].style.display = "block";
		}
	}

	function getElementIndex(element)
	{
    	for (var i = 0; element = element.previousElementSibling; i++);
    	return i;
	}

	function hasClass( elem, klass )
	{
	     return (" " + elem.className + " " ).indexOf( " "+klass+" " ) > -1;
	}
	function returnFoodOrCategoryElementForClass(class_name, container_type)
	{
		var right_sidebar_elements = document.getElementsByClassName(class_name);
		for (var i = 0; i < right_sidebar_elements.length; i++)
		{
			if (right_sidebar_elements[i].getAttribute("data-container-type") == container_type)
			{
				return right_sidebar_elements[i];
			}
		}
	}

	function ajax(action,data,postAjaxFunction,functionName)
	{
		if (window.XMLHttpRequest) {
            // code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest();
        } else {
            // code for IE6, IE5
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                //uncomment this to debug
                	// alert("AJAX->" + functionName + " says:\n" + xmlhttp.responseText);
                // return any data sent back here
                	postAjaxFunction(xmlhttp.responseText);
            }
        };

        var JSON_object = {
        	"action":action,
        	"data":data
        }

        xmlhttp.open("POST",phpFile,true);
		xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		xmlhttp.send(JSON.stringify(JSON_object));
	}

	function unselectEveryThing()
	{
		// remove all the drag_over class from the category li that was hovered over
			var still_highlighted_categories = document.getElementsByClassName("drag_over");
			if (still_highlighted_categories.length != 0)
			{
				still_highlighted_categories[0].className = "left_sidebar_tab_li item";
			}

			var still_highlighted_foods = document.getElementsByClassName("food_selected");
			if (still_highlighted_foods.length != 0)
			{
				still_highlighted_foods[0].className = "food_entry";
			}

		// reset the right sidebar to blank
			hideRightSidebarElements();

		// clear the center food list
			document.getElementById("category_content_list").innerHTML = "";

	}
	function hideElement(element) {
		// add the class "hide"
			element.className = element.className.replace(/ hide/g, "") + " hide";

		// remove the class "show"
			element.className = element.className.replace(/ show/g,"");
	}
	function showElement(element) {
		// add the class "show"
			element.className = element.className.replace(/ show/g, "") + " show";

		// remove the class "hide"
			element.className = element.className.replace(/ hide/g,"");
	}

	