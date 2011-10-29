var DEBUG = false;

Math.RAD = Math.PI / 180;

Math.cosA = function(angle) {
	return Math.cos(angle * Math.RAD);
};

Math.sinA = function(angle) {
	return Math.sin(angle * Math.RAD);
};

/**
 * Creates PiePie chart instance.
 *
 * @author Alexey Cherepanov<a@cherepanov.info>
 * 
 * @this {PiePie}
 * @constructor
 * @return {PiePie} Raphael paper object
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

var PiePie = function(config) {
	
	PiePie.VERTICAL = 1;
	PiePie.HORIZONTAL = 2;

	//TODO: validate config and data with schema

	var 	pieCenterX 		= config.width / 2
		,	pieCenterY 		= config.height * 0.6
		,	pieInnerRadius	= config.width * 0.2
		,	pieOuterRadius	= config.width * 0.35
		,	pieSpotRadius	= (pieOuterRadius + pieInnerRadius) * 0.53
		,	data = {}
		, 	label = ""
		;
	
	var paper = Raphael(config.x, config.y, config.width, config.height);
	
	paper.rect(0, 0, config.width, config.height).attr({fill: config.background, stroke: "none"});

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

	function drawSector(offset, percent, color, onAnimationEnd) {
		var startAngle = 180 * offset
		,   endAngle = 180 * (offset + percent)
		,   tipAngle = (startAngle + endAngle) / 2
		,   tipCenterX = pieCenterX - pieSpotRadius * Math.cosA(tipAngle)
		,   tipCenterY = pieCenterY - pieSpotRadius * Math.sinA(tipAngle)
		,   tipEndX = pieCenterX - 1.1 * pieOuterRadius * Math.cosA(tipAngle)
		,   tipEndY = pieCenterY - 1.1 * pieOuterRadius * Math.sinA(tipAngle)
		,	tipLineEndX = (tipAngle < 90 ? tipEndX - 30: tipEndX + 30)
		;
		
		if(DEBUG) {
			paper.circle(arcStartX, arcStartY, 3).attr({fill: "#0E0", stroke: "none"});
			paper.circle(arcEndX, arcEndY, 3).attr({fill: "#00E", stroke: "none"});
			paper.circle(pieCenterX, pieCenterY, pieOuterRadius).attr({stroke: "#fff"});
		}

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
			set.push(paper.text(tipLineEndX + (tipAngle < 90 ? 12 : -12), tipEndY - 10, percent * 100 + "%"));
		}

		var outerArc = paper.path()
							.attr({arc: [startAngle, startAngle, pieSpotRadius, pieOuterRadius]})
							.attr({fill: baseColor, stroke: "none"});

		var innerArc = paper.path()
							.attr({arc: [startAngle, startAngle, pieInnerRadius, pieSpotRadius]})
							.attr({fill: spotColor, stroke: "none"});
		
		var outerAnimation = Raphael.animation(
			{arc: [startAngle, endAngle, pieSpotRadius, pieOuterRadius]}, 1000, ">"
			, function(){
				onAnimationEnd();
				drawTip();
				set.push(this);
				this.mouseover(function() {
					set.stop().animate({transform: "s1.1 1.1 " + pieCenterX + " " + pieCenterY}, 500, "elastic");
				}).mouseout(function () {
		            set.stop().animate({transform: ""}, 500, "elastic");
		        });
		});
		
		outerArc.animate(outerAnimation);
		
		innerArc.animateWith(outerArc, outerAnimation,
			{arc: [startAngle, endAngle, pieInnerRadius, pieSpotRadius]}, 1000, ">"
			, function(){
				set.push(this);
				this.mouseover(function() {
					set.stop().animate({transform: "s1.1 1.1 " + pieCenterX + " " + pieCenterY}, 500, "elastic");
				}).mouseout(function () {
		            set.stop().animate({transform: ""}, 500, "elastic");
		        });
		});
	}

	function drawLegend(){
		var x = pieCenterX - pieOuterRadius
		,	y = pieCenterY + 20
		;
		paper.text(x, y, label.toUpperCase()).attr({font: "16px Arial", "font-weight": "bold", fill: "#000", "text-anchor": "start"});
		$(data).each(function(idx, obj){
			y += 20;
			var c = Raphael.rgb2hsb(config.colors[idx]);
			c.b *= 0.5;
			c = Raphael.hsb2rgb(c);
			var f = "315-" + c + "-" + config.colors[idx];
			paper.rect(x, y, 20, 10).attr({fill: f, stroke: "none"});
			paper.text(x + 50, y + 4, obj.title.toUpperCase());
		});
	}

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
				drawSector(pieOffset, percent, config.colors[idx], next);
				pieOffset += percent;
			});
		});
		if(config.endLoad) {
			config.endLoad();
		}
	});
	
	if(DEBUG) {
	 	paper.circle(pieCenterX, pieCenterY, 3).attr({fill: "#E00", stroke: "none"});
	 	paper.circle(pieCenterX - pieOuterRadius, pieCenterY, 3).attr({fill: "#E00", stroke: "none"});
	 	paper.circle(pieCenterX	+ pieOuterRadius, pieCenterY, 3).attr({fill: "#E00", stroke: "none"});
	 	paper.circle(pieCenterX, pieCenterY + pieOuterRadius, 3).attr({fill: "#E00", stroke: "none"});
	 	paper.circle(pieCenterX, pieCenterY - pieOuterRadius, 3).attr({fill: "#E00", stroke: "none"});
	}
	
	return paper;
};