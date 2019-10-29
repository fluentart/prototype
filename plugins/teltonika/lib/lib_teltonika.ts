import { EventEmitter } from "events";
import { Socket } from "net"
import { teltonicaIoElements, lookupID } from "./lib_teltonika_elements"
var _ = require('lodash');

import * as crc from "crc";

export class Teltonika extends EventEmitter {
  socket: Socket;
  state: string;
  avldata: any;
  deviceip: any;
  imei: any;
  id: string;


  constructor(socket: Socket) {
    super();
    this.id = "TELTONIKA_unknown";
    this.state = "init";
    this.socket = socket;
    this.avldata = {};
    this.deviceip = socket.remoteAddress;

    socket.on("data", this.handleData(socket))
    socket.on("end", () => {
      console.log("teltonika disconnected");
      this.emit("end")
    })
  }

  tcpwrite = (command: string) => {
    console.log("writing to device:")
    var commandBuffer = genCommand(command)
    console.log("command:\t" + command)
    console.log(commandBuffer.toString("hex"));
    this.socket.write(commandBuffer);
  }

  handleData = (socket: Socket) => {
    return (data: Buffer) => {

      try {
        //---------------------
        if (this.state == "init") {
          try {
            var newbuf: any = data.slice(0, 2);
            var imeilength = newbuf.readUInt16BE()

            this.avldata.imei = data.slice(2).toString();
            this.imei = data.slice(2).toString();
            socket.write(Buffer.from("01", "hex"));
            this.state = "dataavl";
          }
          catch (err) {
            console.log(err);
          }
          return;
        }
        //---------------------
        if (this.state == "dataavl") {

          if (data.length == 1) { return; }

          var fourzerobytes = data.slice(0, 4);
          var dataLength = data.readUInt32BE(4);
          //console.log(dataLength);
          var codecId = data.slice(8, 9).toString("hex")

          if (codecId != "08") {

            // could be a command reply response

            this.id = "TELTONIKA_" + this.imei

            var devicePacket: any = {
              id: this.id,
              data: {
                imei: this.avldata.imei,
                deviceip: this.deviceip,
                response: data.toString()
              }
            };

            //console.log(this.imei + "\tERROR not codec 08!")
            //console.log(data.toString())
            this.emit("data", devicePacket);
            return;
          }

          // codecId == 08


          var dataNum = data.slice(9, 10);
          //console.log(dataNum);

          // TIMESTAMP
          var date = new Date(hexToDec(data.slice(10, 18).toString("hex")));
          //console.log(date.toString());
          this.avldata.date = new Date(date).toISOString();
          // PRIORITY
          var priority = data.slice(18, 19);
          //console.log(priority);

          // GPS
          this.avldata.gps = {}
          this.avldata.gps.longitude = data.readInt32BE(19) / 10000000;
          this.avldata.gps.latitude = data.readInt32BE(23) / 10000000;
          this.avldata.gps.altitude = data.readUInt16BE(27);
          this.avldata.gps.angle = data.readUInt16BE(29);
          this.avldata.gps.numsat = data.readUInt8(31);
          this.avldata.gps.speed = data.readUInt16BE(32);

          // IO ELEMENT
          var ioelem = data.slice(34, 35);
          //console.log("ioelem:\t" + ioelem);

          var ioelemcount = data.readUInt8(35);
          //console.log(ioelemcount)

          var ioelem1b = data.readUInt8(36);


          /////////////////////////////////
          this.avldata.ioelementsGroup = []

          for (var a = 0; a < ioelem1b; a++) {
            var i = 37 + (a * 2);
            var ioelemdata: any = {}
            ioelemdata.id = data.readUInt8(i)

            var spec: any = lookupID(ioelemdata.id)
            if (spec.type == "Signed") {
              ioelemdata.value = data.readInt8(i + 1);
            } else {
              ioelemdata.value = data.readUInt8(i + 1);
            }


            ioelemdata.bytes = 1;
            this.avldata.ioelementsGroup.push(ioelemdata);
          }
          //console.log(this.avldata)
          /* --- */
          var ioelem2bStart = 37 + (ioelem1b * 2);
          var ioelem2b = data.readUInt8(ioelem2bStart);
          //console.log("2byte elements:"+ioelem2b)

          for (var a = 0; a < ioelem2b; a++) {
            var i = (ioelem2bStart + 1) + (a * 3);
            var ioelemdata: any = {};
            ioelemdata.id = data.readUInt8(i);
            //ioelemdata.raw = data.slice(i+1,i+3).toString("hex")


            var spec: any = lookupID(ioelemdata.id)
            if (spec.type == "Signed") {
              ioelemdata.value = data.readInt16BE(i + 1);
            } else {
              ioelemdata.value = data.readUInt16BE(i + 1);
            }

            ioelemdata.bytes = 2;
            this.avldata.ioelementsGroup.push(ioelemdata);
          }

          /* --- */
          var ioelem4bStart = ioelem2bStart + 1 + (ioelem2b * 3)
          var ioelem4b = data.readUInt8(ioelem4bStart);
          //console.log("4byte elements:"+ioelem4b)

          for (var a = 0; a < ioelem4b; a++) {
            var i = (ioelem4bStart + 1) + (a * 5);
            var ioelemdata: any = {}
            ioelemdata.id = data.readUInt8(i);
            //ioelemdata.raw = data.slice(i+1,i+5).toString("hex")

            var spec: any = lookupID(ioelemdata.id)
            if (spec.type == "Signed") {
              ioelemdata.value = data.readInt32BE(i + 1);
            } else {
              ioelemdata.value = data.readUInt32BE(i + 1);
            }


            ioelemdata.bytes = 4;
            this.avldata.ioelementsGroup.push(ioelemdata);
          }

          /* --- */
          var ioelem8bStart = ioelem4bStart + 1 + (ioelem4b * 5);
          var ioelem8b = data.readUInt8(ioelem8bStart);
          //console.log("8byte elements:"+ioelem8b);

          for (var a = 0; a < ioelem8b; a++) {
            var i = (ioelem8bStart + 1) + (a * 9);
            var ioelemdata: any = {}
            ioelemdata.id = data.readUInt8(i);
            //ioelemdata.raw = data.slice(i+1,i+9).toString("hex")
            //ioelemdata.value = hexToDec(data.slice(i+1,i+9).toString("hex"))

            // seems these should be hex
            ioelemdata.value = data.slice(i + 1, i + 9).toString("hex")

            ioelemdata.bytes = 8;
            this.avldata.ioelementsGroup.push(ioelemdata);
          }


          //------------------------------------------------------
          //parse

          this.id = "TELTONIKA_" + this.avldata.imei;

          var devicePacket: any = {
            id: "TELTONIKA_" + this.avldata.imei,
            data: {
              imei: this.avldata.imei,
              timestamp: this.avldata.date,
              gps: this.avldata.gps,
              deviceip: this.avldata.deviceip
            }
          };


          for (var ioelemdata of this.avldata.ioelementsGroup) {
            for (var x of teltonicaIoElements) {
              if (x.id == ioelemdata.id) {
                //ioelemdata.propname = _.camelCase(x.propname);

                if (x.multiplier != "") {
                  devicePacket.data["ID" + x.id + "_" + _.camelCase(x.propname)] = ioelemdata.value * parseFloat(x.multiplier);
                } else {
                  devicePacket.data["ID" + x.id + "_" + _.camelCase(x.propname)] = ioelemdata.value;
                }

                if (x.units) {
                  devicePacket.data["ID" + x.id + "_" + _.camelCase(x.propname)] += " " + x.units;
                }

              }
            }
          }

          this.emit("data", devicePacket);
          //postDeviceDataToAPI(devicePacket, ()=>{
          var responsePad = Buffer.from("000000", "hex");
          var response = Buffer.concat([responsePad, dataNum]);
          //console.log("response");
          //console.log(response);
          socket.write(response);
          return;
          //});


          //////////////
        }
        //---------------------

        //---------------------

      } catch (err) {
        console.log(err);
        console.log(data.length);
        console.log(data.toString("hex"))
        console.log(this.deviceip)
      }
    }
  }
}





