// draw performance graph on right sidebar performance tab
		function resetPerformanceTab(history_depth) {
			history_depth = (history_depth == null) ? 0 : history_depth;
			// clear the graph of its data points
				var svg = document.querySelector("svg.performance_graph");
				while (svg.firstChild) {
				    svg.removeChild(svg.firstChild);
				}
			// reset the statistics to defaults
				document.querySelector("#time_scale_header").innerHTML = "Average over last " + history_depth + " days:";
				document.querySelector("#today_perormance_value").innerHTML = "N/A";
				document.querySelector("#interested_and_viewed").innerHTML = "0 ppl interested, 0 ppl viewed";
		}
	function drawPerformanceGraph()
	{
		var food_identifier = document.querySelector(".food_entry.food_selected").
								getAttribute("data-food-identifier");

		var unit_time_size = parseInt( document.querySelector("#data_granularity_input").value ); // units of days
		var history_depth = document.querySelector("#data_timescale_input").value; // units of days

		var total_interests = 0;
		var total_views = 0;

		function responseFunction(result) {
			// alert(result);
			var food_data = JSON.parse(result);
			var interest_count_array = [];
			var view_count_array = [];
			var date_recorded_list = [];
			for (var row = 0; row < Object.keys(food_data).length; row++) {
				if (Object.keys(food_data[row][0]).length > 1){

					var views_count = food_data[row][0]["views_count"];
					total_views += parseInt(views_count,10);
					var interest_count = food_data[row][0]["interest_count"];
					total_interests += parseInt(interest_count,10);
					// format from php is yyyy-mm-dd
						var date_recorded = food_data[row][0]["date_recorded"].substring(5);

					// add the data to the their respective lists to be used by the graph object
						interest_count_array.unshift( interest_count );
						view_count_array.unshift( views_count );
						date_recorded_list.unshift( date_recorded );
				}
				else {

					// add the data to the their respective lists to be used by the graph object
						interest_count_array.unshift( 0);
						view_count_array.unshift( 0 );

						var date_recorded = food_data[row][0]["date_recorded"].substring(5);
						date_recorded_list.unshift( date_recorded );
				}
			}
			// populate the header captions with the calcuated values 
				document.querySelector("#time_scale_header").innerHTML = 
					"Average of last " + history_depth + " days:";
				document.querySelector("#today_perormance_value").innerHTML = total_views ?
					(total_interests / total_views).toFixed(1)*100 + "%" : "N/A";
				document.querySelector("#interested_and_viewed").innerHTML = 
					total_interests + " ppl interested, " + total_views + " ppl viewed";
			// creat performance graph
				var graph_svg = document.querySelector("svg.performance_graph");
				var graph_object = new performanceGraph(graph_svg, interest_count_array, view_count_array, date_recorded_list);
				if (window.innerWidth < 800) {
					graph_object.graph_height = window.innerHeight*.4;
				}
				graph_object.drawGraph();

			
			
		}

		var action = 11;
		var data_object = {
			"food_identifier": food_identifier,
			"history_depth": history_depth,
			"unit_time_size": unit_time_size
		}

		ajax(action,data_object,responseFunction,"drawPerformanceGraph");
	}




























