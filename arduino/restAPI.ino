#include <Bridge.h>
#include <BridgeServer.h>
#include <BridgeClient.h>

// Listen on default port 5555, the webserver on the Yún
// will forward there all the HTTP requests for us.
BridgeServer server;
String startString;
long hits = 0;
void motoron(BridgeClient client);
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
    }else if (command == "heartrate"){
	  heartRate(client);
	}
	
	/*   Lighting api should be url/light/value ? 
	else if (command == "light"){
      light(client);
    }
	
	*/

    // Close connection and free resources.
    client.stop();
    hits++;
  }

  delay(50); // Poll every 50ms
}

void onBed(BridgeClient client){
  //is patient on bed?

}
void heartRate(BridgeClient client){
}

void light(BridgeClient client){
	value = client.parseInt();
    digitalWrite(12, value);
}
