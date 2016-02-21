// survey results graphs
	function responseGraph(graph_svg, data_array) {

		// CONSTANTS
			var NUMBER_OF_SMALL_DASHES = 20; // NOTE: the true count is 1 + this value to account for the one at y = 0
			var NUMBER_OF_LARGE_DASHES = 4; // NOTE: the true count is 1 + this value to account for the one at y = 0
			var LARGE_DASH_LABEL_HORZ_SHIFT = 10;
			var LARGE_DASH_LABEL_VERT_SHIFT = 5;
			var CREATE_NS_LINK = "http://www.w3.org/2000/svg";
			var GRAPH_BAR_WIDTH = 80;
			var VALUE_TEXT_VERT_SHIFT = 10;
			

		// private variables
			var values_to_plot = data_array;
			var svg = graph_svg;
			var that = this;

		// public variables
			this.graph_origin_y = 10;	// NOTE: the svg's position is fixed, this just changes where 
			this.graph_origin_x = 60; 	// the graph gets drawn on the svg
			this.graph_height = 200;  	// NOTE: there graph is one small_dash_interval larger than this.graph_heigt
										// because it overflows at the bottom of y-axis for aesthetics 

		// de facto private variables
			var small_dash_interval = that.graph_height / NUMBER_OF_SMALL_DASHES;
			var large_dash_interval = that.graph_height / NUMBER_OF_LARGE_DASHES;
			// make sure the graph height is greater than the highest value (and that it is never 0)
				var highest_label_value =  Math.max.apply(Math, values_to_plot) * 1.2 ? 
					Math.max.apply(Math, values_to_plot) * 1.2 : 4
			var num_values = values_to_plot.length;
			var graph_width = GRAPH_BAR_WIDTH * num_values;

		// de facto public variables
		

		// private functions
			var isAMultipleOf = function(value_in_question, the_multiple) {
				return ((value_in_question / the_multiple) % 1) == 0;
			}

			// graph bar functions
				var smallIncrementLine = 	function(start_y){
												var small_line = document.createElementNS(CREATE_NS_LINK, 'path');
												var path = "M"+0+","+start_y+" L"+GRAPH_BAR_WIDTH+","+start_y;

												small_line.setAttribute("class", "response small_increment_line");
												small_line.setAttribute("d",path);

												return small_line;
											}
				var largeIncrementLine = 	function(start_y){
												var large_line = document.createElementNS(CREATE_NS_LINK, 'path');
												var path = "M"+0+","+(start_y+.5)+" L"+GRAPH_BAR_WIDTH+","+(start_y+.5);

												large_line.setAttribute("class", "response large_increment_line");
												large_line.setAttribute("d",path);

												return large_line;
											}

				var shadedBackgroundRect = 	function(start_y){
												var background_rect = document.createElementNS(CREATE_NS_LINK, 'rect');

												var className = (start_y % 100 == 0) ? 
													"response grey_response_background" : "response white_response_background";

												background_rect.setAttribute("class", className);
												background_rect.setAttribute("x", 0);
												background_rect.setAttribute("y", start_y);
												background_rect.setAttribute("height", large_dash_interval);
												background_rect.setAttribute("width", GRAPH_BAR_WIDTH);

												return background_rect;
											}

				var valueBar = 				function(value){
												var value_rect = document.createElementNS(CREATE_NS_LINK, 'rect');

												var relative_height = that.graph_height * (value / highest_label_value);
												var relative_y = that.graph_height - relative_height

												value_rect.setAttribute("class","response value_rect");
												value_rect.setAttribute("x", GRAPH_BAR_WIDTH*.25);
												value_rect.setAttribute("y", relative_y);
												value_rect.setAttribute("width", GRAPH_BAR_WIDTH*.5);
												value_rect.setAttribute("height", relative_height );

												return value_rect;
											}
				var valueText = 			function(value){
												var value_text = document.createElementNS(CREATE_NS_LINK, 'text');

												var relative_height = that.graph_height * (value / highest_label_value);
												var relative_y = that.graph_height - relative_height

												value_text.setAttribute("class","response value_text");
												value_text.setAttribute("x", GRAPH_BAR_WIDTH*.5);
												value_text.setAttribute("y", relative_y - VALUE_TEXT_VERT_SHIFT);
												// create the value_text innerHTML
													var string = document.createTextNode(value + " ppl");
												value_text.appendChild(string);

												return value_text;
											} 

				var drawGraphBar = 			function(value, index){
												var x_pos = GRAPH_BAR_WIDTH*index + that.graph_origin_x;
												// create the group element
													var group = document.createElementNS(CREATE_NS_LINK, "g");
												// set the appropriate attributes
													group.setAttribute("class","response graph_bar");
													// we do (that.graph_origin_y+1) because for some reason the y_axis is shifted down by 1 px
														group.setAttribute("transform","translate("+ x_pos +","+ (that.graph_origin_y+1) +")");
												// build the innerHTML
													// creat the line increments and background colors
														for (var y_pos = 0; y_pos <= that.graph_height; y_pos += small_dash_interval) {
															// add the small increment lines
																if ( isAMultipleOf(y_pos, small_dash_interval) 
																	&& y_pos != that.graph_height) {
																	group.appendChild(smallIncrementLine( y_pos ));
																}
															// add background color rects
																if ( isAMultipleOf(y_pos, large_dash_interval) 
																	&& y_pos != that.graph_height) {
																	group.appendChild(shadedBackgroundRect( y_pos ));
																}
															// add large increment lines
																if ( isAMultipleOf(y_pos, large_dash_interval) ) {
																	group.appendChild(largeIncrementLine( y_pos ));
																}
														}
													// create the value-representing rectangle
														group.appendChild( valueBar(value) );
														group.appendChild( valueText(value) );
												// append the group element to the svg
													svg.appendChild(group);
											}

				var addValueRectGradient =	function() {
												var defs = svg.querySelector("defs");
												// check if svg already has a <defs> tag, if not create AND append one
													if (!defs) {
														defs = document.createElementNS(CREATE_NS_LINK,"defs");
														svg.appendChild( defs );
													}

												// for performance value rects
													// create the marker element
														var gradient =	document.createElementNS(CREATE_NS_LINK,"linearGradient");
													// set appropriate attributes
														gradient.setAttribute("id","value_rect_gradient");
														gradient.setAttribute("x1","0%");
														gradient.setAttribute("y1","0%");
														gradient.setAttribute("x2","0%");
														gradient.setAttribute("y2","100%");
														gradient.setAttribute("orient","auto");
														// create the innerHTML elements
															var stop1 = document.createElementNS(CREATE_NS_LINK, "stop");
															stop1.setAttribute("offset","0%");
															stop1.setAttribute("style","stop-color:rgb(73, 158, 206);stop-opacity:.8;");
														gradient.appendChild(stop1);
															var stop2 = document.createElementNS(CREATE_NS_LINK, "stop");
															stop2.setAttribute("offset","100%");
															stop2.setAttribute("style","stop-color:rgb(66, 118, 171);stop-opacity:.9;");
														gradient.appendChild(stop2);
													// append the marker to defs
														defs.appendChild( gradient );
											}

			// y-axis functions
				var smallDashIncrement = 	function(start_y){
												var small_dash = document.createElementNS(CREATE_NS_LINK, 'path');
												var path = "M"+that.graph_origin_x+","+start_y+" L"+that.graph_origin_x+","+
															(start_y + small_dash_interval);

												small_dash.setAttribute("class", "response small_hash_path axis_elements");
												small_dash.setAttribute("d",path);

												return small_dash;
											};

				var largeDashIncrement = 	function (start_y){
												var large_dash = document.createElementNS(CREATE_NS_LINK, 'path');
												var path = "M"+that.graph_origin_x+","+start_y+" L"+that.graph_origin_x+","+
															(start_y + small_dash_interval); // the length of the lare dash
																							// interval line should still be the
																							// same size as the small dash

												large_dash.setAttribute("class", "response large_hash_path axis_elements");
												large_dash.setAttribute("d",path);

												return large_dash;
											};

				var largeDashLabel =		function (start_y) {

												var text = document.createElementNS(CREATE_NS_LINK, "text");

												text.setAttribute("class", "response large_increment_label");
												text.setAttribute("x",that.graph_origin_x - LARGE_DASH_LABEL_HORZ_SHIFT);
												text.setAttribute("y",start_y + LARGE_DASH_LABEL_VERT_SHIFT);

												var percent_up_y_axis = 1 - ( (start_y - that.graph_origin_y) / that.graph_height );
												// create the innerHTML for the text element
													var string = document.createTextNode(
														(percent_up_y_axis * highest_label_value).toFixed(2) + " ppl"
													);
												text.appendChild(string);

												return text;
											};

				var addLargeHashMarker =	function() {
												var defs = svg.querySelector("defs");
												// check if svg already has a <defs> tag, if not create AND append one
													if (!defs) {
														defs = document.createElementNS(CREATE_NS_LINK,"defs");
														svg.appendChild( defs );
													}
												// create the marker element
													var large_marker =	document.createElementNS(CREATE_NS_LINK,"marker");
												// set appropriate attributes
													large_marker.setAttribute("id","large_hash_marker");
													large_marker.setAttribute("refY",0);
													large_marker.setAttribute("refX",0);
													large_marker.setAttribute("markerHeight",4);
													large_marker.setAttribute("markerWidth",1);
													large_marker.setAttribute("orient","auto");
												// set innerHTML;
													// create the rect that will be the innerHTML for both markers
														var rect = document.createElementNS(CREATE_NS_LINK,"rect");
														rect.setAttribute("class","response axis_elements");
														rect.setAttribute("x","0");
														rect.setAttribute("y","0");
														rect.setAttribute("height","4");
														rect.setAttribute("width","1");
													large_marker.appendChild(rect);
												// append the marker to defs
													defs.appendChild( large_marker );
											}

				var addSmallHashMarker =	function() {
												var defs = svg.querySelector("defs");
												// check if svg already has a <defs> tag, if not create AND append one
													if (!defs) {
														defs = document.createElementNS(CREATE_NS_LINK,"defs");
														svg.appendChild( defs );
													}
												// create the marker element
													var small_marker =	document.createElementNS(CREATE_NS_LINK,"marker");
												// set appropriate attributes
													small_marker.setAttribute("id","small_hash_marker");
													small_marker.setAttribute("refY",0);
													small_marker.setAttribute("refX",0);
													small_marker.setAttribute("markerHeight",2);
													small_marker.setAttribute("markerWidth",1);
													small_marker.setAttribute("orient","auto");
												// set innerHTML;
													// create the rect that will be the innerHTML for both markers
														var rect = document.createElementNS(CREATE_NS_LINK,"rect");
														rect.setAttribute("class","response axis_elements");
														rect.setAttribute("x","0");
														rect.setAttribute("y","0");
														rect.setAttribute("height","2");
														rect.setAttribute("width","1");
													small_marker.appendChild( rect );
												// append the marker to defs
													defs.appendChild( small_marker );
											}

						var drawYAxis = 	function() {
												var group = document.createElementNS(CREATE_NS_LINK, "g");
												group.setAttribute("class","response y_axis");
												// draws the y-axis of the graph
													for (var i = 0; i < that.graph_height + small_dash_interval; i += small_dash_interval) {
														// draw small increments
															if ( isAMultipleOf(i, small_dash_interval) ) {
																group.appendChild(smallDashIncrement( i + that.graph_origin_y ));
															}
														// draw large increments AND increment labels
															if ( isAMultipleOf(i, large_dash_interval) ) {
																group.appendChild(largeDashIncrement( i + that.graph_origin_y ));
																group.appendChild(largeDashLabel( i + that.graph_origin_y ))
															}
													}
												svg.appendChild(group);
											}
					var drawRightBorder = 	function() {
												var left_border = document.createElementNS(CREATE_NS_LINK, "rect");
												left_border.setAttribute("x",graph_width + that.graph_origin_x);
												left_border.setAttribute("y",that.graph_origin_y+1);
												left_border.setAttribute("height", that.graph_height+1);
												left_border.setAttribute("width",1);
												left_border.setAttribute("class", "response left_border");

												svg.appendChild(left_border);
											}


		// public functions
			this.drawGraph =				function() {
												// set the height & width according the number of data points
													svg.setAttribute("height",this.graph_height + 20); // for labels
													svg.setAttribute("width",GRAPH_BAR_WIDTH* (num_values + 1) ); // the extra value is for y-axis
												// clear the svg in case it has existing elements
													while (svg.firstChild) {
													    svg.removeChild(svg.firstChild);
													}
												// add the appropriate markers
													addSmallHashMarker();
													addLargeHashMarker();
												// add the appropriate gradients
													addValueRectGradient();
												
												// plot the data
													values_to_plot.forEach(function plot(value,index){
														drawGraphBar(value, index);
													});
												// draw the y-axis
													drawYAxis();
													drawRightBorder();

													return svg;
												};
	}

	function plotCorrectData(element) {
		var new_data = JSON.parse( element.value );
		var graph_svg = element.parentElement.querySelector("svg.response_graph");
		var graph_object = new responseGraph(graph_svg, new_data);
		graph_object.drawGraph();
	}