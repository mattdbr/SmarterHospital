
$(document).ready(function(){
    // the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
    $('.modal').modal();
});

$(function(){
	//sliderInit();
	getSensorvalue();
	getTemp();
});

$('#light-submit').click(function(){
    changelight();
	//pushover();
	//pushbullet();
	//sendSMS();
	browserNotifications();
});

$('#temp-submit').click(function(){
    changetemp();
});

$('#pushbullet-submit').click(function(){
    addpushbullet();
});

$('#pushover-submit').click(function(){
    addpushover();
});

//$('#notifications').click(function(){
  //  browserNotifications();
//});

var ip_address = '149.171.143.209'; //global as we need to access it in a lot of places
var adjusting_temp = false;
var pushbulletaddresses = ['ujyMueYTCMKsjz1Wd4g64y'];
var pushoveraddresses = [];
var temp_mode = 3; // 1 = fan 2 = heat 3 = off. Used to prevent excessive API calls.

function changelight(){
	var value = $('.value').text(); // get value here
	$('#LED_content').load('http://' + ip_address + '/arduino/light/' + value);
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
	
	$('#inBed').load('http://'+ ip_address + '/arduino/onbed'); //TODO: If not in bed, set in red. API should return "in bed" or "not in bed"
	$('#heartrate').load('http://' + ip_address+ '/arduino/heartrate'); //TODO: If bad, set in red
	$('.lighting').load('http://' + ip_address+ '/arduino/lightstatus');
	
	var value = $('.validate').val(); // doctors input temperature
	var temp = $('.temperature').text(); //actual temperature
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
	
	if($('#heartrate').text < 20 || $('#heartrate').text > 220){
		pushbullet();
		pushover();
	}
	
	setTimeout("getSensorvalue()", delay); //Wait... Lower = less real time but lower power consumption. Tradeoff we've got to calculate. 
}

function getTemp() {
	$('.temperature').load('http://'+ ip_address + '/arduino/temp');
	setTimeout("getTemp()", 20000); //Wait... Lower = less real time but lower power consumption. Tradeoff we've got to calculate. 
}

function pushover(){
	var client1 = new PushoverJs('adz8d4pqpc468uyp4u87m85er8qgq7', 'Q3OrKkArcluCfdWYz5kYp8jJEZA9jD'); //api token then user token

	client1.createMessage()
	  .title('Patient has got up!')
	  .message('Patient has got up')
	  .url('http://www.mattydb.com/uni', 'Web Panel')
	  .highPriority()
	  .addCurrentTime()
	  .playSound(client1.sounds.pushover)
	  .send();

	setTimeout(function () {
	  console.log('pushover sent!');
	}, 4000);
}

function pushbullet(){
	PushBullet.APIKey = "o.kk9TUjrvpt4kJMhYtmJ2QIEnGCr1kq2c";
	for(var i = 0; i<pushbulletaddresses.length; i++){
		var res = PushBullet.push("note", pushbulletaddresses[i], null, {title: "Title", body: "Body"}); //todo: if this fails, remove loop and replace with device id 
	}

	console.log(res);
}

function addpushover(){
	var address = $('#pushoveraddress').val();
	pushoveraddresses.push(address);
}

function addpushbullet(){
	var address = $('#pushbulletaddress').val();
	pushbulletaddresses.push(address);
}

function browserNotifications() {
  if (Notification.permission !== "granted")
    Notification.requestPermission();
  else {
    var notification = new Notification('G1Health Web Panel', {
      icon: 'img/g1health.png',
      body: "Doctor's Attention Needed!",
    });

    notification.onclick = function () {
      window.open("http://stackoverflow.com/a/13328397/1269037");      
    };

  }

}

function sendSMS(){ //working - perhaps paramatise SMS number and/or message
	$.get("https://rest.nexmo.com/sms/json?api_key=7564b86f&api_secret=d95e62acfc5bc072&to=61402565010&from=G1Health&text=Alert:+Patient+Needs+Attention");
}

