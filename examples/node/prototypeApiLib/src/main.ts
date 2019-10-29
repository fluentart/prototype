import { API } from "./api";

var api = new API({uri: "http://localhost:8080", apikey: "321x612htdu3mwty1jgkucytxve9r21b"})



/** API DOCUMENTATION: Uncomment below to register an account */
// api.register({email:"rouantest", pass: "somepass"}, (err,result)=>{
//     console.log(err);
//     console.log(result);
// })


/** SIGNIN TO ACCOUNT */
/* 
 
Result:

    {
    signedin: true,
    auth: 'Basic YXBpOmtleS0zMjF4NjEyaHRkdTNtd3R5MWpna3VjeXR4dmU5cjIxYg=='
    }  
  
 */
api.signin({email:"rouantest",pass: "somepass"}, (err,result)=>{
    if (err) console.log(err);
    if (result) console.log(result);
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