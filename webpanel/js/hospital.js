$(function() {
	getSensorvalue();
});

function getSensorvalue() {
//Every one second, this function obtains sensor values from Arduino Yun and sends to Yun
//a request to turn LED on or off (depending on what radio button is pressed).

	var checked_option_radio = $('input[name=LEDCheck]:checked','#LED_Selection').val(); //Check what
	//radio button is pressed ("LED on" or "LED off")

	if (checked_option_radio =='off') //if the user selected for LED to be off, send request to Arduino
	{
		$('#LED_content').load('/arduino/light/0');
	}
	
	if (checked_option_radio =='half') //if the user selected for LED to be off, send request to Arduino
	{
		$('#LED_content').load('/arduino/light/122');
	}
	
	if (checked_option_radio =='on') //if the user selected for LED to be on, send request to Arduino
	{
		$('#LED_content').load('/arduino/light/255');
	}

	$('#inBed').load('/arduino/onbed);
	$('#heartrate').load('/arduino/heartrate);
	
	setTimeout("getSensorvalue()",1000); //Poll every one seconds.
}