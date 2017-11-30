function rotate(box, newContent, direction){
	
	$(box).animate({
		borderSpacing: 90
	}, {
		step: function(now, fx){
			$(box).css('-ms-transform', 'rotate3d(1,1,0,'+now+'deg)');
			$(box).css('-webkit-transform', 'rotate3d(1,1,0,'+now+'deg)');
			$(box).css('transform', 'rotate3d(1,1,0,'+now+'deg)');
		}
	}, 1500)
	.promise().done(function(){
		$($(box).find("*")).replaceWith(newContent);
		$(box).animate({
			borderSpacing: 180
		}, {
			step: function(now, fx){
				$(box).css('-ms-transform', 'rotate3d(1,1,0,'+now+'deg)');
				$(box).css('-webkit-transform', 'rotate3d(1,1,0,'+now+'deg)');
				$(box).css('transform', 'rotate3d(1,1,0,'+now+'deg)');
			}
		}, 1500)
		.promise().done(function(){
			$(box).css('-ms-transform', 'rotate3d(1,1,0,0deg)');
			$(box).css('-webkit-transform', 'rotate3d(1,1,0,0deg)');
			$(box).css('transform', 'rotate3d(1,1,0,0deg)');
		});
	})
	
		
}

