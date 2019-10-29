import React from "react";

interface MyProps { }
interface MyState { }

export class Background extends React.Component<MyProps, MyState> {
    state = {
        y: 0
    };

    start = 0;
    end = 50;
    frame = 0;

    startvalue = -400;
    endvalue = 0;

    intA;

    componentDidMount() {

        this.intA = setInterval(() => {
            this.animate();
        }, 50)

    }

    componentWillUnmount() {
        clearInterval(this.intA);
    }

    animate() {
        this.frame += 5;

        if ((this.frame > this.start) && (this.frame <= this.end)) {
            //var val = (this.startvalue * (this.frame / this.start)) + (this.endvalue * (this.frame / this.endvalue));
            var range = (this.end - this.start);
            var val = this.frame / range;

            var output = Math.round(((1 - val) * this.startvalue) + (val * this.endvalue));
            this.setState({ y: output })
        }
    }

    render() {
        var linesToDisplay = [];

        var transform: any = "translate(0 " + this.state.y + ")"

        // return (<div>{this.state.y}</div>)

        var bgcolor = "rgba(255,255,255,0.05)";

        //lighter
        //bgcolor = "#081626";
        //bgcolor = "#cccccc";

        return (
            <g id="layerBg" transform={transform} >
                <g>
                    <path fill={bgcolor} d="M344.9,442.3l497.7-278.4c17.3-9.7,27.5-28.5,26.2-48.3L843-270.1c-1.8-27-24.2-48-51.3-48h-971.9&#xA;&#x9;&#x9;&#x9;c-28.4,0-51.4,23-51.4,51.4v375c0,18.3,9.8,35.3,25.7,44.5l500,289.1C309.8,451,329.1,451.1,344.9,442.3z" />
                </g>
            </g>
        )
    }
}