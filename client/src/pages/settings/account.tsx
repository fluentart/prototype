import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Link, NavLink } from 'react-router-dom'
import { api } from "../../api"
import { User } from "../../../../server/shared/interfaces"
import { colors } from "../../theme";
import { AccountTypeBadge } from "../../components/account_type_badge";
import { AccountEmail } from "./account_email";
import { AccountUsername } from "./account_username";
import { AccountPassword } from "./account_password";

interface MyProps { }
interface MyState { }

export class Account extends React.Component<MyProps, MyState> {
    state = { changeEmail: false }

    render() {
        const account: User = api.data.account;

        return (
            <div>

                <AccountUsername />
                <AccountEmail />
                <AccountPassword />

                <div style={{ paddingTop: colors.padding * 2, paddingBottom: colors.padding * 2 }}>
                    <AccountTypeBadge />
                </div>

                <button onClick={() => { api.location("/signout") }}>Sign out</button>
            </div>
        );
    }
}

