
// GLOBAL CONSTANTS AND VARIABLES
	var NAVBAR_HEIGHT = 84;
	var LOWER_HEADER_HEIGHT = 44;
	var FRACTIONAL_PROXIMITY_TO_IMG_EDGE = .3;
	var phpFile = "Patron.php";

	var SERVED_WITH_SEGMENT_DELIMITER = "frGaQfOMjZ";
	var SERVED_WITH_INSTRUCTION_DELIMITER = "Mh0MDYFeRb";
	var SERVED_WITH_OPTION_DELIMITER = "djhdR1D7hO";

	var UPSALES_ITEM_PRICE_PAIRS_DELIMITER = "RHVaDD0TZa";
	var UPSALES_ITEM_DELIMITER = "WlDaAcTWs4";

	var PORTIONS_ITEM_PRICE_PAIRS_DELIMITER = "NgQg2W6Dpn";
	var PORTIONS_ITEM_DELIMITER = "VxZcCo8SdT";

	var MOBILE_MENU_HOMEPAGE_URL = "http://mobilemenu.org/Homepage.html";
	var RESTAURANT_NAME;

	// used to create the link that can "share a food"
		var THIS_PAGE_URL = "http://mobilemenu.org/Patron.html";
		var RESTAURANT_IDENTIFIER;

	var PERSON_IDENTIFIER = randomString(10);
	if (typeof(Storage) !== "undefined") {
		if (localStorage.getItem("PERSON_IDENTIFIER")) {
			PERSON_IDENTIFIER = localStorage.getItem("PERSON_IDENTIFIER");
			console.log(PERSON_IDENTIFIER);
		}
		else {
			// create unique person_identifier
				localStorage.setItem("PERSON_IDENTIFIER",PERSON_IDENTIFIER);
		}
	}

	// HAS_BEEN_VIEWED_DICT will expire after every 12hrs to reset view counts and
	// Interest List for the next time a patron returns to the restuarnt
		var NUM_HOURS_UNTIL_EXPIRATION = 12;
		var TIME_OF_LAST_PAGE_LOAD = (new Date()).getTime();
		if (typeof(Storage) !== "undefined") {
			console.log(TIME_OF_LAST_PAGE_LOAD - localStorage.getItem("TIME_OF_LAST_PAGE_LOAD"));
			if (!localStorage.getItem("TIME_OF_LAST_PAGE_LOAD")){
				localStorage.setItem("TIME_OF_LAST_PAGE_LOAD",TIME_OF_LAST_PAGE_LOAD);
			}
			else if (TIME_OF_LAST_PAGE_LOAD - localStorage.getItem("TIME_OF_LAST_PAGE_LOAD") >
				NUM_HOURS_UNTIL_EXPIRATION*60*60*1000) {

				// reset HAS_BEEN_VIEWED_DICT and FAVORITES_DICT
					localStorage.removeItem("FAVORITES_DICT");
					localStorage.removeItem("HAS_BEEN_VIEWED_DICT");

				// set the new TIME_OF_LAST_PAGE_LOAD
					localStorage.setItem("TIME_OF_LAST_PAGE_LOAD",TIME_OF_LAST_PAGE_LOAD);
			}
			
		}

	
	// the opaicty for the intersted food elements that are NOT selected
		var UNSELECTED_FOOD_OPACITY = .2;

	var QUIT_SINGLE_VIEW_BTN_TRANSLATION_DIST = 0;

	// each food "type" will point to an array of food object indicies from the ALL_FOODS_LIST
		var INTEREST_LIST_DICT = {
				"1": 	[], /* drinks */
				"2": 	[], /* starters */
				"3": 	[], /* mains */
				"4": 	[] /* finishers */
			}
			
		var FOOD_TYPE_KEYS = {
			"1": "Drinks",
			"2": "Starters",
			"3": "Mains",
			"4": "Finishers"
		}

	// stores the "users" favorite for each type in their interest list
	// STRUCTE ::= {"1":"food_identifer","2":"food_identifer"...}
		var FAVORITES_DICT = {
				"1": "", 
				"2": "",
				"3": "",
				"4": ""
			}
		if (typeof(Storage) !== "undefined") {
			if (localStorage.getItem("FAVORITES_DICT")) {
				FAVORITES_DICT = JSON.parse( localStorage.getItem("FAVORITES_DICT") );
				// console.log(FAVORITES_DICT);
			}
		}
		
	// this structure will be used to save which foods the user has already seen and which food
	// the user is already interested in. Structe of HAS_BEEN_VIEWED_DICT::= {food_identifier:0 or food_type}
	// 0 means the person is not intersted in the food
	// "1",...,"4" means that the person is interested in the food and is the type of this food
		var HAS_BEEN_VIEWED_DICT = {};
		if (typeof(Storage) !== "undefined") {
			if (localStorage.getItem("HAS_BEEN_VIEWED_DICT")) {
				HAS_BEEN_VIEWED_DICT = JSON.parse( localStorage.getItem("HAS_BEEN_VIEWED_DICT") );
				// console.log(HAS_BEEN_VIEWED_DICT);
			}
		}
		// console.log(HAS_BEEN_VIEWED_DICT);
		
			

	var IS_VIEWING_INTEREST_LIST = false;
	var DEFAULT_FOOD_TYPE_SUBHEADER = "Double click your favorite";
	// this is used by single_img_view to move to the next or previous photo
		var ALL_FOODS_LIST = []; 
		// ALL_FOODS_LIST STRUCTURE::=
		// [... position_index: [category_identifier, food_identifier] ...]
			var ALL_FOODS_LIST_CATEGORY_IDENTIFIER = 0;
			var ALL_FOODS_LIST_FOOD_IDENTIFIER = 1;

	// this is the master data structure that holds all information about categories and foods
		var MASTER_CATEGORY_OBJECTS_DICT = {}; 
		// MASTER_CATEGORY_OBJECTS_DICT STRUCTURE::= {
		//		category_identifier: {
		//			'menu_position':menu_position,	
		//			'category_name':category_name,
		//			'category_type':category_type,
		//			'served_with':served_with,
		//			'upsales':upsales,
		//			'food_dict':{
		//				food_identifier: {
		//					'photo_src':photo_src,
		//					'food_name':food_name,
		//					'food_description':food_description,
		//					'portion_prices':portion_prices,
		//					'has_been_viewed': 	BOOLEAN
		//				} 
		//			}
		//		}
		// }
	// used for swipe left and right gestures
		var SWIPE_EVENT_START_X_COORDINATE = 0;
		var MIN_SWIPE_EVENT_DISPLACEMENT = 100;
