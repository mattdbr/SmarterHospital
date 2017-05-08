$(function(){
	getSensorvalue();
});

function getSensorvalue() {
//Every one second, this function obtains sensor values from Arduino Yun and sends to Yun
//a request to turn LED on or off (depending on what radio button is pressed).
	
	var checked_option_radio = $('input[name=LEDCheck]:checked','#LED_Selection').val(); //Check what
	//radio button is pressed ("LED on" or "LED off")

	if (checked_option_radio =='off') //if the user selected for LED to be off, send request to Arduino
	{
		$('#LED_content').load('http://149.171.143.200/arduino/nolight');
		console.log('nolight');
	}
	
	if (checked_option_radio =='half') //if the user selected for LED to be off, send request to Arduino
	{
		$('#LED_content').load('http://149.171.143.200/arduino/halflight');
		console.log('halflight');
	}
	
	if (checked_option_radio =='on') //if the user selected for LED to be on, send request to Arduino
	{
		$('#LED_content').load('http://149.171.143.200/arduino/light/fulllight');
		console.log('fulllight');
	}

	$('#inBed').load('http://149.171.143.200/arduino/onbed');
	$('#heartrate').load('http://149.171.143.200/arduino/heartrate');
	
	
	setTimeout("getSensorvalue()", 2000); //Poll every one seconds. Lower = less real time but lower power consumption
}