import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Link, NavLink } from 'react-router-dom'

import "../prototype.scss"



import { api } from "../api"

interface MyProps {
    getaccount: Function;
}

interface MyState {
    [index: string]: any
}

export class Login extends React.Component<MyProps, MyState> {

    state = {
        email: "",
        pass: "",
        message: ""
    }

    onClick = () => {
        api.signin(this.state.email, this.state.pass, (err, result) => {
            if (err) {
                this.setState({ message: err.err })
                setTimeout(() => {
                    this.setState({ message: "" })
                }, 2000)
            }
            if (result) {
                console.log("result")
                console.log(result);
                if (result.signedin) {
                    this.props.getaccount();
                }
            }
        })
    }

    onChange = (propname) => {
        return (evt) => {
            let tmp = {};
            tmp[propname] = evt.target.value;
            this.setState(tmp);
        }
    }

    render() {
        return (
            <div>
                <div>
                    <input placeholder="Email Address" type="text" style={{ width: 250 }} onChange={this.onChange("email")} value={this.state.email} />
                    <input placeholder="Password" type="password" style={{ width: 250 }} onChange={this.onChange("pass")} value={this.state.pass} />
                    <button onClick={this.onClick}>Signin</button>
                </div>

                <span>{this.state.message}</span>
            </div>
        );
    }
}

