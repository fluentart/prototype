import React from "react";

interface MyProps { rx: boolean, tx: boolean }
interface MyState { }

export class Phone extends React.Component<MyProps, MyState> {
    state = {
        frame: 0,
        blink: []
    };

    start = 0;
    end = 50;
    frame = 0;
    frameRunning = 0;

    startvalue = -400;
    endvalue = 0;
    max = 100;

    intA;

    componentDidMount() {
        var blink = []
        for (var a = 0; a <= this.max; a++) {
            blink.push(false);
        }
        this.setState({ blink }) // initial all off;

        this.intA = setInterval(() => {
            this.animate();
        }, 50)
    }


    componentWillUnmount() {
        clearInterval(this.intA);
    }

    animate() {
        var blink = JSON.parse(JSON.stringify(this.state.blink))


        this.frameRunning++;


        if (this.frame < this.max) {

            blink[this.frame] = true;
            this.setState({ blink })
            this.frame++;
        } else {
            this.frame = 0;
            var blink: any = []
            for (var a = 0; a <= this.max; a++) {
                blink.push(false);
            }
            this.setState({ blink }) // initial all off;
        }
    }

    render() {
        var linesToDisplay = [];

        var anim = Math.sin(this.frameRunning / 25) + 2
        var transform: any = "translate(0 " + (anim * 2) + ")"

        // return (<div>{this.state.y}</div>)

        var shadowopacity = 0.15 + (anim * 0.1);

        return (
            <g id="layerPhoneMain" >
                <g id="layerPhoneShadow">
                    <path id="shadow" transform="translate(0 2)" opacity={shadowopacity.toFixed(2)} d="M441.1,238.2c-0.3,0-0.6-0.1-0.8-0.2l-65.6-37.9c-0.4-0.2-0.4-0.8,0-1l3.8-2.2c0.3-0.2,0.6-0.2,0.8-0.2&#xA;&#x9;&#x9;&#x9;l61.3,35.4c0.3,0.1,0.5,0.2,0.7,0.2h0.1l4.3,2.5c0.4,0.2,0.4,0.8,0,1l-3.8,2.2C441.7,238.1,441.4,238.2,441.1,238.2" />
                </g>
                <g id="layerPhone" transform={transform}>
                    <path className="st56" id="sides" d="M441.8,232.1c0.4-0.2,0.6-0.7,0.6-1.4V80.6c0-0.2,0-0.4,0-0.5l7.6-4.4c-0.2-1-0.7-2.1-1.4-2.7&#xA;&#x9;&#x9;&#x9;l-7.6,4.4c-0.1-0.1-0.2-0.2-0.3-0.2l-66-38.1c-0.3-0.1-0.5-0.2-0.7-0.2s-0.3,0-0.5,0.1l7.6-4.4l0,0c0.1-0.1,0.3-0.1,0.4-0.1&#xA;&#x9;&#x9;&#x9;c0.2,0,0.4,0.1,0.7,0.2l66,38.1c1,0.6,1.8,2.1,1.8,3.4v150.1c0,0.7-0.3,1.2-0.6,1.4l0,0l-4.9,2.8l-1.4,0.8L441.8,232.1 M373.5,39&#xA;&#x9;&#x9;&#x9;L373.5,39L373.5,39" />
                    <path className="st16" id="topcornerhighlight" d="M442.4,80c-0.2-1-0.7-2.1-1.4-2.7l7.6-4.4c0.7,0.6,1.3,1.6,1.4,2.7L442.4,80" />
                    <path className="st57" id="frontbot" d="M441.3,232.2c-0.2,0-0.5-0.1-0.7-0.2l-61.3-35.4l-3.1-1.8l-1.4-0.8l-0.2-0.1&#xA;&#x9;&#x9;&#x9;c-1-0.6-1.8-2.1-1.8-3.4v-8.2l69.6,40.2V88.8l-69.6-40.2v-8.2c0-0.7,0.2-1.2,0.6-1.4l0,0l0,0c0.1-0.1,0.3-0.1,0.5-0.1&#xA;&#x9;&#x9;&#x9;s0.5,0.1,0.7,0.2l66,38.1c0.1,0.1,0.2,0.1,0.3,0.2c0.7,0.6,1.3,1.6,1.4,2.7c0,0.2,0,0.4,0,0.5v150.1c0,0.7-0.2,1.2-0.6,1.4&#xA;&#x9;&#x9;&#x9;C441.6,232.2,441.4,232.2,441.3,232.2C441.4,232.2,441.4,232.2,441.3,232.2" />
                    <path className="st58" id="screen" d="M372.8,182.3V48.6l69.6,40.2v133.6L372.8,182.3" />
                    <path className="st60" id="speaker" d="M402.2,61.7c-0.5-0.3-0.7-0.7-0.7-1.3l-0.1-0.2c0-0.6,0.1-0.7,0.5-0.8l0.1,0.1l12.7,7.3&#xA;&#x9;&#x9;&#x9;c0.5,0.3,0.9,1,0.9,1.7c0,0.2,0,0.3-0.1,0.4c-0.1,0.3-0.4,0.3-0.8,0.1L402.2,61.7" />
                    <path className="st12" id="path3794" d="M402,59.4c-0.4-0.2-0.8,0.1-0.8,0.7c0,0.7,0.4,1.4,0.9,1.7l12.7,7.3c0.4,0.2,0.7,0.1,0.8-0.3&#xA;&#x9;&#x9;&#x9;l-0.1-0.1l-12.7-7.3c-0.5-0.3-0.9-1-0.9-1.7C401.9,59.7,401.9,59.5,402,59.4" />
                    <path className="st61" id="path3796" d="M446.5,93c-0.5,0.3-1,1.1-1,1.8v8.7c0,0.4,0.1,0.7,0.3,0.8l0,0l0.6,0.3l-0.1-0.3l0.2-0.1&#xA;&#x9;&#x9;&#x9;l0.1-0.1c0.5-0.3,1-1.1,1-1.8v-8.7c0-0.2,0-0.3-0.1-0.5h0.3l-0.5-0.3l0,0c-0.2-0.1-0.4-0.1-0.6,0.1L446.5,93" />
                    <path className="st62" id="path3798" d="M447,104.6c-0.5,0.3-1,0-1-0.7v-8.7c0-0.7,0.4-1.5,1-1.8l0.1-0.1c0.5-0.3,1,0,1,0.7v8.7&#xA;&#x9;&#x9;&#x9;c0,0.7-0.4,1.5-1,1.8L447,104.6" />
                    <path className="st61" id="path3800" d="M446.5,106.3c-0.5,0.3-1,1.1-1,1.8v8.7c0,0.4,0.1,0.7,0.3,0.8l0,0l0.6,0.3l-0.1-0.3l0.2-0.1&#xA;&#x9;&#x9;&#x9;l0.1-0.1c0.5-0.3,1-1.1,1-1.8v-8.7c0-0.2,0-0.3-0.1-0.5h0.3l-0.5-0.3l0,0c-0.2-0.1-0.4-0.1-0.6,0.1L446.5,106.3" />
                    <path className="st62" id="path3802" d="M447,117.9c-0.5,0.3-1,0-1-0.7v-8.7c0-0.7,0.4-1.5,1-1.8l0.1-0.1c0.5-0.3,1,0,1,0.7v8.7&#xA;&#x9;&#x9;&#x9;c0,0.7-0.4,1.5-1,1.8L447,117.9" />
                    <polygon className="st59" id="reflection_1_" points="442.4,88.8 442.4,193.8 372.8,105.3 372.8,48.6 &#x9;&#x9;" />
                </g>
                <g id="layerPhoneScreen" transform={transform}>
                    {(this.props.rx) && <path className="st38" id="path4142" d="M428.7,104.7l-1.7-1v-1.3l1.7,1V104.7" />}
                    {(this.state.blink[28]) && <path className="st38" id="path4138" d="M428.7,108.9l-1.7-1v-3l1.7,1V108.9" />}
                    {(this.state.blink[31]) && <path className="st38" id="path4140" d="M428.7,114.1l-1.7-1.2v-3.6l1.7,1V114.1" />}
                    {(this.state.blink[35]) && <path className="st38" id="path4128" d="M428.7,120.1l-1.7-1v-3.8l1.7,1V120.1" />}

                    {(this.state.blink[39]) && <path className="st38" id="path4442" d="M431.9,106.5l-2-1.1V104l2,1.1V106.5" />}
                    {(this.state.blink[43]) && <path className="st38" id="path4458" d="M431.9,115.3l-2-1.1v-7.7l2,1.1V115.3" />}
                    {(this.state.blink[48]) && <path className="st38" id="path4474" d="M431.9,119.6l-2-1.1v-3l2,1.1V119.6" />}
                    {(this.state.blink[51]) && <path className="st38" id="path4490" d="M431.9,124l-2-1.1v-3l2,1.1V124" />}
                    {(this.state.blink[55]) && <path className="st38" id="path4554" d="M431.9,128.4l-2-1.1v-3l2,1.1V128.4" />}
                    {(this.state.blink[59]) && <path className="st38" id="path4586" d="M431.9,132.7l-3.2-1.8v-1.3l3.2,1.8V132.7" />}

                    {(this.props.tx) && <linearGradient id="path4442_1_" gradientTransform="matrix(5.775283e-15 -1.286836e-04 1.286836e-04 5.775283e-15 -50330.3555 -32671.6543)" gradientUnits="userSpaceOnUse" x1="429.9703" x2="431.9282" y1="105.2617" y2="105.2617">
                        <stop style={{ "stopColor": "#66C2DA" }} offset="0" />
                        <stop style={{ "stopColor": "#69C6D9" }} offset="1" />
                    </linearGradient>}

                    {(this.state.blink[65]) && <linearGradient id="path4458_1_" gradientTransform="matrix(5.775283e-15 -1.286836e-04 1.286836e-04 5.775283e-15 -50330.3555 -32671.6543)" gradientUnits="userSpaceOnUse" x1="429.9703" x2="431.9282" y1="110.9467" y2="110.9467">
                        <stop style={{ "stopColor": "#66C2DA" }} offset="0" />
                        <stop style={{ "stopColor": "#69C6D9" }} offset="1" />
                    </linearGradient>}

                    {(this.state.blink[68]) && <linearGradient id="path4474_1_" gradientTransform="matrix(5.775283e-15 -1.286836e-04 1.286836e-04 5.775283e-15 -50330.3555 -32671.6543)" gradientUnits="userSpaceOnUse" x1="429.9703" x2="431.9282" y1="117.4995" y2="117.4995">
                        <stop style={{ "stopColor": "#66C2DA" }} offset="0" />
                        <stop style={{ "stopColor": "#69C6D9" }} offset="1" />
                    </linearGradient>}

                    {(this.state.blink[71]) && <linearGradient id="path4490_1_" gradientTransform="matrix(1.637088e-13 -3.647723e-03 -3.647723e-03 -1.637088e-13 -50329.1016 -32673.3184)" gradientUnits="userSpaceOnUse" x1="429.9739" x2="431.9318" y1="121.901" y2="121.901">
                        <stop style={{ "stopColor": "#66C2DA" }} offset="0" />
                        <stop style={{ "stopColor": "#69C6D9" }} offset="1" />
                    </linearGradient>}
                    {(this.state.blink[76]) && <linearGradient id="path4554_1_" gradientTransform="matrix(1.637088e-13 -3.647723e-03 -3.647723e-03 -1.637088e-13 -50329.1016 -32673.3184)" gradientUnits="userSpaceOnUse" x1="429.9739" x2="431.9318" y1="126.301" y2="126.301">
                        <stop style={{ "stopColor": "#66C2DA" }} offset="0" />
                        <stop style={{ "stopColor": "#69C6D9" }} offset="1" />
                    </linearGradient>}
                    {(this.state.blink[84]) && <linearGradient id="path4586_1_" gradientTransform="matrix(4.640563e-12 -0.1034 0.1034 4.640563e-12 -50334.7188 -32753.2207)" gradientUnits="userSpaceOnUse" x1="-318584.4688" x2="-318583.4688" y1="490957.9688" y2="490957.9688">
                        <stop style={{ "stopColor": "#66C2DA" }} offset="0" />
                        <stop style={{ "stopColor": "#69C6D9" }} offset="1" />
                    </linearGradient>}
                </g>
            </g>

        )
    }
}





