import { describe, it } from "mocha";
import * as _ from "lodash"
import * as request from "request"

import { API } from "./api"; //V4 ALPHA.

var api = new API({uri: "http://localhost:8080"})


/** API DOCUMENTATION: Uncomment below to register an account */

describe("API V4 TESTS", () => {
    
    /**  We pick a random email and password for ourselves to test with: */
    const randomTestAccount = {
        email:"rouantest"+Math.random().toString(36).substr(2, 5), 
        pass: Math.random().toString(36).substr(2, 5)
    }

    var registeredAccount:any = {}

    /** -----------------------------------------------------------------------
     * 1)  REGISTER ACCOUNT    */
    it("can register an account", function (done) {
        api.register(randomTestAccount, (err,result)=>{
            if (err) { 
                console.log("1) REGISTER | OUTPUT:");
                console.log(result);
                done(err); return; 
            }
            
            if (result.account) { 
                registeredAccount = result.account                
                if (!registeredAccount.apikey) { done("apikey missing")}
                if (!registeredAccount.level) { done("level missing")}
                if (!registeredAccount.username) { done("username missing")}                
                done(); 
            }
        })
    });

    /** ----------------------------------------------------------------------- 
     * 2)  SIGNIN      */
    it("can signin to an account", function (done) {
        api.signin(randomTestAccount, (err,result) => {
            if (err) {
                console.log("2) SIGNIN | OUTPUT:")
                console.log(err); 
            }
            
            if ((result.signedin == true) && 
                (result.auth != undefined)) {
                done();
            }
        })
    });

    /** ----------------------------------------------------------------------- 
     * 3)  ACCOUNT     */
    it("can recieve account information", function (done) {
        api.account((err,account)=>{
            if (err) console.log(err);
            if (!account.apikey) { done("apikey missing")}
            if (!account.level) { done("level missing")}
            if (!account.username) { done("username missing")}                
            if ((account.apikey == registeredAccount.apikey)&&(account.publickey == registeredAccount.publickey)) {
                done();
            } else {
                done("Something wrong with accounts..")
            }            
        })
    })
        
    //************************ */
})











// api.account((err, account) => {
//     if (err) {
//       // public not logged in
//       console.log(err);
//       console.log({ ready: true })
//     }
//     if (account) {
//       console.log(account);
//       console.log({ account, ready: true });

//       api.states((err, states) => {
//         if (states) {
//           //console.log({ states });
//         }
//       });
//     }
//   });