//EVENT LISTENERS

	// used to get the view my list headers to stick at the top upon scrolling
		window.onscroll = function() {
			var headers = document.getElementsByClassName("header");
			// alert();
			for (var i = 0; i < headers.length; i++) {
			    
				if (headers[i].parentElement.getBoundingClientRect().top < LOWER_HEADER_HEIGHT && 
					headers[i].className.indexOf("fixed_header") == -1) {

						headers[i].className += " fixed_header";
				}
				else if (headers[i].parentElement.getBoundingClientRect().top > LOWER_HEADER_HEIGHT && 
						headers[i].className.indexOf("fixed_header") != -1) {

							headers[i].className = headers[i].className.replace(" fixed_header","");
				}
			}
		};
	// used to determine how much to resize the rightsidebar
		document.addEventListener("mouseup", function(event){
			endSwipeEvent(event)
		},false);
		document.addEventListener("mousedown", function(event){
			startSwipeEvent(event);
		});

	
		function onBodyLoad() {
			// NOTE: firefox does not respond to the in-element attribute ontransitionend="noLongerMoving()"
			// so this is necessary to adjust for that (Used by SingleImageView.js)
				document.querySelector('.lower_item_wrapper')
		        .addEventListener('transitionend',noLongerMoving,null);

		    // determines which restaurant to load data from via the passed data in the url
		    // this also calls loadAllPhotoObjectsAndCategories() which is in BrowseFoods.js
		    	determineRestaurantFromURLData(); 
		}	

