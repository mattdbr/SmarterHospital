// NB: I have stripped all personal keys out of this as the processing is done clientside
// To get functional, add your keys and secrets - SEARCH INSERTKEYHERE and INSERTSECRETHERE

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
	pushover();
	pushbullet();
	//sendSMS();
	browserNotifications();
});

$('#temp-submit').click(function(){
    changetemp();
});

$('#temp-off').click(function(){
    tempoff();
});

$('#pushbullet-submit').click(function(){
    addpushbullet();
});

$('#pushover-submit').click(function(){
    addpushover();
});

$('#phone-submit').click(function(){
    addphone();
});

//$('#notifications').click(function(){
  //  browserNotifications();
//});

$('#alarm-submit').click(function(){
	alarm();
});

var ip_address = '149.171.143.227'; //global as we need to access it in a lot of places
var adjusting_temp = false;
var pushbulletaddresses = []; // Add an address here if you want one pre-entered
var pushoveraddresses = []; //Add an address here if you want one pre-entered
var phonenumbers = []; //Add phone number here if you want one pre-entered
var temp_mode = 3; // 1 = fan 2 = heat 3 = off. Used to prevent excessive API calls.
var adjusting_temp = false;
var value;
var temp;
var buttonstatus;


function changelight(){
	var value = $('.value').text(); // get value here
	$('#LED_content').load('http://' + ip_address + '/arduino/light/' + value);
}

function changetemp(){	
	adjusting_temp = true; 	
}

function getSensorvalue() {
//Every one second, this function obtains sensor values from Arduino Yun and sends to Yun
//a request to turn LED on or off (depending on what radio button is pressed).
	var delay = 8000; // change to affect poll interval
	
	$('#inBed').load('http://'+ ip_address + '/arduino/onbed');
	$('#heartrate').load('http://' + ip_address+ '/arduino/heartrate');
	$('.lighting').load('http://' + ip_address+ '/arduino/lightstatus');
	$('.occupancy').load('http://' + ip_address+ '/arduino/occupancy');
	$('#pushbutton').load('http://' + ip_address+ '/arduino/button');
	buttonstatus = $('#pushbutton').text(); // doctors input temperature
	if(buttonstatus == "1"){
		alarm();
		alert("Patient Triggered Alarm!");
	}
	value = $('.validate').val(); // doctors input temperature
	temp = parseInt($('.temperature').text()); //actual temperature
	if(adjusting_temp){
		if(temp > value + 1 && temp_mode != 1){
			temp_mode = 1;
			$('#action').load('http://' + ip_address + '/arduino/fan/' + '255');
		}else if(temp < value - 1 && temp_mode != 2){
			temp_mode = 2;
			$('#action').load('http://' + ip_address + '/arduino/heat');
		}else if((temp < value + 1 && temp > value - 1) && temp_mode != 3){
			$('#action').load('http://' + ip_address + '/arduino/off');
			temp_mode = 3;
			adjusting_temp = false;
		}
	}
	
	$('.temperature').text();
	
	if($('#heartrate').text < 20 || $('#heartrate').text > 220){
		pushbullet("heart");
		pushover("heart");
		sendSMS("heart");
	}
	
	setTimeout("getSensorvalue()", delay); //Wait... Lower = less real time but lower power consumption. Tradeoff we've got to calculate. 
}

function getTemp() {
	$('.temperature').load('http://'+ ip_address + '/arduino/temp');
	setTimeout("getTemp()", 20000); //Wait... Lower = less real time but lower power consumption. Tradeoff we've got to calculate. 
}

function addpushover(){
	var address = $('#pushoveraddress').val();
	pushoveraddresses.push(address);
}

function addpushbullet(){
	var address = $('#pushbulletaddress').val();
	pushbulletaddresses.push(address);
}

function addphone(){
	var address = $('#phonenumber').val();
	phonenumbers.push(address);
}

