#include <Bridge.h>
#include <BridgeServer.h>
#include <BridgeClient.h>

// Listen on default port 5555, the webserver on the Yún
// will forward there all the HTTP requests for us.
BridgeServer server;
String startString;
long hits = 0;
//int lightpin = 6;

//  Variables
// These constants won't change.  They're used to give names
// to the pins used:
const int sensorInPin = A1; 
const int sensorOutPin = A6;

int Sensorin = 0;        // value read from the sensor inside room
int Sensorout = 0;        //value read from sensor outside room
int startinglightin = analogRead(sensorInPin);        //starting light level of sensorin
int startinglightout = analogRead(sensorOutPin);      //starting light level of sensorout
int occupant = 1;
int pulsePin = A0;                 // Pulse Sensor purple wire connected to analog pin 0
int fsrPin = A2;                   // the FSR and 10K pulldown are connected to a0
int alarmPin = 3;
int tempPin = A3;
int lightSensor = A4;
int buttonPin = A5;
int ledPin = 6;                   //for lights
int fanPin = 11;
int heatPin = 12;
int fsrthreshold = 5;
int fsrReading;
int value;
int ispressed = 0; 

  
// Volatile Variables, used in the interrupt service routine!
volatile int BPM;                   // int that holds raw Analog in 0. updated every 2mS
volatile int Signal;                // holds the incoming raw data
volatile int IBI = 600;             // int that holds the time interval between beats! Must be seeded!
volatile boolean Pulse = false;     // "True" when User's live heartbeat is detected. "False" when not a "live beat".
volatile boolean QS = false;        // becomes true when Arduoino finds a beat.

//Variables for interrupt function
volatile int rate[10];                    // array to hold last ten IBI values
volatile unsigned long sampleCounter = 0;          // used to determine pulse timing
volatile unsigned long lastBeatTime = 0;           // used to find IBI
volatile int P = 512;                     // used to find peak in pulse wave, seeded
volatile int T = 512;                    // used to find trough in pulse wave, seeded
volatile int thresh = 500;                // used to find instant moment of heart beat, seeded
volatile int amp = 0;                   // used to hold amplitude of pulse waveform, seeded
volatile boolean firstBeat = true;        // used to seed rate array so we startup with reasonable BPM
volatile boolean secondBeat = false;      // used to seed rate array so we startup with reasonable BPM
volatile int lastBPM = 0;

void onBed(BridgeClient client);
void heartRate(BridgeClient client);


void setup() {
  SerialUSB.begin(9600);
  Bridge.begin();

  // Bridge startup
  pinMode(13, OUTPUT);
  pinMode(fanPin, OUTPUT);
  pinMode(heatPin, OUTPUT);
  pinMode(alarmPin, OUTPUT);
  digitalWrite(13, LOW);
  digitalWrite(13, HIGH);

  //for lights
  pinMode(light, OUTPUT);

  //for FSR

  //for Heartrate

  interruptSetup();                 // sets up to read Pulse Sensor signal every 2mS
  // IF YOU ARE POWERING The Pulse Sensor AT VOLTAGE LESS THAN THE BOARD VOLTAGE,
  // UN-COMMENT THE NEXT LINE AND APPLY THAT VOLTAGE TO THE A-REF PIN
  //   analogReference(EXTERNAL);


  // Listen for incoming connection only from localhost
  // (no one from the external network could connect)
  server.listenOnLocalhost();
  server.begin();
}

void interruptSetup() { // CHECK OUT THE Timer_Interrupt_Notes TAB FOR MORE ON INTERRUPTS
  // Initializes Timer2 to throw an interrupt every 2mS.

  TCCR1A = 0x00; //for ATmega32u4 - yun
  TCCR1B = 0x0C;
  OCR1A = 0x7C;
  TIMSK1 = 0x02;
  sei();
}

