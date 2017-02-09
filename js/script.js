window.onscroll = function(){
	var currentScrollPos = $(document).scrollTop();
	var height = "innerHeight" in window ? window.innerHeight: document.documentElement.offsetHeight; 
	if(currentScrollPos < height - 80){
		$(".menu").removeClass('fixed');
	}else{
		$(".menu").addClass('fixed');
	}
}