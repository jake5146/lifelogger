// javascript for main.html
$(document).ready(function() {
	$(".click-btn").click(loginBlockOn);

    $("img[alt='clear']").click(loginBlockOff);

    $(document).click(offWhenOutsideClicked);
});

function offWhenOutsideClicked(e) {
	var $loginBlock = $(".login-block");
    var $clickBtn = $(".click-btn");
 
    if (!$loginBlock.is(e.target) && $loginBlock.has(e.target).length === 0 && 
    	!$clickBtn.is(e.target)) {
		loginBlockOff();
	}
}

function loginBlockOn() {
	var blurBG = {'-webkit-filter': 'blur(5px)', 'filter': 'blur(5px)'};
	$(".main").css(blurBG);
	$(".click-here").css(blurBG);
	$(".login-block").show();
}

function loginBlockOff() {
	var unBlurBG = {'-webkit-filter': 'none', 'filter': 'none'};
	$(".main").css(unBlurBG);
	$(".click-here").css(unBlurBG);
	$(".login-block").hide();
}