ISR(TIMER1_COMPA_vect) {                        // triggered when Timer2 counts to 124
  cli();                                      // disable interrupts while we do this
  Signal = analogRead(pulsePin);              // read the Pulse Sensor
  sampleCounter += 2;                         // keep track of the time in mS with this variable
  int N = sampleCounter - lastBeatTime;       // monitor the time since the last beat to avoid noise

  //  find the peak and trough of the pulse wave
  if (Signal < thresh && N > (IBI / 5) * 3) { // avoid dichrotic noise by waiting 3/5 of last IBI
    if (Signal < T) {                       // T is the trough
      T = Signal;                         // keep track of lowest point in pulse wave
    }
  }

  if (Signal > thresh && Signal > P) {        // thresh condition helps avoid noise
    P = Signal;                             // P is the peak
  }                                        // keep track of highest point in pulse wave

  //  NOW IT'S TIME TO LOOK FOR THE HEART BEAT
  // signal surges up in value every time there is a pulse
  if (N > 250) {                                  // avoid high frequency noise
    if ( (Signal > thresh) && (Pulse == false) && (N > (IBI / 5) * 3) ) {
      Pulse = true;                               // set the Pulse flag when we think there is a pulse
      //digitalWrite(blinkPin,HIGH);                // turn on pin 13 LED
      IBI = sampleCounter - lastBeatTime;         // measure time between beats in mS
      lastBeatTime = sampleCounter;               // keep track of time for next pulse

      if (secondBeat) {                      // if this is the second beat, if secondBeat == TRUE
        secondBeat = false;                  // clear secondBeat flag
        for (int i = 0; i <= 9; i++) {       // seed the running total to get a realisitic BPM at startup
          rate[i] = IBI;
        }
      }

      if (firstBeat) {                       // if it's the first time we found a beat, if firstBeat == TRUE
        firstBeat = false;                   // clear firstBeat flag
        secondBeat = true;                   // set the second beat flag
        sei();                               // enable interrupts again
        return;                              // IBI value is unreliable so discard it
      }


      // keep a running total of the last 10 IBI values
      word runningTotal = 0;                  // clear the runningTotal variable

      for (int i = 0; i <= 8; i++) {          // shift data in the rate array
        rate[i] = rate[i + 1];                // and drop the oldest IBI value
        runningTotal += rate[i];              // add up the 9 oldest IBI values
      }

      rate[9] = IBI;                          // add the latest IBI to the rate array
      runningTotal += rate[9];                // add the latest IBI to runningTotal
      runningTotal /= 10;                     // average the last 10 IBI values
      BPM = 60000 / runningTotal;             // how many beats can fit into a minute? that's BPM!
      QS = true;                              // set Quantified Self flag
      // QS FLAG IS NOT CLEARED INSIDE THIS ISR
      if (QS == true) { //technically not needed since set true above
        lastBPM = BPM;
        QS = false;
      }
    }
  }

  if (Signal < thresh && Pulse == true) {  // when the values are going down, the beat is over
    Pulse = false;                         // reset the Pulse flag so we can do it again
    amp = P - T;                           // get amplitude of the pulse wave
    thresh = amp / 2 + T;                  // set thresh at 50% of the amplitude
    P = thresh;                            // reset these for next time
    T = thresh;
  }

  if (N > 2500) {                          // if 2.5 seconds go by without a beat
    thresh = 500;                          // set thresh default
    P = 512;                               // set P default
    T = 512;                               // set T default
    lastBeatTime = sampleCounter;          // bring the lastBeatTime up to date
    firstBeat = true;                      // set these to avoid noise
    secondBeat = false;                    // when we get the heartbeat back
  }

  sei();                                   // enable interrupts when youre done!
}// end isr


