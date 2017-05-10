#include <Bridge.h>
#include <BridgeServer.h>
#include <BridgeClient.h>

// Listen on default port 5555, the webserver on the Yún
// will forward there all the HTTP requests for us.
BridgeServer server;
String startString;
long hits = 0;
void onBed(BridgeClient client);
void heartRate(BridgeClient client);
void setup() {
  SerialUSB.begin(9600);

  // Bridge startup
  pinMode(13, OUTPUT);
  digitalWrite(13, LOW);
  Bridge.begin();
  digitalWrite(13, HIGH);

  pinMode(6, OUTPUT);
  // Listen for incoming connection only from localhost
  // (no one from the external network could connect)
  server.listenOnLocalhost();
  server.begin();
}

void loop() {
  // Get clients coming from server
  BridgeClient client = server.accept();

  // There is a new client?
  if (client) {
    // read the command
    String command = client.readStringUntil('/');
    command.trim();        //kill whitespace
    SerialUSB.println(command);
    // is "temperature" command?
    if (command == "onbed") {
      onBed(client);
    }
	if (command == "heartrate"){
	  heartRate(client);
	}
	
	/*   Lighting api should be url/light/value ? TODO: Matt */
	if (command == "nolight"){
		analogWrite(11, 0);
	}
	if (command == "halflight"){
      analogWrite(11, 120);
    }
	if (command == "fulllight"){
		analogWrite(11, 255);
	}

    // Close connection and free resources.
    client.stop();
    hits++;
  }

  delay(50); // Poll every 50ms
}

void onBed(BridgeClient client){ //TODO: Josh
  //is patient on bed? 4.9V --> 100N
  int value = analogRead(A1);
  float voltage = value*(5.0/1023.0);
  if (voltage > 4.9){
	  client.print(F("Bed occupied"));
    client.print(voltage);
  }else{
	  client.print(F("Bed not occupied")); //This result can be inserted directly into webpage
    client.print(voltage);
  }

}
void heartRate(BridgeClient client){ //TODO: Isheeta
	//heartrate calcs
}