//https://www.rapidtables.com/convert/number/hex-to-decimal.html
const hexToDec = (hex: any) => {

  const hexMap: any = new Map([
    ["0", 0],
    ["1", 1],
    ["2", 2],
    ["3", 3],
    ["4", 4],
    ["5", 5],
    ["6", 6],
    ["7", 7],
    ["8", 8],
    ["9", 9],
    ["A", 10],
    ["B", 11],
    ["C", 12],
    ["D", 13],
    ["E", 14],
    ["F", 15],
  ]);

  let dec: any = 0;
  let power = hex.length - 1;
  for (const char of hex) {
    dec += hexMap.get(char.toUpperCase()) * Math.pow(16, power);
    power--;
  }

  return dec;
};




export function genCommand(command: string) {
  // https://community.teltonika.lt/64/need-tcp-command-of-digital-output
  var start = Buffer.from([0, 0, 0, 0])
  var header = Buffer.from("0C", "hex")
  var numcommands = Buffer.from([1])
  var commandType = Buffer.from([5]) // 5 = request    6 = response
  var commandLength = Buffer.from([0, 0, 0, command.length])
  var commandBuf = Buffer.from(command);
  var data = Buffer.concat([header, numcommands, commandType, commandLength, commandBuf, numcommands])
  var datalength = Buffer.from([0, 0, 0, data.length])
  var computedCRC16 = Buffer.from(crc.crc16(data).toString(16), "hex")
  var done = Buffer.concat([start, datalength, data, Buffer.from([0, 0]), computedCRC16])
  return done
}