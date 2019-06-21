import { describe, it } from "mocha";
import { Prototype } from "../utils/api"

const Cryptr = require('cryptr');
const cryptr = new Cryptr('prototype');


/*

  prototype test suite

  env server=https://prototype.dev.iotnxt.io port=443 https=true npm run test

*/

// https://mochajs.org/#getting-started


//var prototype = new Prototype({ uri: "https://prototype.dev.iotnxt.io" });
//var prototype = new Prototype({ uri: "https://prototype.iotnxt.io" });

var testAccount = {
    email: "test" + generateDifficult(32) + "@iotlocalhost.com",
    password: cryptr.encrypt("newUser"),
    apikey: ""
}

/*

if (process.env) {
  if (process.env.server) testAccount.server = process.env.server
  if (process.env.port) testAccount.port = parseInt(process.env.port)
  if (process.env.https) testAccount.https = (process.env.https === 'true')
  console.log(testAccount);
}

*/

describe("PROTOTYPE", () => {
    // instance for new user
    var prototype = new Prototype();

    it("register", (done) => {
        //this.timeout(5000);

        prototype.register(testAccount.email, testAccount.password, (err:Error, result:any)=>{
                if (err) done(err);
                if (result) { 
                    if (result.error) done(new Error(result.error))
                    if (result.account.apikey) { 
                        testAccount.apikey = result.account.apikey;
                        done(); }
                }
        })
    })
    //////
    it("account", (done)=>{
        prototype.account( (err:Error,account:any)=>{
            if (err) done(err);
            if (account) { 
                if (!account.uuid) { done(new Error("uuid missing")); return;}
                if (!account.apikey) { done(new Error("apikey missing")); return;}
                if (testAccount.apikey != account.apikey) { done(new Error("apikey mismatch")); return;}
                done();
            }
        })
    })

    // checks server version
    it("version", (done)=>{
        prototype.version( (err:Error,version:any)=>{
            if (err) done(err);
            if (version) {
                done();
            }
        })
    })

    
    // attempt signin using email/pass
    it("signin", function(done) {
        // fresh instance
        new Prototype().signin(testAccount.email,testAccount.password, (err:Error, result:any)=>{
            if (err) done(err);
            if (result) { 
                if(result.signedin == true) done();
            }
        })
    })    

    // attempt to get account info with only apikey
    it("account", (done)=>{
        if (testAccount.apikey == "") { done("no apikey yet!"); } 
        // fresh instance
        new Prototype({apikey: testAccount.apikey}).account( (err:Error,account:any)=>{
            if (err) done(err);
            if (account) { 
                if (!account.uuid) { done(new Error("uuid missing")); return;}
                if (!account.apikey) { done(new Error("apikey missing")); return;}
                if (testAccount.apikey != account.apikey) { done(new Error("apikey mismatch")); return;}
                done();
            }
        })
    })

    ////// DEVICE

    var packet = {
        id : "test_httppost",
        data: { random: generateDifficult(32) }
    }

    it("device HTTP POST", (done) => {
        if (testAccount.apikey == "") { done("no apikey yet!"); } 
        
        new Prototype({apikey: testAccount.apikey}).post(packet, (err:Error,response:any)=>{
            if (err) done(err);
            if (response) { 
                if (response.result != "success") { done(new Error(response)); return;}
                done();
            }
        })
    })

    it("device HTTP VIEW", (done) => {
        if (testAccount.apikey == "") { done("no apikey yet!"); } 
        
        new Prototype({apikey: testAccount.apikey}).view(packet.id, (err:Error,response:any)=>{
            if (err) done(err);
            if (response) { 
                if (response.data.random == packet.data.random) {
                    done();
                } else {
                    done(new Error("data mismatch"))
                }
                
            }
        })
    })

    it("device HTTP PACKETS", (done)=>{
        new Prototype({apikey: testAccount.apikey}).packets(packet.id, (err:Error,response:any)=>{
            if (err) done(err);
            if (response) {  
                if (response[response.length - 1].data.random == packet.data.random) {
                    done();
                  } else {
                      done(new Error("data mismatch"))
                  }          
            }
        })
    })

    it("device HTTP STATE", (done)=>{
        new Prototype({apikey: testAccount.apikey}).state(packet.id, (err:Error,response:any)=>{
            if (err) done(err);
            if (response) {  
                if (!response.key) { done(new Error("key missing from state")); return;}
                if (!response.apikey) { done(new Error("apikey missing")); return;}
                if (!response.devid) { done(new Error("devid missing")); return;}
                if (!response.payload) { done(new Error("payload missing")); return;}
                if (packet.data.random != response.payload.data.random) { done(new Error("date mismatch")); return;}
                done();          
            }
        })
    })

    it("device HTTP STATES", (done)=>{
        new Prototype({apikey: testAccount.apikey}).states( (err:Error,response:any)=>{
            if (err) done(err);
            if (response) {  
                if (response[0].id != packet.id) { done(new Error("id mismatch")); return;}
                if (response[0].data.random != packet.data.random) { done(new Error("data mismatch")); return;}
                done();          
            }
        })
    })

    it("device HTTP DELETE", (done)=>{
        new Prototype({apikey: testAccount.apikey}).delete(packet.id, (err:Error,response:any)=>{
            if (err) done(err);
            if (response) {  
                done();          
            }
        })
    })

    /*
        Tests sending data over http post and recieving it on socket and mqtt
    */

    it("HTTP -> SOCKET", (done)=>{
        var id = "protTestHttpSocket"
        // SOCKET
        var protSocket = new Prototype({apikey: testAccount.apikey, protocol: "socketio", id});
        protSocket.on("connect", ()=>{
            // HTTP POST
            new Prototype({apikey: testAccount.apikey}).post({id, data:{a:"123"}}, (e:Error,r:any)=>{})
        })
        protSocket.on("data", (data:any)=>{
            done();
        })
    })

    it("HTTP -> MQTT", (done)=>{
        var id = "protTestHttpMqtt"
        // SOCKET
        var protSocket = new Prototype({apikey: testAccount.apikey, protocol: "mqtt", id});
        protSocket.on("connect", ()=>{
            // HTTP POST
            new Prototype({apikey: testAccount.apikey}).post({id, data:{a:"123"}}, (e:Error,r:any)=>{})
        })
        protSocket.on("data", (data:any)=>{
            done();
        })
    })

})



function generateDifficult(count: number) {
    var _sym = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890'
    var str = '';
    for (var i = 0; i < count; i++) {
      var tmp = _sym[Math.round(Math.random() * (_sym.length - 1))];
      str += "" + tmp;
    }
    return str;
  }
  



  