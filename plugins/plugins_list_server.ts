import { default as iotnxt } from './iotnxt/iotnxt_server'
export { default as iotnxt } from './iotnxt/iotnxt_server'

import { default as myplugin } from './myplugin/myplugin_server'
export { default as myplugin } from './myplugin/myplugin_server'

import { default as admin } from './admin/admin_server'
export { default as admin } from './admin/admin_server'

import { default as cluster } from './cluster/cluster_server'
export { default as cluster } from './cluster/cluster_server'

import { default as mqtt } from './mqtt/mqtt_server'
export { default as mqtt } from './mqtt/mqtt_server'

import { default as teltonika } from './teltonika/teltonika_server'
export { default as teltonika } from './teltonika/teltonika_server'

import { default as http } from './http/http_server'
export { default as http } from './http/http_server'

import { default as groups } from './groups/groups_server'
export { default as groups } from './groups/groups_server'

export interface plugins {
    iotnxt: iotnxt,
    myplugin: myplugin,
    admin: admin,
    cluster: cluster,
    mqtt: mqtt,
    teltonika: teltonika,
    http: http,
    groups: groups
}