/*
 {(this.state.blink[40]) && <path className="st63" id="path4128" d="M428.7,120.1l-1.7-1v-3.8l1.7,1V120.1" />}
                    {(this.state.blink[55]) && <path className="st64" id="path4138" d="M428.7,108.9l-1.7-1v-3l1.7,1V108.9" />}
                    {(this.state.blink[55]) && <path className="st64" id="path4140" d="M428.7,114.1l-1.7-1.2v-3.6l1.7,1V114.1" />}
                    {(this.state.blink[55]) && <path className="st64" id="path4142" d="M428.7,104.7l-1.7-1v-1.3l1.7,1V104.7" />}
                    {(this.state.blink[55]) && <path className="st65" id="path4442" d="M431.9,106.5l-2-1.1V104l2,1.1V106.5" />}
                    {(this.state.blink[30]) && <path className="st66" id="path4458" d="M431.9,115.3l-2-1.1v-7.7l2,1.1V115.3" />}
                    {(this.state.blink[35]) && <path className="st67" id="path4474" d="M431.9,119.6l-2-1.1v-3l2,1.1V119.6" />}
                    {(this.state.blink[38]) && <path className="st68" id="path4490" d="M431.9,124l-2-1.1v-3l2,1.1V124" />}
                    {(this.state.blink[41]) && <path className="st69" id="path4554" d="M431.9,128.4l-2-1.1v-3l2,1.1V128.4" />}
                    {(this.state.blink[45]) && <path className="st70" id="path4586" d="M431.9,132.7l-3.2-1.8v-1.3l3.2,1.8V132.7" />}

                    {(this.state.blink[48]) && <linearGradient id="path4442_1_" gradientTransform="matrix(5.775283e-15 -1.286836e-04 1.286836e-04 5.775283e-15 -50330.3555 -32671.6543)" gradientUnits="userSpaceOnUse" x1="429.9703" x2="431.9282" y1="105.2617" y2="105.2617">
                        <stop style={{ "stopColor": "#66C2DA" }} offset="0" />
                        <stop style={{ "stopColor": "#69C6D9" }} offset="1" />
                    </linearGradient>}

                    {(this.state.blink[50]) && <linearGradient id="path4458_1_" gradientTransform="matrix(5.775283e-15 -1.286836e-04 1.286836e-04 5.775283e-15 -50330.3555 -32671.6543)" gradientUnits="userSpaceOnUse" x1="429.9703" x2="431.9282" y1="110.9467" y2="110.9467">
                        <stop style={{ "stopColor": "#66C2DA" }} offset="0" />
                        <stop style={{ "stopColor": "#69C6D9" }} offset="1" />
                    </linearGradient>}

                    {(this.state.blink[52]) && <linearGradient id="path4474_1_" gradientTransform="matrix(5.775283e-15 -1.286836e-04 1.286836e-04 5.775283e-15 -50330.3555 -32671.6543)" gradientUnits="userSpaceOnUse" x1="429.9703" x2="431.9282" y1="117.4995" y2="117.4995">
                        <stop style={{ "stopColor": "#66C2DA" }} offset="0" />
                        <stop style={{ "stopColor": "#69C6D9" }} offset="1" />
                    </linearGradient>}

                    {(this.state.blink[58]) && <linearGradient id="path4490_1_" gradientTransform="matrix(1.637088e-13 -3.647723e-03 -3.647723e-03 -1.637088e-13 -50329.1016 -32673.3184)" gradientUnits="userSpaceOnUse" x1="429.9739" x2="431.9318" y1="121.901" y2="121.901">
                        <stop style={{ "stopColor": "#66C2DA" }} offset="0" />
                        <stop style={{ "stopColor": "#69C6D9" }} offset="1" />
                    </linearGradient>}
                    {(this.state.blink[60]) && <linearGradient id="path4554_1_" gradientTransform="matrix(1.637088e-13 -3.647723e-03 -3.647723e-03 -1.637088e-13 -50329.1016 -32673.3184)" gradientUnits="userSpaceOnUse" x1="429.9739" x2="431.9318" y1="126.301" y2="126.301">
                        <stop style={{ "stopColor": "#66C2DA" }} offset="0" />
                        <stop style={{ "stopColor": "#69C6D9" }} offset="1" />
                    </linearGradient>}
                    {(this.state.blink[65]) && <linearGradient id="path4586_1_" gradientTransform="matrix(4.640563e-12 -0.1034 0.1034 4.640563e-12 -50334.7188 -32753.2207)" gradientUnits="userSpaceOnUse" x1="-318584.4688" x2="-318583.4688" y1="490957.9688" y2="490957.9688">
                        <stop style={{ "stopColor": "#66C2DA" }} offset="0" />
                        <stop style={{ "stopColor": "#69C6D9" }} offset="1" />
                    </linearGradient>}
                    */