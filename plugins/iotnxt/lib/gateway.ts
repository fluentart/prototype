import { EventEmitter } from "events";

import { cfg } from "../../../server/core/config";

var version = cfg.config.version

import * as iotnxt from "./iotnxtqueue";

import * as _ from "lodash";
import { logger } from "../../../server/shared/log";

import { CorePacket } from "../../../server/shared/interfaces"

export interface GatewayType {
  "GatewayId": string;
  "Secret": string,
  "HostAddress": string;
  "PublicKey": string;
  "connected": boolean | undefined,
  "unique": string,
  "type": string,
  "_created_on": Date,
  "_created_by": any,
  "error": any
  /** new 5.1 use device publickey instead of user apikey. default on new gateways. */
  usepublickey: boolean
  /** worker pid */
  instance_id?: number
  /** worker hostname */
  hostname?: string;
}

export class Gateway extends EventEmitter {
  GatewayId: string = "";
  HostAddress: string = "";
  iotnxtqueue: iotnxt.IotnxtQueue | undefined;
  gateway: GatewayType;
  db: any;
  deviceTree: any;

  constructor(gateway: GatewayType, db: any) {
    super();
    this.db = db;

    // just makes it easier
    this.GatewayId = gateway.GatewayId;
    this.HostAddress = gateway.HostAddress;
    this.gateway = gateway;
    this.deviceTree = {}

    logger.log({ group: "iotnxt_gateway", message: "Gateway calc tree", level: "verbose" })
    this.calculateGatewayTree((e: Error, deviceTree: object) => {
      logger.log({ group: "iotnxt_gateway", message: "got tree", level: "verbose" })
      if (deviceTree) {
        this.deviceTree = deviceTree;
        logger.log({ group: "iotnxt_gateway", message: "connect", level: "verbose" })
        this.connect(deviceTree, (err: Error, queue: any) => {
          logger.log({ group: "iotnxt_gateway", message: "connected", level: "verbose" })
          this.emit("connected")
        });
      }
    });

  }

  disconnect() {
    if (this.iotnxtqueue) this.iotnxtqueue.disconnect();
  }

  /* find devices and calculate their equivalent tree for compatibility with iotnxt portal */
  calculateGatewayTree(cb: Function) {
    this.db.states.find({
      "plugins_iotnxt_gateway": {
        GatewayId: this.gateway.GatewayId,
        HostAddress: this.gateway.HostAddress
      }
    },
      (err: Error, devices: CorePacket[]) => {


        if (devices == null) {
          cb(null, {}); //empty
        } else {
          var deviceTree: any = {};

          for (var device of devices) {
            var flatdata = recursiveFlat(device.data);
            var Properties: any = {};
            for (var key in flatdata) {
              if (flatdata.hasOwnProperty(key)) {
                Properties[key] = {
                  PropertyName: key,
                  DataType: null
                };
              }
            }

            if (this.gateway.usepublickey) {

            } else {

            }

            // new 5.1 switch to using publickey for new gateways.
            var Route = (this.gateway.usepublickey) ? (device.publickey + "|1:" + device.id + "|1").toUpperCase()
              : (device.apikey + "|1:" + device.id + "|1").toUpperCase();

            deviceTree[Route] = {
              Make: null,
              Model: null,
              DeviceName: Route,
              DeviceType: device.id,
              Properties: Properties
            };
          }
          cb(null, deviceTree);
        }


      })
  }

  connect(deviceTree: any, cb: Function) {
    this.iotnxtqueue = new iotnxt.IotnxtQueue(
      {
        GatewayId: this.gateway.GatewayId,
        secretkey: this.gateway.Secret,
        FirmwareVersion: version.version,
        Make: "PROTOTYPE",
        Model: version.version,
        publickey: this.gateway.PublicKey,
        hostaddress: this.gateway.HostAddress
      }, deviceTree, true);


    this.iotnxtqueue.on("pingresp", () => {
      this.emit("pingresp");
    })

    this.iotnxtqueue.on("error", (err: Error) => {
      logger.log({ group: "iotnxtgateway", message: "error " + this.GatewayId + " ERROR:" + err, data: { GatewayId: this.GatewayId }, level: "error" })
      this.emit("error", err);
    })

    this.iotnxtqueue.on("connect", () => {
      logger.log({ group: "iotnxtgateway", message: "connect " + this.GatewayId, data: { GatewayId: this.GatewayId }, level: "verbose" })
      cb(undefined, this.iotnxtqueue);
    });

    this.iotnxtqueue.on("request", (request: any) => {



      for (var key in request.deviceGroups) {
        if (request.deviceGroups.hasOwnProperty(key)) {
          var keyfromroute = key.split(":")[0].split("|")[0]
          var requestClean: any = {}



          requestClean.id = key.split(":")[1].split("|")[0]
          requestClean.req = request.deviceGroups[key];

          if (!requestClean.data) {
            var temp = JSON.parse(JSON.stringify(request.deviceGroups[key]));
            var newtemplowercase = {}

            for (var k of Object.keys(temp)) {
              newtemplowercase[k.toLowerCase()] = request.deviceGroups[key][k]
            }

            requestClean.data = newtemplowercase
          }


          var meta = { ip: "", userAgent: "iotnxtQueue", method: "REQ" }



          requestClean.meta = meta;

          // new in 5.1. we dont use apikey anymore by default for security.
          var deviceData = { key: keyfromroute, packet: requestClean }
          var emitsend = { key: keyfromroute.toLowerCase(), packet: requestClean }

          this.emit("request", emitsend);
        }
      }
    });

    this.iotnxtqueue.on("disconnect", () => { });

  }

