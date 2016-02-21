// functions to alter the right sidebar visibility
	function showRightSidebar() {
		if (window.innerWidth < 800) {
			// reveal the right sidebar
				document.querySelector("#right_sidebar_wrapper").className = "show_right_sidebar";
			// reveal the black overlay
				document.querySelector("#sidebar_menu_open_overlay").style.display = "block";
		}
	}

	function hideRightSidebar() {
		if (window.innerWidth < 800) {
			// reveal the right sidebar
				document.querySelector("#right_sidebar_wrapper").className = "";
			// reveal the black overlay
				document.querySelector("#sidebar_menu_open_overlay").style.display = "none";
		}
	}

// functions to alter the left sidebar visibility
	function showLeftSidebar() {
		if (window.innerWidth < 800) {
			// show left sidebar
				document.querySelector("#left_sidebar_wrapper").style.left = "0px";
			// reveal the black overlay
				document.querySelector("#sidebar_menu_open_overlay").style.display = "block";
		}
	}

	function hideLeftSidebar() {
		if (window.innerWidth < 800) {
			// hide left sidebar
				document.querySelector("#left_sidebar_wrapper").style.left = "-250px";
			// reveal the black overlay
				document.querySelector("#sidebar_menu_open_overlay").style.display = "none";
		}
	}


function toggleLeftSidebar() {
	if (window.innerWidth < 800) {
		var left_sidebar = document.querySelector("#left_sidebar_wrapper");
		if (left_sidebar.style.left == "0px") {
			hideLeftSidebar();
		}
		else {
			hideRightSidebar();
			showLeftSidebar();
		}
	}
}
function toggleRightSidebar() {
	if (window.innerWidth < 800) {
		var right_sidebar = document.querySelector("#right_sidebar_wrapper");
		if (right_sidebar.className == "show_right_sidebar") {
			hideRightSidebar();
		} 
		else {
			showRightSidebar();
		}
	}
}

function hideAllSidebars() {
	// hide the right sidebar
		document.querySelector("#right_sidebar_wrapper").className = "";
	// hide the left sidebar 
		document.querySelector("#left_sidebar_wrapper").style.left = "-250px";
	// hide the black overlay
		document.querySelector("#sidebar_menu_open_overlay").style.display = "none";
}