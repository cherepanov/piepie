var DEBUG = false;

Math.RAD = Math.PI / 180;

Math.cosA = function(angle) {
	return Math.cos(angle * Math.RAD);
};

Math.sinA = function(angle) {
	return Math.sin(angle * Math.RAD);
};

var PiePie = function(config) {
	
	PiePie.VERTICAL = 1;
	PiePie.HORIZONTAL = 2;

	//TODO: validate config and data with schema

	var 	pieCenterX 		= config.width / 2
		,	pieCenterY 		= config.height / 2
		,	pieInnerRadius	= config.width / 7
		,	pieOuterRadius	= config.width / 4
		,	pieSpotRadius	= (pieOuterRadius + pieInnerRadius) / 2
		,	data = {}
		, 	label = ""
		;
	
	var paper = Raphael(config.x, config.y, config.width, config.height);
	
	paper.rect(0, 0, config["width"], config["height"]).attr({fill: config.background, stroke: "none"});

	paper.customAttributes.arc = function (startX, startY, endX, endY, radius) {
        var p = [
          "M", startX, startY,
          "A", radius, radius, 0, 0, 1, endX, endY
        ];
		return {path: p};
	};

	function drawSector(offset, percent, color, onAnimationEnd) {
		var startAngle = 180 * offset
		,   endAngle = 180 * (offset + percent)
		,   tipAngle = (startAngle + endAngle) / 2
		,   tipCenterX = pieCenterX - pieSpotRadius * Math.cosA(tipAngle)
		,   tipCenterY = pieCenterY - pieSpotRadius * Math.sinA(tipAngle)
		,   tipEndX = pieCenterX - 1.2 * pieOuterRadius * Math.cosA(tipAngle)
		,   tipEndY = pieCenterY - 1.2 * pieOuterRadius * Math.sinA(tipAngle)
		,	tipLineEndX = (tipAngle < 90 ? tipEndX - 30: tipEndX + 30)
		,	pieOuterStrokeWidth = pieOuterRadius - pieSpotRadius
		,	pieInnerStrokeWidth = pieSpotRadius - pieInnerRadius
		,	arcStartX	= pieCenterX - (pieOuterRadius - pieOuterStrokeWidth / 2) * Math.cosA(startAngle)
		,	arcStartY 	= pieCenterY - (pieOuterRadius - pieOuterStrokeWidth / 2) * Math.sinA(startAngle)
		,	arcEndX 	= pieCenterX - (pieOuterRadius - pieOuterStrokeWidth / 2) * Math.cosA(endAngle)
		,	arcEndY 	= pieCenterY - (pieOuterRadius - pieOuterStrokeWidth / 2) * Math.sinA(endAngle)
		,	arcInnerStartX	= pieCenterX - (pieInnerRadius + pieInnerStrokeWidth / 2) * Math.cosA(startAngle)
		,	arcInnerStartY 	= pieCenterY - (pieInnerRadius + pieInnerStrokeWidth / 2) * Math.sinA(startAngle)
		,	arcInnerEndX 	= pieCenterX - (pieInnerRadius + pieInnerStrokeWidth / 2) * Math.cosA(endAngle)
		,	arcInnerEndY 	= pieCenterY - (pieInnerRadius + pieInnerStrokeWidth / 2) * Math.sinA(endAngle)
		;
		
		if(DEBUG) {
			paper.circle(arcStartX, arcStartY, 3).attr({fill: "#0E0", stroke: "none"});
			paper.circle(arcEndX, arcEndY, 3).attr({fill: "#00E", stroke: "none"});
			paper.circle(pieCenterX, pieCenterY, pieOuterRadius).attr({stroke: "#fff"});
		}

		var baseColor = Raphael.rgb2hsb(color)
		,	spotColor = $.extend(baseColor);
		;
		spotColor.b *= 0.75;
		
		var set = paper.set();

		function drawTip(){
			set.push(paper.circle(tipCenterX, tipCenterY, 3).attr({fill: "#000", stroke: "none"}));
			set.push(paper.path([
	            "M", tipCenterX, tipCenterY,
	            "L", tipEndX, tipEndY,
	            "L", tipLineEndX, tipEndY
	        ]));
			set.push(paper.text(tipLineEndX, tipEndY - 10, percent));
		}

		paper.path()
			.attr({arc: [arcStartX, arcStartY, arcStartX, arcStartY, pieOuterRadius]})
			.attr({stroke: baseColor, "stroke-width": pieOuterStrokeWidth})
			.animate(
					{arc: [arcStartX, arcStartY, arcEndX, arcEndY, pieOuterRadius]}
					, 1000, ">", function(){
						onAnimationEnd();
						drawTip();
						set.push(this);
						set.mouseover(function() {
							set.stop().animate({transform: "s1.1 1.1 " + pieCenterX + " " + pieCenterY}, 500, "elastic");
						}).mouseout(function () {
				            set.stop().animate({transform: ""}, 500, "elastic");
				        });
					});		
	}

	function drawLegend(){
		var x = pieCenterX - pieOuterRadius
		,	y = pieCenterY * 1.2
		;
		paper.text(x, y, label.toUpperCase()).attr({font: "16px Arial", fill: "#000", "text-anchor": "start"});
		$(data).each(function(idx, obj){
			y += 20;
			paper.rect(x, y, 20, 10).attr({fill: config.colors[idx], stroke: "none"});
			paper.text(x + 50, y + 4, obj.title.toUpperCase());
		});
		console.log(x);
	}

	$.getJSON("piepie.json", function(res){
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
				console.debug(pieOffset);	
			});
		});
	});
	
	if(DEBUG) {
	 	paper.circle(pieCenterX, pieCenterY, 3).attr({fill: "#E00", stroke: "none"});
	 	paper.circle(pieCenterX - pieOuterRadius, pieCenterY, 3).attr({fill: "#E00", stroke: "none"});
	 	paper.circle(pieCenterX	+ pieOuterRadius, pieCenterY, 3).attr({fill: "#E00", stroke: "none"});
	 	paper.circle(pieCenterX, pieCenterY + pieOuterRadius, 3).attr({fill: "#E00", stroke: "none"});
	 	paper.circle(pieCenterX, pieCenterY - pieOuterRadius, 3).attr({fill: "#E00", stroke: "none"});
	}
	
};