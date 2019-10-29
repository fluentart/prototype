import React from "react";
import { Lines } from "./hero/lines";
import { Background } from "./hero/bg";
import { AnimNodeGfx } from "./hero/animNodeGfx";
import { Phone } from "./hero/phone";
import { Watch } from "./hero/watch";
import { Laptop } from "./hero/laptop";
import { Server } from "./hero/server";

interface MyProps { }

interface MyState { }

export class Hero extends React.Component<MyProps, MyState> {
    state = {
        rx: false,
        tx: false
    };



    render() {


        return (
            <div>

                <svg id="Layer_1" style={{ overflow: "visible" }} version="1.1" viewBox="0 0 564.3 478.4" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" xmlSpace="preserve">
                    <Background />
                    <AnimNodeGfx rx={(rx) => { this.setState({ rx }) }} tx={(tx) => { this.setState({ tx }) }} />
                    <Lines rx={this.state.rx} tx={this.state.tx} />
                    <Lines rx={this.state.rx} tx={this.state.tx} opacity={0.1} yoffset={10} />
                    <Server rx={this.state.rx} tx={this.state.tx} />
                    <Watch rx={this.state.rx} tx={this.state.tx} />
                    <Laptop rx={this.state.rx} tx={this.state.tx} />
                    <Phone rx={this.state.rx} tx={this.state.tx} />
                </svg>


            </div>
        );
    }
}
