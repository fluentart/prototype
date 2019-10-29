import React from "react";
import { colors } from "../theme";
import { UserRegistration } from "../components/user_registration";
import { UserRecoveryForm } from "../components/user_recover";

interface MyProps { }

interface MyState { }

/** For users to recover access to their account. 
 * At the moment we only support users to use their email account to get a recovery link. 
 * In future we can also support mobile phone authentication or even drivers licence authentication.
*/
export class RecoverPage extends React.Component<MyProps, MyState> {
    state = {};

    render() {
        var styleregister: any = { ...colors.cardShadow, ...{ maxWidth: "800px", margin: "0 auto" } }
        return (<div>
            <div style={{ padding: colors.padding * 2, zIndex: 3 }}>

                <div style={styleregister}>

                    <div style={{ padding: colors.padding * 2, background: "rgba(0,0,0,0.2)" }}>
                        <h2 style={{ margin: 0, padding: 0 }}>ACCOUNT RECOVERY</h2>
                    </div>



                    <UserRecoveryForm />

                    <div style={{
                        ...colors.p, ...{
                            padding: colors.padding * 2,
                            paddingTop: colors.padding * 2,
                            paddingBottom: colors.padding * 3,
                            textAlign: "right",
                            fontSize: "12pt"
                        }
                    }}>
                        Already have an account? Go to <a href="/login">Log in</a>
                    </div>

                    <div style={{ ...colors.p, ...{ background: "rgba(0,0,0,0.2)", padding: colors.padding * 1, textAlign: "right", fontSize: "12pt", } }}>
                        By registering you agree to our <a style={{ whiteSpace: "nowrap" }} href="/terms">Terms of Service</a>.
              </div>

                </div>
            </div>
        </div>)
    }
}
