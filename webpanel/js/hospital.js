
$(document).ready(function(){
    // the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
    $('.modal').modal();
});

$(function(){
	//sliderInit();
	getSensorvalue();
});

$('#light-submit').click(function(){
    changelight();
});

$('#temp-submit').click(function(){
    changetemp();
});

var ip_address = '149.171.143.197'; //global as we need to access it in a lot of places
var adjusting_temp = false;
var temp_mode = 3; // 1 = fan 2 = heat 3 = off. Used to prevent excessive API calls.

function changelight(){
	var value = $('.value').text(); // get value here
	$('#LED_content').load('http://' + ip_address + '/arduino/light/' + value);
	console.log(ip_address);
}

function changetemp(){	
	adjusting_temp = true;
	console.log(value);
}


/*function sliderInit() {
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
}*/

function getSensorvalue() {
//Every one second, this function obtains sensor values from Arduino Yun and sends to Yun
//a request to turn LED on or off (depending on what radio button is pressed).
	var delay = 5000; // change to affect poll interval
	
	$('.temperature').load('http://'+ ip_address + '/arduino/temperature');
	$('#inBed').load('http://'+ ip_address + '/arduino/onbed'); //TODO: If not in bed, set in red. API should return "in bed" or "not in bed"
	$('#heartrate').load('http://' + ip_address+ '/arduino/heartrate'); //TODO: If bad, set in red
	
	var value = $('.validate').text(); // get value here
	var temp = $('.temperature').text();
	if(adjusting_temp){
		if(temp > value + 1 && temp_mode != 1){
			temp_mode = 1;
			$('#action').load('http://' + ip_address + '/arduino/fan' + value);
		}else if(temp < value - 1 && temp_mode != 2){
			temp_mode = 2;
			$('#action').load('http://' + ip_address + '/arduino/heat');
		}else if(temp_mode != 3){
			$('#action').load('http://' + ip_address + '/arduino/off');
			temp_mode = 3;
			adjusting_temp = false;
		}
	}
	
	setTimeout("getSensorvalue()", delay); //Wait... Lower = less real time but lower power consumption. Tradeoff we've got to calculate. 
}



