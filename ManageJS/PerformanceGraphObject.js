function performanceGraph(graph_svg, interest_count_array, view_count_array, captions_array) {

	// CONSTANTS
		var NUMBER_OF_SMALL_DASHES = 20; // NOTE: the true count is 1 + this value to account for the one at y = 0
		var NUMBER_OF_LARGE_DASHES = 4; // NOTE: the true count is 1 + this value to account for the one at y = 0
		var LARGE_DASH_LABEL_HORZ_SHIFT = 10;
		var LARGE_DASH_LABEL_VERT_SHIFT = 5;
		var CREATE_NS_LINK = "http://www.w3.org/2000/svg";
		var VALUE_TEXT_VERT_SHIFT = 10;
		var GRAPH_SECTION_WIDTH = 60;
		var GRAPH_DOT_RADIUS = 5;

	// private variables
		var svg = graph_svg;
		var that = this;
		


	// public variables
		this.graph_origin_y = 30;	// NOTE: the svg's position is fixed, this just changes where 
		this.graph_origin_x = 100; 	// the graph gets drawn on the svg
		this.graph_height = 400;  	// NOTE: there graph is one small_dash_interval larger than this.graph_heigt

	// de facto private variables
		var small_dash_interval = that.graph_height / NUMBER_OF_SMALL_DASHES;
		var large_dash_interval = that.graph_height / NUMBER_OF_LARGE_DASHES;
		var num_values = view_count_array.length;
		var graph_width = num_values * GRAPH_SECTION_WIDTH;
		var max_view_count_value = Math.max.apply(Math, view_count_array) * 1.2 ? 
					Math.max.apply(Math, view_count_array) * 1.2 : 100;

	// private functions
		var isAMultipleOf = function(value_in_question, the_multiple) {
			return ((value_in_question / the_multiple) % 1) == 0;
		};

		// defs, markers, and gradients
			var addLargeHashMarkers =	function() {
											var defs = svg.querySelector("defs");
											// check if svg already has a <defs> tag, if not create AND append one
												if (!defs) {
													defs = document.createElementNS(CREATE_NS_LINK,"defs");
													svg.appendChild( defs );
												}

											// for the Left Axis
												// create the marker element
													var large_left_marker =	document.createElementNS(CREATE_NS_LINK,"marker");
												// set appropriate attributes
													large_left_marker.setAttribute("id","large_left_hash_marker");
													large_left_marker.setAttribute("refY",0);
													large_left_marker.setAttribute("refX",0);
													large_left_marker.setAttribute("markerHeight",4);
													large_left_marker.setAttribute("markerWidth",1);
													large_left_marker.setAttribute("orient","auto");
													// create the rect that will be the innerHTML for both markers
														var rect = document.createElementNS(CREATE_NS_LINK,"rect");
														rect.setAttribute("class","performance axis_elements");
														rect.setAttribute("x","0");
														rect.setAttribute("y","0");
														rect.setAttribute("height","4");
														rect.setAttribute("width","1");
													large_left_marker.appendChild( rect );
												// append the marker to defs
													defs.appendChild( large_left_marker );
										}

			var addSmallHashMarker =	function() {
											var defs = svg.querySelector("defs");
											// check if svg already has a <defs> tag, if not create AND append one
												if (!defs) {
													defs = document.createElementNS(CREATE_NS_LINK,"defs");
													svg.appendChild( defs );
												}
											// for the Left Axis
												// create the marker element
													var small_left_marker =	document.createElementNS(CREATE_NS_LINK,"marker");
												// set appropriate attributes
													small_left_marker.setAttribute("id","small_left_hash_marker");
													small_left_marker.setAttribute("refY",0);
													small_left_marker.setAttribute("refX",0);
													small_left_marker.setAttribute("markerHeight",2);
													small_left_marker.setAttribute("markerWidth",1);
													small_left_marker.setAttribute("orient","auto");
												// set innerHTML;
													// create the rect that will be the innerHTML for both markers
														var rect = document.createElementNS(CREATE_NS_LINK,"rect");
														rect.setAttribute("class","performance axis_elements");
														rect.setAttribute("x","0");
														rect.setAttribute("y","0");
														rect.setAttribute("height","2");
														rect.setAttribute("width","1");
													small_left_marker.appendChild( rect );
												// append the marker to defs
													defs.appendChild( small_left_marker );
										}

			var addValueRectsGradient =	function() {
												var defs = svg.querySelector("defs");
												// check if svg already has a <defs> tag, if not create AND append one
													if (!defs) {
														defs = document.createElementNS(CREATE_NS_LINK,"defs");
														svg.appendChild( defs );
													}

												// for performance value rects
													// create the marker element
														var performance_gradient =	document.createElementNS(CREATE_NS_LINK,"linearGradient");
													// set appropriate attributes
														performance_gradient.setAttribute("id","performance_gradient");
														performance_gradient.setAttribute("x1","0%");
														performance_gradient.setAttribute("y1","0%");
														performance_gradient.setAttribute("x2","0%");
														performance_gradient.setAttribute("y2","100%");
														performance_gradient.setAttribute("orient","auto");
														// create the innerHTML elements
															var stop1 = document.createElementNS(CREATE_NS_LINK, "stop");
															stop1.setAttribute("offset","0%");
															stop1.setAttribute("style","stop-color:rgb(73, 158, 206);stop-opacity:.8;");
														performance_gradient.appendChild(stop1);
															var stop2 = document.createElementNS(CREATE_NS_LINK, "stop");
															stop2.setAttribute("offset","100%");
															stop2.setAttribute("style","stop-color:rgb(66, 118, 171);stop-opacity:.9;");
														performance_gradient.appendChild(stop2);
													// append the marker to defs
														defs.appendChild( performance_gradient );

												// for performance value rects
													// create the marker element
														var view_count_gradient =	document.createElementNS(CREATE_NS_LINK,"linearGradient");
													// set appropriate attributes
														view_count_gradient.setAttribute("id","view_count_gradient");
														view_count_gradient.setAttribute("x1","0%");
														view_count_gradient.setAttribute("y1","0%");
														view_count_gradient.setAttribute("x2","0%");
														view_count_gradient.setAttribute("y2","100%");
														view_count_gradient.setAttribute("orient","auto");
														// create the innerHTML elements
															var stop3 = document.createElementNS(CREATE_NS_LINK, "stop");
															stop3.setAttribute("offset","0%");
															stop3.setAttribute("style","stop-color:rgb(54, 186, 54);stop-opacity:.8;");
														view_count_gradient.appendChild(stop3);
															var stop4 = document.createElementNS(CREATE_NS_LINK, "stop");
															stop4.setAttribute("offset","100%");
															stop4.setAttribute("style","stop-color:rgb(36, 140, 36);stop-opacity:.9;");
														view_count_gradient.appendChild(stop4);
													// append the marker to defs
														defs.appendChild( view_count_gradient );
											}

		// graph background functions
			var smallIncrementLine = 	function(start_y){
											var small_line = document.createElementNS(CREATE_NS_LINK, 'path');
											var path = "M"+0+","+(start_y+1)+" L"+graph_width+","+(start_y+1);

											small_line.setAttribute("class", "performance small_increment_line");
											small_line.setAttribute("d",path);

											return small_line;
										};

			var largeIncrementLine = 	function(start_y){
											var large_line = document.createElementNS(CREATE_NS_LINK, 'path');
											var path = "M"+0+","+(start_y+1)+" L"+graph_width+","+(start_y+1);

											large_line.setAttribute("class", "performance large_increment_line");
											large_line.setAttribute("d",path);

											return large_line;
										};

			var shadedBackgroundRect = 	function(start_y, count){
											var background_rect = document.createElementNS(CREATE_NS_LINK, 'rect');

											var className = (count % 2 == 0) ? 
												"performance grey_response_background" : "performance white_response_background";

											background_rect.setAttribute("class", className);
											background_rect.setAttribute("x", 0);
											background_rect.setAttribute("y", start_y + 1);
											background_rect.setAttribute("height", large_dash_interval);
											background_rect.setAttribute("width", graph_width);
											background_rect.setAttribute("style","stroke-dasharray: "+graph_width+","+large_dash_interval+";");

											return background_rect;
										};

			var drawGraphBackground = 	function() {
											var group = document.createElementNS(CREATE_NS_LINK, "g");
											group.setAttribute("class","performance background_group");
											group.setAttribute("transform","translate("+ that.graph_origin_x +","+ that.graph_origin_y +")");

											var large_increment_count = 0;
											// for (var y_pos = 0; y_pos < that.graph_height; y_pos += small_dash_interval) {
												for (var y_pos = 0; y_pos <= that.graph_height; y_pos += small_dash_interval) {
													var a = y_pos;
												// draw the smallIncrementLines

													if (isAMultipleOf(y_pos, small_dash_interval) ) {
														group.appendChild( smallIncrementLine(y_pos) );
													}
													if (isAMultipleOf(y_pos, large_dash_interval) ) {
														group.appendChild( largeIncrementLine(y_pos) );
													}
													if (isAMultipleOf(y_pos, large_dash_interval) 
														&& y_pos != that.graph_height) {

														group.appendChild( shadedBackgroundRect(y_pos, large_increment_count) );
														large_increment_count++;
													}
											}
											svg.appendChild(group);
										};

		// y-axis functions
			var smallDashIncrement = 	function(start_y){
											var small_dash = document.createElementNS(CREATE_NS_LINK, 'path');

											var path = "M"+0+","+start_y+" L"+0+","+ (start_y + small_dash_interval);
											small_dash.setAttribute("class", "performance small_hash_path axis_elements left");
											small_dash.setAttribute("d",path);

											return small_dash;
										};

			var largeDashIncrement = 	function (start_y){
											var large_dash = document.createElementNS(CREATE_NS_LINK, 'path');

											// the length of the lare dash interval line should still be the same size as the small dash
											var path = "M"+0+","+start_y+" L"+0+","+ (start_y + small_dash_interval);
											large_dash.setAttribute("class", "performance large_hash_path axis_elements left");					
											large_dash.setAttribute("d",path);

											return large_dash;
										};

			var largeDashLabel =		function (start_y) {
											var text = document.createElementNS(CREATE_NS_LINK, "text");
											text.setAttribute("x",0 - LARGE_DASH_LABEL_HORZ_SHIFT);
											text.setAttribute("class", "performance large_increment_label left");

											var percent_up_y_axis = 1 - ( start_y / that.graph_height );								
											text.setAttribute("y",start_y + LARGE_DASH_LABEL_VERT_SHIFT);
											// create the text node that will be the innerHTML of the text element
												var text_string = document.createTextNode( 
													(percent_up_y_axis * max_view_count_value).toFixed(2) + " People"
												);
											text.appendChild( text_string );	
											return text;
										};

			var drawYAxis = 		function() {
											var group = document.createElementNS(CREATE_NS_LINK, "g");
											group.setAttribute("class","performance y_axis percent");
											group.setAttribute("transform","translate("+ that.graph_origin_x +","+ that.graph_origin_y +")");
											
											// draws the y-axis of the graph
												// for (var y_pos = 0; y_pos < that.graph_height + small_dash_interval; y_pos += small_dash_interval) {
												for (var y_pos = 0; y_pos <= that.graph_height;  y_pos += small_dash_interval) {
													// draw small increments
														if ( isAMultipleOf(y_pos, small_dash_interval) ) {
															group.appendChild(smallDashIncrement( y_pos, true ));
														}
													// draw large increments AND increment labels
														if ( isAMultipleOf(y_pos, large_dash_interval) ) {
															group.appendChild(largeDashIncrement( y_pos, true ));
															group.appendChild(largeDashLabel( y_pos, true ));
														}
												}

											svg.appendChild(group);
										};
			var drawRightBorder = 	function() {
											var left_border = document.createElementNS(CREATE_NS_LINK, "rect");
											left_border.setAttribute("x",graph_width + that.graph_origin_x);
											left_border.setAttribute("y",that.graph_origin_y+1);
											left_border.setAttribute("height", that.graph_height+1);
											left_border.setAttribute("width",1);
											left_border.setAttribute("class", "performance left_border");

											svg.appendChild(left_border);
										}

		// plotting data functions
			// creating data groupsvar 
				var createInterestCountDot =	function(interest_count_value) {
													var x_pos = .5 * GRAPH_SECTION_WIDTH;
													var y_pos = (1 - (interest_count_value / max_view_count_value) ) * that.graph_height;

													var interest_circle = document.createElementNS(CREATE_NS_LINK, "circle");
													interest_circle.setAttribute("cx", x_pos);
													interest_circle.setAttribute("cy",  y_pos);
													interest_circle.setAttribute("r", GRAPH_DOT_RADIUS);
													interest_circle.setAttribute("class", "performance interest_count dot");

													return interest_circle;
												}

					var createViewCountDot = 	function(view_count_value) {
													var x_pos = .5 * GRAPH_SECTION_WIDTH;
													var y_pos = (1 - (view_count_value / max_view_count_value) ) * that.graph_height;

													var view_circle = document.createElementNS(CREATE_NS_LINK, "circle");
													view_circle.setAttribute("cx", x_pos);
													view_circle.setAttribute("cy",  y_pos);
													view_circle.setAttribute("r", GRAPH_DOT_RADIUS);
													view_circle.setAttribute("class", "performance view_count dot");

													return view_circle;
												}

					var createDataValuesText = 	function(interest_count_value, view_count_value) {
													var x_pos =  -GRAPH_SECTION_WIDTH/4;

													var y_pos = (1 - (view_count_value / max_view_count_value) ) *
														that.graph_height  - 70; /* - puts it above the dot */

													var group = document.createElementNS(CREATE_NS_LINK, "g");
													// create the innerHTML for the group
														var rect = document.createElementNS(CREATE_NS_LINK, "rect");
														rect.setAttribute("x",x_pos);
														rect.setAttribute("y",y_pos);
														rect.setAttribute("width","100");
														rect.setAttribute("height","50");
														rect.setAttribute("class","performance data_values");

														var text = document.createElementNS(CREATE_NS_LINK, "text");
														text.setAttribute("x",x_pos);
														text.setAttribute("y",y_pos);
														text.setAttribute("class","performance value_text");
														// create the innerHTML for the text element
															var tspan1 = document.createElementNS(CREATE_NS_LINK, "tspan");
															tspan1.setAttribute("x","35");
															tspan1.setAttribute("dy","20");
															// create the innerHTML for the tspan
																var string1 = document.createTextNode(interest_count_value + " interested, ");
															tspan1.appendChild(string1);

															var tspan2 = document.createElementNS(CREATE_NS_LINK, "tspan");
															tspan2.setAttribute("x","35");
															tspan2.setAttribute("dy","15");
															// create the innerHTML for the tspan
																var string2 = document.createTextNode(view_count_value + " viewed.");
															tspan2.appendChild(string2);

														text.appendChild(tspan1);
														text.appendChild(tspan2);

													group.appendChild(rect);
													group.appendChild(text);

													return group;
												}

					var createCaptionText = 	function(caption_string) {
													var caption_text = document.createElementNS(CREATE_NS_LINK, "text");
													caption_text.setAttribute("x", GRAPH_SECTION_WIDTH / 4);
													caption_text.setAttribute("y",  that.graph_height + 2*VALUE_TEXT_VERT_SHIFT - 5); // this is 1 line lower
													caption_text.setAttribute("class", "performance data_point caption");
													caption_text.innerHTML = caption_string;
													
													return caption_text;
												}

								var plotData =	function() {
													for (var i = 0; i < num_values; i++) {
														var x_pos = i * GRAPH_SECTION_WIDTH + that.graph_origin_x;
														var y_pos = that.graph_origin_y;
														var interest_count = interest_count_array[i];
														var view_count_value = view_count_array[i];
														var caption_string = captions_array[i];

														var group = document.createElementNS(CREATE_NS_LINK, "g");
														group.appendChild( createInterestCountDot( interest_count ) );
														group.appendChild( createViewCountDot( view_count_value ) );
														group.appendChild( createDataValuesText(interest_count, view_count_value) );
														group.appendChild( createCaptionText( caption_string ) );
														group.setAttribute("class","performance data_point");
														group.setAttribute("transform","translate("+ x_pos +","+ y_pos +")");
														svg.appendChild(group);
													}
												}

				var lineForDataArray = 			function(data_array) {
													// draw the line for the interest_count_values
														var y = that.graph_height - data_array[0] / max_view_count_value * that.graph_height + that.graph_origin_y;
														var x = GRAPH_SECTION_WIDTH * .5 + that.graph_origin_x;
														var path = "M" + x + "," + y + " ";

														for (var i = 1; i < data_array.length; i++) {
															y = that.graph_height - data_array[i] / max_view_count_value * that.graph_height + that.graph_origin_y;
															x = GRAPH_SECTION_WIDTH * (i + .5) + that.graph_origin_x;

															path += "L" + x + "," + y + " ";
														}

														var path_element = document.createElementNS(CREATE_NS_LINK, "path");
														path_element.setAttribute("d",path);

													return path_element
												}
			var drawViewAndInterestCountLines = function() {
													var interest_path = lineForDataArray(interest_count_array);
													interest_path.setAttribute("class", "performance interest_count");
													svg.appendChild(interest_path);

													var views_path = lineForDataArray(view_count_array);
													views_path.setAttribute("class", "performance view_count");
													svg.appendChild(views_path);
												}

	// public functions
		this.drawGraph =				function() {
											// set the height & width according the number of data points
												svg.setAttribute("height",this.graph_height + 50); // for labels
												svg.setAttribute("width",graph_width + 3* GRAPH_SECTION_WIDTH); // the extra value is for the 2nd y-axis
											// clear the svg in case it has existing elements
												while (svg.firstChild) {
												    svg.removeChild(svg.firstChild);
												}
											// add the appropriate markers and gradients
												addSmallHashMarker();
												addLargeHashMarkers();
												addValueRectsGradient();
											// draw grph background
												drawGraphBackground();
											// draw the y-axis
												drawYAxis();
												drawRightBorder();
											// connect the data set lines
												drawViewAndInterestCountLines();
											// plot each data set
												plotData();
											

												return svg;
										};
}



function documentOnReady(){
	var captions = ["12/18","12/19","12/20","12/21"];
	var performance = [67,23,4,1];
	var view_count = [90, 30, 15, 3];
	var svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
	var graph_object = new performanceGraph(svg, performance, view_count, captions);
	// graph_object.graph_width = 300;
	var graph_svg = graph_object.drawGraph();
	var body = document.querySelector("body");
	body.appendChild(graph_svg);
	/* NOTE: a survey result will be a sandwhich with question centered above grpha as the title
	then the graph, then the captions, then the select HTML element that allows you to view the different */

}


    
    



















































