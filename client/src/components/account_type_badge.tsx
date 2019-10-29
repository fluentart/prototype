import React from "react";

import ReactDOM from "react-dom";
import { BrowserRouter, Route, Link, NavLink } from 'react-router-dom'

import { api } from "../api"
import { User } from "../../../server/shared/interfaces"
import { colors } from "../theme";

interface MyProps { }
interface MyState { }

export class AccountTypeBadge extends React.Component<MyProps, MyState> {
    state = {}

    render() {
        const account: User = api.data.account;

        var color = "rgba(255,255,255,0.5)"

        switch (account.type) {
            case undefined: { color = colors.good; break; }
            case "free": { color = colors.good; break; }
            case "pro": { color = colors.warning; break; }
            case "business": { color = colors.alarm; break; }
            case "enterprise": { color = colors.public; break; }
            default: { color = "rgba(255,255,255,0.5)" }
        }


        return (
            <span style={{
                // fontWeight: "bold",
                color,
                padding: 3,
                paddingLeft: 4,
                paddingRight: 10,
                borderRadius: 100,
                textTransform: "uppercase"
            }}><i className="fa fa-user-circle" style={{ paddingRight: 4 }} />
                <span style={{}}>{(account.type != undefined)
                    ? <span>{account.type}</span>
                    : "free"}</span>
            </span>

        );
    }
}

