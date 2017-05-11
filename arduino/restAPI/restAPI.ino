#include <Bridge.h>
#include <BridgeServer.h>
#include <BridgeClient.h>

// Listen on default port 5555, the webserver on the Yún
// will forward there all the HTTP requests for us.
BridgeServer server;
String startString;
long hits = 0;
int lightpin = 6;

int fsrPin = A1;     // the FSR and 10K pulldown are connected to a0 
int fsrthreshold = 800;

void onBed(BridgeClient client);
void heartRate(BridgeClient client);


void setup() {
  SerialUSB.begin(9600);

  // Bridge startup
  pinMode(13, OUTPUT);
  digitalWrite(13, LOW);
  Bridge.begin();
  digitalWrite(13, HIGH);

  //for lights
  pinMode(light, OUTPUT);

  //for FSR

  
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
  	if (command == "light"){
      light(client);
  	}
  }

    delay(50); // Poll every 50ms
}

void onBed(BridgeClient client){ //TODO: Josh
  int fsrReading = analogRead(fsrPin);  
 
  //Serial.print("Analog reading = ");
  //Serial.print(fsrReading);     // the raw analog reading
 
  // We'll have a few threshholds, qualitatively determined
  if (fsrReading < fsrthreshold) {
    Serial.println("Patient is NOT on bed");
  } else {
    Serial.println("Patient is on bed");
  }
  delay(1000);

}
void heartRate(BridgeClient client){ //TODO: Isheeta
	//heartrate calcs
}

void light(BridgeClient client){
  int value = client.parseInt();
  analogWrite(lightpin, value);
}
