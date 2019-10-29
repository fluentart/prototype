export interface Package {
    name: string;
    version: string;
    description: string;
    main: string;
}

/** When you want to log something 
 * 
 * @remarks 
 * This is a remark?? {@link core-library#Statistics | Statistics subsystem}
 * 
 * @param message - The first input number
 * @param data - The second input number
 * @returns The arithmetic mean of `x` and `y`
 *
 * @beta
*/
export interface LogEvent {
    message: string;
    data?: any;
    level: "error" | "warn" | "info" | "verbose" | "debug" | "silly";
    group?: string;
}


export interface CorePacket {
    id?: string;
    data?: any;
    apikey?: string;
    alarm?: boolean;
    warning?: boolean;
    shared?: boolean;
    public?: boolean;
    workflowCode?: string;
    key?: string; // todo: is this secret?
    [index: string]: any;
    timestamp?: Date;
}

export interface DBchange {
    operationType: "insert" | "replace";
    clusterTime: any;
    fullDocument: CorePacket;
    ns: { db: string, coll: string }
    documentKey: any
}

export interface User {
    _id?: string;
    email: string;
    username: string;
    apikey: string;
    publickey: string;
    level: number;
    admin: boolean;
    emailverified?: boolean;
    /** encrypted form of password. most instances of users wont even have this encrypted string present. */
    password?: string;
    /** describes what type of account this is: 
     * undefined == free, can also be "free", "pro", "business", "enterprise" */
    type?: string;
    recover?: {
        code: string
        timestamp: Date
    }
}

export interface ConfigFile {
    ssl: boolean
    sslOptions?: {
        certPath?: string
        keyPath?: string
        caPath?: string
        ca?: any
        key?: any
        cert?: any
    }
    env?: string
    httpPort: number
    httpsPort?: number
    mongoConnection: string
    version: {
        /** package.json name */
        name: string
        /** version of prototype from package.json */
        version: string
        /** description from package.json */
        description: string
    };
}

export interface WidgetType {
    type: string;
    i?: string;
    x?: number;
    y?: number;
    w?: number;
    h?: number;
    /** 
     * 
     * dot.notation.path.to.nested.data
     * 
     * 
     * This specific widget may have a datapath assigned to it.      * 
     * Usually this is set when you drag and drop an object from the device data panel. 
     * 
     * eg: root.id 
     * 
     *      root.data.temperature
     * 
     * */
    datapath?: string;
    dataname: string;
    /** If any options have been set on this widget */
    options?: any;
}


export interface WidgetComponentProps {
    /** Settings relevant to this widget */
    widget: WidgetType
    /** This device full state */
    state: CorePacket
    /** Data value if drag and dropped from endpoint */
    value?: any
}

export interface OptionComponentProps {
    name: string
    option: any
}

/** To utilize the packets api see below: 
 * 
 * @param find mongodb find query object
 * @param sort? (optional) mongodb sort query object
 * @param limit? (optional) number
*/
export interface ClientPacketOptions {
    find: any;
    sort?: any;
    limit?: number
    id?: string
    // /** Specify the key of the state you want to retrieve from */
    // key?: CorePacket["key"]
    // /** Specify the datapath of the packet history you want to query
    //  * eg "root.data.temperature"
    //  */
    // datapath?: string
}

/** CorePacketsOptions
 * @param request
 * @param user
 */
export interface CorePacketsOptions {
    request: ClientPacketOptions,
    user: User
}

/** All http api endpoints should have this documentation object */
export interface APIdocumentation {
    method: string
    path: string
    description?: string
    post?: any
    response?: any
}