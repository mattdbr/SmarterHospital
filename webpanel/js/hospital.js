$(function(){
	sliderInit();
	getSensorvalue();
});

$('#submit').click(function(){
    changelight();
});

function changelight(){
	var ip_address = '149.171.143.150';		
	var value = $('.range-slider__value').text(); // get value here
	$('#LED_content').load('http://' + ip_address + '/arduino/light/' + value);
	console.log(value); //to test slider is working - TODO: Find way to only send if submit is pressed
}


function sliderInit() {
	var slider = $('.range-slider'),
		range = $('.range-slider__range'),
		value = $('.range-slider__value');
	
		slider.each(function(){
		value.each(function(){
		var value = $(this).prev().attr('value');
		$(this).html(value);
		});

			range.on('input', function(){
				$(this).next(value).html(this.value);
			});
		});
}

function getSensorvalue() {
//Every one second, this function obtains sensor values from Arduino Yun and sends to Yun
//a request to turn LED on or off (depending on what radio button is pressed).
	var ip_address = '149.171.143.150'; // store IP as a variable to change once on the day
	var delay = 5000; // change to affect poll interval
	
	var checked_option_radio = $('input[name=LEDCheck]:checked','#LED_Selection').attr('id'); 
	//Get the id of the checked radio button

	if (checked_option_radio =='off') //if the user selected for LED to be off, send request to Arduino
	{
		$('#LED_content').load('http://' + ip_address + '/arduino/nolight');
		console.log('nolight'); //for testing
	}
	
	if (checked_option_radio =='half') //if the user selected for LED to be off, send request to Arduino
	{
		$('#LED_content').load('http://' + ip_address + '/arduino/halflight');
		console.log('halflight'); //for testing
	}
	
	if (checked_option_radio =='on') //if the user selected for LED to be on, send request to Arduino
	{
		$('#LED_content').load('http://' + ip_address + '/arduino/light/fulllight');
		console.log('fulllight'); //for testing
	}

	$('#inBed').load('http://'+ ip_address + '/arduino/onbed'); //TODO: If not in bed, set in red. API should return "in bed" or "not in bed"
	$('#heartrate').load('http://' + ip_address+ '/arduino/heartrate'); //TODO: If bad, set in red
	
	setTimeout("getSensorvalue()", delay); //Wait... Lower = less real time but lower power consumption. Tradeoff we've got to calculate. 
}



