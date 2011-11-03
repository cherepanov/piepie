/**
 * Creates PiePie chart instance.
 *
 * @author Alexey Cherepanov<a@cherepanov.info>
 * 
 * @this {PiePie}
 * @constructor
 * @return {PiePie} PiePie object
 * 
 * @param {json} config configuration object
 * 	@param {Integer}	config.x			x-coordinate location
 * 	@param {Integer} 	config.y 			y-coordinate location
 * 	@param {Integer}	config.width 		chart canvas width
 * 	@param {Integer}	config.height 		chart canvas height
 * 	@param {json} 		config.background 	background fill attributes
 * 	@param {Array} 		config.colors 		array of sector colors in hex format
 * 	@param {String} 	config.dataURL 		location of service
 * 	@param {Integer} 	config.rotation	 	pie rotation angle in degrees
 */

var PiePie = (function() {


var constr = function(config) {
	//TODO: validate config and data with schema
	var self = this;

	var 	pieCenterX 		= config.width / 2
		,	pieCenterY 		= config.height / 2
		,	pieInnerRadius	= config.width * 0.2
		,	pieOuterRadius	= config.width * 0.35
		,	pieSpotRadius	= (pieOuterRadius + pieInnerRadius) * 0.53
		,	data = {}
		, 	label = ""
		,	rotation = config.rotation ? config.rotation : 0
		, 	onDrawFinish = config.onDrawFinish || function(){;};	
		;
	
	var paper = Raphael(config.x, config.y, config.width, config.height);
	
	paper.rect(0, 0, config.width, config.height).attr(config.background);

	paper.customAttributes.arc = function (startAngle, endAngle, innerRadius, outerRadius) {
		var
			outerStartX	= pieCenterX - outerRadius * Math.cosA(startAngle)
		,	outerStartY = pieCenterY - outerRadius * Math.sinA(startAngle)
		,	outerEndX 	= pieCenterX - outerRadius * Math.cosA(endAngle)
		,	outerEndY 	= pieCenterY - outerRadius * Math.sinA(endAngle)
		,	innerStartX	= pieCenterX - innerRadius * Math.cosA(startAngle)
		,	innerStartY	= pieCenterY - innerRadius * Math.sinA(startAngle)
		,	innerEndX 	= pieCenterX - innerRadius * Math.cosA(endAngle)
		,	innerEndY 	= pieCenterY - innerRadius * Math.sinA(endAngle)
		;

        var p = [
          "M", outerStartX, outerStartY,
          "A", outerRadius, outerRadius, 0, 0, 1, outerEndX, outerEndY,
          "L", innerEndX, innerEndY,
          "A", innerRadius, innerRadius, 0, 0, 0, innerStartX, innerStartY,
          "L", outerStartX, outerStartY,
          "Z"
        ];
		return {path: p};
	};
	
	$.getJSON(config.dataURL, function(res) {
		//TODO: implement colors generator
		//TODO: throw exception on error
		var pieOffset = 0;
		var animationQueue = $({});
		data = res.data;
		label = res.label;
		drawLegend();
		$(data).each(function(idx, obj){
			//TODO: implement values normalization and sorting
			animationQueue.queue(function(next) {
				var percent = parseFloat(obj.value);
				var callback = idx == data.length-1 ? onDrawFinish : next ;
				drawSector(pieOffset, percent, config.colors[idx], callback);
				pieOffset += percent;
			});
		});
	});

	//#ifdef DEBUG
	paper.circle(pieCenterX, pieCenterY, 3).attr({fill: "#E00", stroke: "none"});
 	paper.circle(pieCenterX - pieOuterRadius, pieCenterY, 3).attr({fill: "#E00", stroke: "none"});
 	paper.circle(pieCenterX	+ pieOuterRadius, pieCenterY, 3).attr({fill: "#E00", stroke: "none"});
 	paper.circle(pieCenterX, pieCenterY + pieOuterRadius, 3).attr({fill: "#E00", stroke: "none"});
 	paper.circle(pieCenterX, pieCenterY - pieOuterRadius, 3).attr({fill: "#E00", stroke: "none"});
 	//#end

 	//#ifdef DEBUG
 	constr.prototype.getPrivateProperty = function (name) {
 		return eval(name);
 	};
 	//#end

	function drawSector(offset, percent, color, onAnimationEnd) {
		var startAngle = 180 * offset + rotation
		,   endAngle = 180 * (offset + percent) + rotation
		,   tipAngle = (startAngle + endAngle) / 2
		,   tipCenterX = pieCenterX - pieSpotRadius * Math.cosA(tipAngle)
		,   tipCenterY = pieCenterY - pieSpotRadius * Math.sinA(tipAngle)
		,   tipEndX = pieCenterX - 1.1 * pieOuterRadius * Math.cosA(tipAngle)
		,   tipEndY = pieCenterY - 1.1 * pieOuterRadius * Math.sinA(tipAngle)
		,	tipOrientation = Math.cosA(tipAngle) > 0
		,	tipLineEndX = tipEndX + (tipOrientation ? - 30: + 30)
		;
		
		var baseColor = Raphael.rgb2hsb(color)
		,	spotColor = $.extend(baseColor)
		;
		spotColor.b *= 0.9;
		
		var set = paper.set();

		function drawTip(){
			set.push(paper.circle(tipCenterX, tipCenterY, 3).attr({fill: "#000", stroke: "none"}));
			set.push(paper.path([
	            "M", tipCenterX, tipCenterY,
	            "L", tipEndX, tipEndY,
	            "L", tipLineEndX, tipEndY
	        ]));
			set.push(paper.text(tipLineEndX + (tipOrientation ? 12 : -12), tipEndY - 10, percent * 100 + "%"));
		}
		
		/* 
		 * because of adjacent arcs edges not match pixel by pixel
		 * arc must be drawn with slightly modified radius value 
		 */ 

		var outerArc = paper.path()
							.attr({arc: [startAngle, startAngle, pieSpotRadius - 1, pieOuterRadius]})
							.attr({fill: baseColor, stroke: "none"});

		var innerArc = paper.path()
							.attr({arc: [startAngle, startAngle, pieInnerRadius, pieSpotRadius + 1]})
							.attr({fill: spotColor, stroke: "none"});
		
		set.push(innerArc);
		set.push(outerArc);

		var outerAnimation = Raphael.animation(
			{arc: [startAngle, endAngle, pieSpotRadius - 1, pieOuterRadius]}, 1000, ">"
			, function(){
				onAnimationEnd();
				drawTip();
				set.mouseover(function() {
					set.stop().animate({transform: "s1.1 1.1 " + pieCenterX + " " + pieCenterY}, 500, "elastic");
				}).mouseout(function () {
		            set.stop().animate({transform: ""}, 500, "elastic");
		        });
		});
		
		outerArc.animate(outerAnimation);

		innerArc.animateWith(outerArc, outerAnimation,{arc: [startAngle, endAngle, pieInnerRadius, pieSpotRadius + 1]}, 1000, ">");
	}

	function drawLegend(){
		var x = pieCenterX - pieOuterRadius
		,	y = pieCenterY +  config.height * 0.1
		,	legendWidth = 0
		,	legendHeight = 0
		;

		switch(true) {
			case (rotation > 89 && rotation < 180): {
				y = pieCenterY - data.length * 10;
				x = config.width * 0.1;
				break;
			}
			case (rotation > 179 && rotation < 270): {
				y = config.height * 0.1;
				break;
			}
			case (rotation > 269): {
				x = pieCenterX + config.width * 0.05;
				y = pieCenterY - data.length * 10;
				break;
			}
		}

		var l = paper.text(x, y, label.toUpperCase()).attr({font: "16px Arial", "font-weight": "bold", fill: "#000", "text-anchor": "start"});
		l = l.getBBox();
		legendWidth= l.width;

		$(data).each(function(idx, obj){
			y += 20;
			var c = Raphael.rgb2hsb(config.colors[idx]);
			c.b *= 0.5;
			c = Raphael.hsb2rgb(c);
			var f = "315-" + c + "-" + config.colors[idx];
			paper.rect(x, y, 20, 10).attr({fill: f, stroke: "none"});

			l = paper.text(x + 24, y + 4, obj.title.toUpperCase()).attr({"text-anchor": "start"});
			l = l.getBBox();
			legendWidth = l.width + 24 > legendWidth ? l.width + 24 : legendWidth; 
		});
	}
};

 	return constr;
})();