function browserNotifications(message) {
  if (Notification.permission !== "granted")
    Notification.requestPermission();
  else {
	if(message == "heart"){
		var notification = new Notification('G1Health Web Panel', {
		icon: 'img/g1health.png',
		body: "Patient's heart rate is critical",
		});
	}else if(message == "alarm"){
		var notification = new Notification('G1Health Web Panel', {
		icon: 'img/g1health.png',
		body: 'An alarm has been triggered',
		});
	}

    notification.onclick = function () {
      window.open("file:///C:/Users/akkat/Documents/workspace/SmarterHospital/webpanel/index.html");      
    };
  }
}

function pushbullet(message){
	PushBullet.APIKey = "INSERTKEYHERE";
	if(message=="heart"){
		for(var i = 0; i<pushbulletaddresses.length; i++){
			var res = PushBullet.push("note", pushbulletaddresses[i], null, {title: "G1Health Notifications", body: "Patient's heartrate is critical"}); //todo: if this fails, remove loop and replace with device id 
		}
	}else if(message=="alarm"){
		for(var i = 0; i<pushbulletaddresses.length; i++){
			var res = PushBullet.push("note", pushbulletaddresses[i], null, {title: "G1Health Notifications", body: "An alarm has been triggered!"}); //todo: if this fails, remove loop and replace with device id 
		}
	}

	console.log(res);
}

function sendSMS(message){ //working - perhaps paramatise SMS number and/or message
	if(message == "alarm"){
		for(var i =0; i<phonenumbers.length; i++){
			$.get("https://rest.nexmo.com/sms/json?api_key=[INSERTKEYHERE]&api_secret=[INSERTSECRETHERE]&to=" + phonenumbers[i] + "&from=G1Health&text=Alarm+Triggered!");
		}
	}else if(message == "heart"){
		for(var i =0; i<phonenumbers.length; i++){
			$.get("https://rest.nexmo.com/sms/json?api_key=[INSERTKEYHERE]&api_secret=[INSERTSECRETHERE]&to=" + phonenumbers[i] + "&from=G1Health&text=Alert:+Patient+in+critical+status!");
		}
	}
}

function pushover(message){
	if(message=="heart"){
		for(var i = 0; i < pushoveraddresses.length; i++){
			var client1 = new PushoverJs('INSERTKEYHERE', pushoveraddresses[i]); //api token then user token

			client1.createMessage()
			  .title("G1Health Notifications")
			  .message("Patient's Heart rate is critical!")
			  .url('http://www.mattydb.com/uni', 'Web Panel')
			  .highPriority()
			  .addCurrentTime()
			  .playSound(client1.sounds.pushover)
			  .send();

			setTimeout(function () {
			  console.log('pushover sent!');
			}, 4000);
		}
	}else if(message=="alarm"){
		for(var i = 0; i < pushoveraddresses.length; i++){
			var client1 = new PushoverJs('INSERTKEYHERE', pushoveraddresses[i]); //api token then user token

			client1.createMessage()
			  .title("G1Health Notifications")
			  .message("An alarm has been triggered!")
			  .url('http://www.mattydb.com/uni', 'Web Panel')
			  .highPriority()
			  .addCurrentTime()
			  .playSound(client1.sounds.pushover)
			  .send();

			setTimeout(function () {
			  console.log('pushover sent!');
			}, 4000);
		}
	}
}

function alarm(){
	//sendSMS("alarm");
	pushover("alarm");
	pushbullet("alarm");
	browserNotifications("alarm");
	$.get("http://" + ip_address + "/arduino/alarm");
}

function tempoff(){
	$('#action').load('http://' + ip_address + '/arduino/off');
}

function clock() {// We create a new Date object and assign it to a variable called "time".
var time = new Date(),
    
    // Access the "getHours" method on the Date object with the dot accessor.
    hours = time.getHours(),
    
    // Access the "getMinutes" method with the dot accessor.
    minutes = time.getMinutes(),
    
    
    seconds = time.getSeconds();

document.querySelectorAll('.clock')[0].innerHTML = harold(hours) + ":" + harold(minutes) + ":" + harold(seconds);
  
  function harold(standIn) {
    if (standIn < 10) {
      standIn = '0' + standIn
    }
    return standIn;
  }
}
setInterval(clock, 1000);