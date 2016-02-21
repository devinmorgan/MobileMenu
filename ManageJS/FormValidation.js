// functions that each check for a different validation test
	function inputIsNotBlank(element) {
		if (element.value == null || element.value == "") {
			// 1) highlight input in red
				element.className = element.className + " invalid_input";
			// 2) add a div that holds the correct error message
				var next_sibling = element.nextSibling;
				if (!next_sibling ||
					!next_sibling.className ||
					next_sibling.className.indexOf("error_message") == -1){
					var error_element = document.createElement("div");
					error_element.className = "error_message";
					error_element.innerHTML = "This field cannot be left blank!";
					insertAfter(error_element, element);
				}

				
			// 3) return false to prevent any further action from taking place
				return false;
		}
		else {
			// 1) remove the red highlight from the input
				element.className = element.className.replace(/ invalid_input/g,"");
			// 2) add a div that holds the correct error message
				var next_sibling = element.nextSibling;
				if (next_sibling && 
					next_sibling.className &&
					next_sibling.className.indexOf("error_message") != -1)
				{
					element.parentElement.removeChild(next_sibling);
				}
			// 3) return false to prevent any further action from taking place
				return true;
		}
	}

	function noChildInputsAreEmpty(element) {
		var input_list = element.querySelectorAll("input");
		var all_fields_are_filled = true;
		for (var i = 0; i < input_list.length; i++) {
			if (!inputIsNotBlank( input_list[i] )) {
				all_fields_are_filled = false;
			}
		}
		return all_fields_are_filled;
	}

// generic helper functions for error checking
	function insertAfter(newNode, referenceNode) {
	    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
	}