// GLOBAL VARIABLES and CONSTANTS
	var BACKGROUND_IMG_LIST = [
		"../Images/Fish_Dinner_Background.jpg", 
		"../Images/Ice_Cream_Background.jpg", 
		"../Images/Pizza_Background.jpg", 
		"../Images/Sanswhich_Background.jpg"
		];

	var phpFile = "Homepage.php";
	var MANAGE_HTML_URL = 'http://mobilemenu.org/Manage.html';
	var PATRON_HTML_URL = "http://mobilemenu.org/Patron.html";

// toggle visibility functions
	function revealCorrectTab(element) {
		var tab_number = element.getAttribute("data-tab-number");
		// hide all the tabs
			var all_tabs = document.querySelectorAll(".homepage_tab");
			for (var i = 0; i < all_tabs.length; i++) {
				hideElement(all_tabs[i]);
			}
		// show the desired tab
			showElement(document.querySelector(".homepage_tab[data-tab-number='"+ tab_number +"']"));
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

// query the database functions
	function findRestaurantsFromQuery(element) {
		var results_ul = document.querySelector("ul.restaurants_results");
		results_ul.innerHTML = "";
		var query_string = element.value;
		if (query_string && query_string != "") {
			var action = 1;
			var data_object = {
				"query_string" :query_string
			}
			function responseFunction(result) {
				console.log(result);
				var restaurant_data = JSON.parse(result);
				for (var i = 0; i < Object.keys(restaurant_data).length; i++) {
					var restaurant_identifier = restaurant_data[i]["restaurant_identifier"];
					var restaurant_name = restaurant_data[i]["restaurant_name"];
					var restaurant_link = 
						PATRON_HTML_URL + "?data-restaurant-identifier=" + restaurant_identifier;

					var li = document.createElement("li");
					li.className = "restaurants_results";
					li.innerHTML = 	'<a class="restaurants_results" href="'+ restaurant_link +'">'+
										restaurant_name+
									'</a>';

					results_ul.appendChild(li);

				}
			}

			ajax(action,data_object,responseFunction,"findRestaurantsFromQuery");
		}
	}

	function loginUser(){
		
		var email = document.querySelector("input.sign_in#email").value;
		var password = document.querySelector("input.sign_in#password").value;
		console.log("email: "+email+" password: " + password);
		var action = 2;

		var data_object = {
			"owner_email": email,
			"owner_password": password
		};

		function responseFunction(result){
			// since php already sets the session information, we just need to redirect the user
			// to the appropriate page
				if (result) {
					window.location.href = MANAGE_HTML_URL ;
				}
				else {
					document.querySelector(".sign_in.error_message").innerHTML = "Wrong email or password.";
				}
		}

		ajax(action,data_object,responseFunction,"loginUser");
	}


// Generic functions
	// generic functions common to BOTH Patron.js and Manage.js and Middle.js
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