void loop() {
  // Get clients coming from server
  BridgeClient client = server.accept();
  // There is a new client?
  if (client) {
    // read the command
    String command = client.readStringUntil('/');
    command.trim();        //kill whitespace
  //client.println("Access-Control-Allow-Origin: *"); 
    SerialUSB.println(command);
    // is "temperature" command?
    if (command == "onbed") {
      onBed(client);
    }
  if (command == "heartrate") {
      heartRate(client);
    }
  if (command == "light") {    //Lighting api should be url/light/value 
      light(client);
    }
  if (command == "fan"){
      cooling(client);
    }
  if (command == "heat"){
      heating(client);
    }
  if (command == "off"){
      turnTempOff(client);
    }
  if (command == "temp"){
      currentTemp(client);
    }
  if (command == "lightstatus"){
     readLight(client);
  }
  if (command == "alarm"){
     alarm(client);
  }
  if (command == "button"){
    pushButton(client);  
  }
  if (command == "occupancy"){
    levels(client);
  }
    client.stop();
  }
  Sensorin = analogRead(sensorInPin);
  Sensorout = analogRead(sensorOutPin);
  if (Sensorout < startinglightout) {
    if (Sensorin < startinglightin) {
      occupant++;
    }
  }
  if (Sensorin < startinglightin) {
    if (Sensorout < startinglightout) {
      occupant--;
    }
  }
  delay(50); // Poll every 50ms
}

void onBed(BridgeClient client) { //TODO: Josh
  fsrReading = analogRead(fsrPin);
  // for testing client.print(fsrReading);

  //Serial.print("Analog reading = ");
  //Serial.print(fsrReading);     // the raw analog reading

  // We'll have a few threshholds, qualitatively determined
  if (fsrReading < fsrthreshold) {
    client.print("Patient is NOT on bed");
  } else {
    client.print("Patient is on bed");
  }
  delay(1000);

}
void heartRate(BridgeClient client) { //TODO: Isheeta
  if(lastBPM > 170){
    client.print(0);
  }else{
    client.print(lastBPM); 
  }  
  delay(1000);
}

void light(BridgeClient client) {
  int value = client.parseInt();
  /* for the torch
  analogWrite(lightpin, value);
  analogWrite(lightpin, 0);
  analogWrite(lightpin, 120);
  analogWrite(lightpin, 0);
  analogWrite(lightpin, 120);
  analogWrite(lightpin, 0);
  analogWrite(lightpin, value);*/
  //playing it safe
  analogWrite(ledPin, value);
  delay(1000);
  Sensorin = analogRead(sensorInPin);
  Sensorout = analogRead(sensorOutPin);
}

void cooling(BridgeClient client){
    int reading = client.parseInt();
    digitalWrite(heatPin, LOW);
    analogWrite(fanPin, reading);
    client.print(F("Fan on"));
}

void heating(BridgeClient client){
    analogWrite(fanPin, 0);
    digitalWrite(heatPin, HIGH);
    client.print(F("Heater on"));
}

void currentTemp(BridgeClient client){
  int sensorValue = analogRead(tempPin);
  float voltage = sensorValue * (5000.0f / 1024.0f);
  float temperature = (voltage - 500.0f) / 10.0f;
  
  client.print(temperature); 
}

void turnTempOff(BridgeClient client){  
   analogWrite(fanPin, 0);
   digitalWrite(heatPin, LOW);
   client.print("Nothing on"); 
}

void readLight(BridgeClient client){
  float value = analogRead(lightSensor);
  float light = value*(255.0/1023.0);
  client.print(value);  
}

void pushButton(BridgeClient client){         //add in the loop 
  int value = analogRead(buttonPin);
    if(value >= 900){
      ispressed = 1;
    }
  client.print(ispressed);
  ispressed = 0;
}

void levels(BridgeClient client){         //add in the loop 
  client.print(occupant);
}

void alarm(BridgeClient client){            //add in the loop
  int i = 0; 
  while (i <= 7){
    analogWrite(alarmPin, 255);
    delay(1000);
    analogWrite(alarmPin, 127);
    delay(1000);
    i++; 
  }
  analogWrite(alarmPin, 0);
}