  /** takes in a packet and sends it to iotnxt, will also register endpoints if needed */
  handlePacket(packet: any) {
    if (!this.iotnxtqueue) return;
    this.calculateGatewayTree((e: Error, deviceTree: object) => {
      if (deviceTree) {
        var diff = difference(deviceTree, this.deviceTree)
        if (_.isEmpty(diff)) {
          this.updateDevicePublish(packet);
        } else {
          if (!this.iotnxtqueue) return;
          this.iotnxtqueue.registerEndpoints(deviceTree, (e: Error, result: any) => {
            if (result) {
              this.deviceTree = deviceTree;
              this.updateDevicePublish(packet);
            }
          })
        }
      }
    });
  }

  /* takes a prototype packet and converts it to iotnxt portal format 
    updates the state
    publishes state
  */
  updateDevicePublish(packet: CorePacket) {
    if (!this.iotnxtqueue) return;

    /**  new in 5.1 we default to using per device publickeys 
     * instead of apikey, we still honor the old apikey method 
     * for compatibility.
     * */
    var Route = (this.gateway.usepublickey)
      ? (packet.publickey + "|1:" + packet.id + "|1").toUpperCase()
      : (packet.apikey + "|1:" + packet.id + "|1").toUpperCase();

    this.iotnxtqueue.clearState();

    if (!packet.data) { return; }

    var flatdata = recursiveFlat(packet.data);
    for (var propertyName in flatdata) {
      if (flatdata.hasOwnProperty(propertyName)) {
        if (typeof flatdata[propertyName] == "object") {
          this.iotnxtqueue.updateState(
            Route,
            propertyName,
            JSON.stringify(flatdata[propertyName])
          );
        } else {
          this.iotnxtqueue.updateState(
            Route,
            propertyName,
            flatdata[propertyName]
          );
        }
      }
    }

    this.iotnxtqueue.publishState(packet, (err: Error, result: any) => {
      if (err) {
        //todo: cleanup error code and retry
        logger.log({ group: "iotnxtgateway", message: "publishState error " + this.GatewayId + " ERROR:" + err, data: { err, GatewayId: this.GatewayId }, level: "error" })

        delete this.iotnxtqueue;
        this.connect(this.deviceTree, () => {
          logger.log({ group: "iotnxtgateway", message: "publishState reconnected " + this.GatewayId, data: { GatewayId: this.GatewayId }, level: "warn" })
          //once reconnected try again... recursive.
          this.updateDevicePublish(packet);
          // todo: buffer packets while reconnected?.. needs special testing here.
        })
      }
      if (result) {
        logger.log({ group: "iotnxtgateway", message: "publishState success " + this.gateway.GatewayId, data: { GatewayId: this.gateway.GatewayId }, level: "verbose" })
      }
    })
  }
}




export function recursiveFlat(inObj: any) {
  var res: any = {};

  (function recurse(obj, current) {
    for (var key in obj) {
      var value = obj[key];
      var newKey: any = current ? current + "." + key : key; // joined key with dot
      if (value && typeof value === "object") {
        recurse(value, newKey); // it's a nested object, so do it again
      } else {
        res[newKey] = value; // it's not an object, so set the property
      }
    }
  })(inObj);

  return res;
}

export function difference(object: any, base: any) {

  if (typeof object !== "object") { object = {} }
  if (typeof base !== "object") { base = {} }

  function changes(object: any, base: any) {
    return _.transform(object, function (result: any, value: any, key: any) {
      if (!_.isEqual(value, base[key])) {
        result[key] = (_.isObject(value) && _.isObject(base[key])) ? changes(value, base[key]) : value;
      }
    });
  }

  return changes(object, base);
}