// preliminary housekeeping functions
	// helpfer functions
		function getURLEncodedVariable(variable) {
			var query = window.location.search.substring(1);
		  	var vars = query.split("&");
			for (var i = 0; i < vars.length; i++) {

			    var pair = vars[i].split("=");

			    if (pair[0] == variable) {
			 	    return pair[1];
			    }
			} 
			return null;
		}
	function checkForPassedFoodIdentifiers() {
		var food_identifier = getURLEncodedVariable("data-food-identifier");

		if (food_identifier) {
			if (document.querySelector(".food_section_img_li[data-food-identifier='"+food_identifier+"']")){
				document.querySelector(".food_section_img_li[data-food-identifier='"+food_identifier+"']").click();
			}
		}
	}

	function determineRestaurantFromURLData() {
		RESTAURANT_IDENTIFIER = getURLEncodedVariable("data-restaurant-identifier");

		if (RESTAURANT_IDENTIFIER) {
			loadAllPhotoObjectsAndCategories(RESTAURANT_IDENTIFIER);
		}
		else {
			// NO restuarant identifier was EVENT PASSED
				alert("It appears that the restaurant you are trying to view doesn't exist :(\n\n"+
					"We will redirect you back to the homepage so you can search for a different one!");
				window.location.replace(MOBILE_MENU_HOMEPAGE_URL);
		}
	}
	function setRestaurantName(restaurant_name) {
		RESTAURANT_NAME = restaurant_name;
		document.querySelector("#restaurant_header").innerHTML = restaurant_name;
	}

// Hide and Reveal (toggle) functions
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
// interpret swipe left and swipe right functions

	// helps right sidebar resize
	function startSwipeEvent(event){
		SWIPE_EVENT_START_X_COORDINATE = event.clientX;
	}
	function endSwipeEvent(event){
		var delta_x = SWIPE_EVENT_START_X_COORDINATE - event.clientX;
		
		if (delta_x >= MIN_SWIPE_EVENT_DISPLACEMENT){
			// swipe left
				showSearchForFoodModal();
		}
		if (delta_x <= -MIN_SWIPE_EVENT_DISPLACEMENT) {
			// swipe right
				toggleCategoriesMenu();
		}
		// set SWIPE_EVENT_START_X_COORDINATE back to 0 
			SWIPE_EVENT_START_X_COORDINATE = 0; 
	}

// Generic functions
	// generic functions common to BOTH Patron.js and Manage.js
		function ajax(action,data,postAjaxFunction,functionName) {
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
		function enterHtml(encodedString) {
		    var textArea = document.createElement('textarea');
		    textArea.innerHTML = encodedString;
		    return textArea.value;
		}
	// generic functions UNIQUE to Patron.js
		function hideDropDownMenus() {
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
		function randomString(string_length)
		{
		    var text = "";
		    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		    for( var i=0; i < string_length; i++ )
		        text += possible.charAt(Math.floor(Math.random() * possible.length));

		    return text;
		}
		// used for functions that call functions on dbl and single click events
		function doubleclick(element, onsingle, ondouble) {
            if (element.getAttribute("data-dblclick") == null) {
                element.setAttribute("data-dblclick", 1);
                setTimeout(function () {
                    if (element.getAttribute("data-dblclick") == 1) {
                        onsingle(element);
                    }
                    element.removeAttribute("data-dblclick");
                }, 300);
            } else {
                element.removeAttribute("data-dblclick");
                ondouble(element);
            }
        }
        








