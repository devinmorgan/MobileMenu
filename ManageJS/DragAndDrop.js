// Drag and Drop to reOrganize Categories
	function dragstart (ev) 
	{
		if (ev.currentTarget.parentElement.id == "menu_categories_list")
		{
			indexListItemsOfList(ev.currentTarget.parentElement);
		}

		ev.dataTransfer.effectAllowed = "move";
		ev.dataTransfer.setData("src_position", ev.currentTarget.getAttribute("data-list-index"));
		ev.dataTransfer.setDragImage(ev.currentTarget, 0, 0);
	}

	function dragenter(ev)
	{
		ev.currentTarget.className = "left_sidebar_tab_li item drag_over";
	}

	function dragleave(ev) 
	{
		ev.currentTarget.className = "left_sidebar_tab_li item";
	}

	function dragover(ev)
	{
		ev.preventDefault();
	}
		
		function indexListItemsOfList(list_element)
		{
			var list_items = list_element.getElementsByTagName("li");

			for (var i = 0; i < list_items.length; i++)
			{
				// get the list item in the list and its position in the list
					var element = list_items[i];
					var element_position = getElementIndex(element);

				// assign the li's data-list-index attribute the value of its current position
					element.setAttribute("data-list-index",element_position);
			}
		}
	function drop(ev)
	{
		var src_position = ev.dataTransfer.getData("src_position");
		var target_position = ev.currentTarget.getAttribute("data-list-index");

		var srcObject = document.querySelectorAll('li[data-list-index="'+src_position+'"]')[0];
		var parent_list = ev.currentTarget.parentElement;

		if (src_position == target_position)
		{
			// pass, its the same element
		}
		else
		{
			parent_list.insertBefore(srcObject, ev.currentTarget);
		}
		
		unselectEveryThing();
		
	}

	function dragend(ev) {
		ev.dataTransfer.clearData("src_position");

		if (ev.currentTarget.parentElement.id == "menu_categories_list") {
			// re-evaluate the values for data-list-index
				indexListItemsOfList(ev.currentTarget.parentElement);

			// update the database with new values
				var categories_list = document.querySelectorAll("#menu_categories_list li");
				var data_object = [];
				for (var i = 0; i < categories_list.length; i++) {
					var category_identifier = categories_list[i].getAttribute("data-category-identifier");
					var menu_position = categories_list[i].getAttribute("data-list-index");

					data_object.push({"category_identifier":category_identifier,
					"menu_position":menu_position});

				}

				function responseFunction(result) {

				}

				var action = 3;
				ajax(action,data_object,responseFunction,"dragend");
		}
	  
	}