/** add your plugin test file here */

import { default as mqtt } from './mqtt/mqtt_test'
import { default as teltonika } from './teltonika/teltonika_test'
import { default as iotnxt } from './iotnxt/iotnxt_test'
import { default as http } from "./http/http_test"
//import { default as groups } from "./groups/groups_test"

export var pluginTests: any = {
    mqtt,
    teltonika,
    iotnxt,
    http,
    //groups 
}