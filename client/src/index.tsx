import React from "react";
import { render } from "react-dom";
import { BrowserRouter, Route, Link, NavLink, Nav, Switch } from "react-router-dom";
import { NavBar } from "./components/navbar";
import { Login } from "./components/login";
import { Landing } from "./pages/landing";
import { api } from "./api";
import { DeviceList } from "./components/devicelist";
import { theme, colors } from "./theme";
import { SideBar } from "./components/sidebar";
import { DeviceView } from "./components/deviceview";
import { BGgrad } from "./pages/bggrad";



import { ProtoMap as Map } from "./components/map";
import { clone } from "./utils/lodash_alt";
import { registerServiceWorker } from "./serviceworker/serviceworker_register"

import { Documentation } from "./pages/docs"
import { Settings } from "./pages/settings";

// new login/register
import { UserRegistration } from "./components/user_registration";
import { UserLogin } from "./components/user_login";
import { RegisterPage } from "./pages/register";
import { LoginPage } from "./pages/login";
import { RecoverPage } from "./pages/recover";
import { UserVerify } from "./components/user_verify";
import { RecoverSetpassPage } from "./pages/recoverSetpass";
import { MobileNavBottom } from "./components/mobile_nav_bottom";

export default class App extends React.Component {
  state = {
    count: 0,
    showSidebar: false,
    account: undefined,
    states: undefined,
    height: window.innerHeight,
    ready: false,
    action: undefined,
    view: "list"
  };

  constructor(props) {
    super(props);

    this.getaccount();

    api.on("account", account => {
      this.setState({ account });
    });

    api.on("states", states => {
      this.setState({ states });
    });

    api.on("location", location => {
      window.location = location;
    });

    window.addEventListener("resize", () => {
      this.setState({ height: window.innerHeight });
    });

    api.on("mapGoto", (device) => {
      this.setState({ view: "map" })
    })

    registerServiceWorker();

    // todo: disable location for now
    // this.getlocation();
  }

  getlocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(gps => {
        console.log(gps);
        // api.post({
        //   id: "you",
        //   data: { gps: { lat: gps.coords.latitude, lon: gps.coords.longitude } }
        // });
      });
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  };

  getaccount = () => {
    api.account((err, account) => {
      if (err) {
        // public not logged in
        console.log(err);
        this.setState({ ready: true })
      }
      if (account) {
        console.log(account);
        this.setState({ account, ready: true });

        api.states((err, states) => {
          if (states) {
            //this.setState({ states });
          }
        });
      }
    });
  };

  increment = () => {
    this.setState({
      count: this.state.count + 1
    });
  };

  decrement = () => {
    this.setState({
      count: this.state.count - 1
    });
  };

  mobileMenuPress = () => {
    this.setState({ showSidebar: !this.state.showSidebar });
  };

  render() {
    if (!this.state.ready) {
      return <div></div>;
    }

    if (!this.state.account) {
      return <div>loading</div>
    }

    // NEW VISTORS
    if (this.state.account.level == 0) {
      return (
        <BrowserRouter>
          <Switch>
            <Route exact path="/" component={this.landing} />
            <Route exact path="/u/:username" component={this.userView} />
            <Route exact path="/v/:publickey" component={this.viewByPublickey} />
            <Route path="/u/:username/view/:id" component={this.deviceView} />
            <Route path="/login" component={this.login} />
            <Route path="/register" component={this.register} />
            <Route exact path="/recover" component={this.recover} />
            <Route exact path="/recover/:code" component={this.recoverCode} />
            <Route component={this.NoMatch} />
          </Switch>
        </BrowserRouter>
      );
    }

    // LOGGED IN USERS
    if (this.state.account) {
      return (
        <BrowserRouter>
          <Switch>
            <Route path="/signout" component={this.signout} />

            <Route exact path="/" component={this.userView} />
            <Route exact path="/u/:username" component={this.userView} />

            <Route exact path="/u/:username/view/:id" component={this.deviceView} />
            <Route exact path="/v/:publickey" component={this.viewByPublickey} />


            <Route exact path="/docs" component={this.docs} />
            <Route exact path="/docs/:page" component={this.docs} />

            <Route exact path="/settings" component={this.settings} />
            <Route exact path="/settings/:page" component={this.settings} />
            <Route component={this.NoMatch} />
          </Switch>
        </BrowserRouter>
      );
    }


  }

  NoMatch = props => {
    console.log("nomatch");
    console.log(props);
    return (
      <div>
        <NavBar onlyLogo={true} />
        <div style={{ margin: "0 auto", textAlign: "center", paddingTop: colors.padding * 3 }}>
          <div style={{ fontSize: "30pt" }}>404 Not Found</div>
          <p>Oh oh, that link does not exist.. or you might not have permission.</p>
          <p>Go <a className="dotted" href="/">back home</a>?</p>
        </div>
        {/* nomatch? login first? {JSON.stringify(props)} */}
      </div>)
  }

  docs = props => {
    return (<div>
      <BGgrad />
      <NavBar />
      <Documentation page={props.match.params.page} />
    </div>)
  }

  settings = props => {
    return (
      <div>
        <BGgrad />
        <NavBar />
        <Settings page={props.match.params.page} />
      </div>
    );
  };


  // new vistors home/landing page..
  landing = props => {
    return (
      <div style={{ background: "#232323" }}>
        <div style={{ zIndex: 100 }}>
          <NavBar />
        </div>
        <div style={{ overflow: "hidden" }}>
          <Landing />
        </div>


      </div>
    );
  };

  action = (action) => {
    if (action.view) {
      this.setState({ view: action.view });
    }

  }

  userView = props => {
    var size = (window.innerWidth < 800) ? "small" : "large";

    // var wrapper = clone(theme.global.responsive.wrapper);
    // wrapper.height = this.state.height;
    console.log("---------", size)

    if (size == "large") {
      var styleLarge: any = {}
      return <div style={styleLarge}>
        <BGgrad />
        <NavBar />

        {(!api.data.account.emailverified) && <UserVerify />}
        <div style={{ minHeight: "500px" }}>

          <div style={{
            boxSizing: "border-box", display: "flex",
            flexDirection: "row", width: "100%"
          }}>
            <div style={{ flex: "0", height: "500px", minWidth: "600px" }}>
              <DeviceList username={props.match.params.username} />
            </div>
            <div style={{ flex: "1" }}>
              <Map />
            </div>
          </div>

        </div>

        <div style={{ flex: "0 1 40px" }}><Documentation /></div>
      </div>
    }

    if (size == "small") {
      ///mobile:
      var styleSmall: any = { height: window.innerHeight, width: window.innerWidth, overflow: "hidden", position: "relative" }
      var view = "list"; //default


      if (this.state.view) {
        view = this.state.view;
      }



      return (
        <div style={styleSmall}>
          <BGgrad />
          <NavBar />

          {(!api.data.account.emailverified) && <UserVerify />}

          {(view == "list") && <DeviceList username={props.match.params.username} />}
          {(view == "map") && <Map />}
          {(view == "docs") && <Documentation />}

          <MobileNavBottom action={this.action} />
        </div>
      );
    }


  };



  //userView = props => {
  // var size = window.innerWidth < 800 ? "small" : "large";

  // return (
  //   <div>
  //     <BGgrad />
  //     <NavBar />

  //     <div style={{ margin: colors.padding * 2, minHeight: "500px" }}>
  //       {size == "small" ? (
  //         <DeviceView
  //           username={props.match.params.username}
  //           id={props.match.params.id}
  //         />
  //       ) : (
  //           <div style={{
  //             boxSizing: "border-box", display: "flex",
  //             flexDirection: "row", width: "100%"
  //           }}>
  //             <div style={{ flex: "0", height: "500px", minWidth: "400px" }}>
  //               <DeviceList username={props.match.params.username} />
  //             </div>
  //             <div style={{ flex: "1" }}>
  //               <Map />
  //             </div>
  //           </div>
  //         )}
  //     </div>

  //     <div style={{ flex: "0 1 40px" }}>footer</div>
  //   </div>
  // );
  //};

  viewByPublickey = props => {
    return (<div>
      {/* <NavBar /> */}
      <DeviceView publickey={props.match.params.publickey} hidecontrols={true} /></div>)
  }

  deviceView = props => {
    return <div>
      <NavBar />
      <DeviceView
        username={props.match.params.username}
        id={props.match.params.id}
      />
    </div>
  };

  login = props => {
    return (<div>
      <NavBar onlyLogo={true} />
      <LoginPage />
    </div>)
  };

  /** /register page */
  register = props => {
    return (<div>
      <NavBar onlyLogo={true} />
      <RegisterPage />
    </div>)
  };

  /** ACCOUNT RECOVERY FORM */
  recover = props => {
    return (<div>
      <NavBar onlyLogo={true} />
      <RecoverPage />
    </div>)
  }

  /** CHECKING RECOVERY CODE AND SETTING NEW PASSWORD: */
  recoverCode = props => {
    return (<div>
      <NavBar onlyLogo={true} />
      {/* <RecoverPage /> */}
      <RecoverSetpassPage code={props.match.params.code} />
    </div>)
  }

  signout = props => {
    api.location("/signout");
    return <div>signing out</div>;
  };
}

render(<App />, document.getElementById("app"));
