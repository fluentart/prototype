import React from "react";

interface MyProps { rx: Function, tx: Function }
interface MyState { }

export class AnimNodeGfx extends React.Component<MyProps, MyState> {
    state = {
        blink: [],
        rx: false,
        tx: false

    };

    frame = 0;
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

        if (this.frame < this.max) {

            blink[this.frame] = true;

            this.frame++;
        } else {
            this.frame = 0;
            var blink: any = []
            for (var a = 0; a <= this.max; a++) {
                blink.push(false);
            }
        }

        var rx = false
        var tx = false

        // data 
        if ((this.frame > 15) && (this.frame < 65)) {
            if (Math.random() > 0.25) { rx = true; }
            if (Math.random() > 0.25) { tx = true; }
        }

        // blink
        if (Math.round((this.frame / 4) % 5) == 0) { rx = true; }
        if (Math.round((this.frame / 4) % 5) == 1) { tx = true; }


        this.setState({ blink, rx, tx })

        this.props.tx(tx);
        this.props.rx(rx);
    }



    render() {
        var linesToDisplay = [];

        var rx = this.state.rx;
        var tx = this.state.tx;

        // 3 part circles
        var circledashes = (rx || tx) ? true : false;

        var dataOpacity = 0
        if (rx) dataOpacity += 0.5;
        if (tx) dataOpacity += 0.5;
        var colA = "hsla(" + Math.round((this.frame + 150) % 360) + ", 100%, 50%, 1)"
        var colB = "hsla(" + Math.round((this.frame + 120) % 360) + ", 100%, 50%, 1)"
        var colWhite = "#FFFFFF"

        return (
            <g id="layerLines" transform="translate(0 2)">
                <g transform="translate(0 10)" opacity={0.1}>
                    <g transform="scale(1 -1) translate(0 -205)">
                        {(this.state.blink[62]) && <path className="st38" id="textLine12" d="M294.8,73.5h-5v-2.3h5V73.5" />}
                        {(this.state.blink[59]) && <path className="st38" id="textLine11" d="M305,69.4h2.8v-2.2H305V69.4z" />}
                        {(this.state.blink[57]) && <path className="st38" id="textLine10" d="M300.1,69.4h2.8v-2.2h-2.8V69.4z" />}
                        {(this.state.blink[55]) && <path className="st38" id="textLine09" d="M297.7,69.4h-7.8v-2.2h7.8V69.4" />}
                        {(this.state.blink[53]) && <path className="st38" id="textLine08" d="M294.8,65.4h-5v-2.3h5V65.4" />}
                        {(this.state.blink[50]) && <path className="st38" id="textLine07" d="M302.1,61.3h9.4V59h-9.4V61.3z" />}
                        {(this.state.blink[45]) && <path className="st38" id="textLine06" d="M300.4,61.3h-10.5V59h10.5V61.3" />}
                        {(this.state.blink[40]) && <path className="st38" id="textLine05" d="M317.6,57.3h3.7V55h-3.7V57.3z" />}
                        {(this.state.blink[36]) && <path className="st38" id="textLine04" d="M312.2,57.3h3.7V55h-3.7V57.3z" />}
                        {(this.state.blink[33]) && <path className="st38" id="textLine03" d="M306.8,57.3h3.7V55h-3.7V57.3z" />}
                        {(this.state.blink[29]) && <path className="st38" id="textLine02" d="M305,57.3h-9.3V55h9.3V57.3" />}
                        {(this.state.blink[23]) && <path className="st38" id="textLine01" d="M294,57.3h-4.1V55h4.1V57.3" />}
                        {(this.state.blink[20]) && <rect fill={colA} height="10.3" id="linePhone08" width="2.9" x="282.5" y="55" />}
                        {(this.state.blink[17]) && <rect fill={colA} height="4.6" id="linePhone07" width="2.9" x="282.5" y="67.2" />}
                        {(this.state.blink[12]) && <path fill={colA} id="linePhone06" d="M284,108c-0.8,0-1.4-0.6-1.4-1.4V74.2h2.9v32.3C285.4,107.3,284.8,108,284,108L284,108" />}

                    </g>

                    {(this.state.tx) && <path className="st38" id="arrowA" d="M293.5,126.6l6.3,0.9l-1.5-3.7L293.5,126.6z M300.9,128.9L300.9,128.9l-9.4-1.3&#xA;&#x9;&#x9;c-0.3,0-0.5-0.2-0.5-0.5c-0.1-0.3,0.1-0.5,0.3-0.7l7.1-4.1c0.2-0.1,0.4-0.1,0.5-0.1c0.2,0.1,0.3,0.2,0.4,0.4l2.3,5.4&#xA;&#x9;&#x9;c0.1,0.2,0.1,0.5-0.1,0.6C301.3,128.8,301.1,128.9,300.9,128.9" />}
                    {(this.state.rx) && <path className="st38" id="arrowB" d="M311.5,112.1l9,1.3l-6.8,3.9L311.5,112.1z" />}

                    {(this.state.blink[11]) && <path fill={colA} className="st38" id="linePhone05" d="M277.8,110.6c-3.4-2-3.4-5.2,0-7.1s8.9-2,12.4,0s3.4,5.2,0,7.1S281.2,112.5,277.8,110.6" />}

                    <path fill={colB} id="linePhone09" d="M238.2,178.8l-1.4,0.8l-39.7-22.9c-0.7-0.4-1-1-1-1.8s0.4-1.4,1.1-1.8l72.9-40.2l0.7,1.2&#xA;&#x9;&#x9;l-72.9,40.2c-0.3,0.2-0.3,0.4-0.3,0.6c0,0.1,0,0.4,0.3,0.6L238.2,178.8z" />
                    <path fill={colA} opacity={(dataOpacity + 0.5).toFixed(1)} d="M373,196.2l-72.7-42.5c-0.7-0.4-1.1-1.2-1.1-2s0.4-1.6,1.2-2l27.6-15.3&#xA;&#x9;&#x9;c0.2-0.1,0.2-0.3,0.2-0.3c0-0.1,0-0.2-0.2-0.3l-31.8-18.9l0.7-1.2l31.8,18.9c0.6,0.3,0.9,0.9,0.9,1.6s-0.4,1.2-0.9,1.5L301.1,151&#xA;&#x9;&#x9;c-0.3,0.2-0.5,0.4-0.5,0.8c0,0.2,0,0.5,0.4,0.8l72.7,42.5L373,196.2" />
                    <path fill={colA} opacity={(dataOpacity + 0.5).toFixed(1)} d="M443.1,242.6c-0.8,0-1.5-0.2-2-0.5l-71.7-41.4c-0.7-0.4-1.1-1-1.1-1.7c0-0.8,0.5-1.5,1.3-2&#xA;&#x9;&#x9;l5.2-3l1.4,0.8l-5.9,3.4c-0.4,0.2-0.6,0.5-0.6,0.8c0,0.2,0.2,0.4,0.4,0.5l71.7,41.4c0.3,0.2,0.8,0.3,1.3,0.3c0.6,0,1.3-0.1,1.8-0.4&#xA;&#x9;&#x9;l6.1-3.5c0.4-0.2,0.6-0.5,0.6-0.8c0-0.2-0.2-0.4-0.4-0.5l-8.1-4.7l1.4-0.8l7.4,4.3c0.7,0.4,1.1,1,1.1,1.7c0,0.8-0.5,1.5-1.3,2&#xA;&#x9;&#x9;l-6.1,3.5C444.8,242.4,444,242.6,443.1,242.6" />



                    {(circledashes) && <path fill={colB} id="linePhone04" d="M271.3,109.2c-0.3,0-0.6-0.2-0.7-0.5c-0.2-0.6-0.3-1.1-0.3-1.7c0-2.3,1.5-4.4,4.1-5.9&#xA;&#x9;&#x9;c1.1-0.6,2.3-1.1,3.6-1.5c0.4-0.1,0.8,0.1,0.9,0.5s-0.1,0.8-0.5,0.9c-1.2,0.3-2.3,0.8-3.2,1.3c-2.2,1.3-3.4,2.9-3.4,4.7&#xA;&#x9;&#x9;c0,0.4,0.1,0.8,0.2,1.2c0.1,0.4-0.1,0.8-0.4,0.9L271.3,109.2L271.3,109.2z M296.6,109.5c-0.1,0-0.2,0-0.3-0.1&#xA;&#x9;&#x9;c-0.4-0.2-0.5-0.6-0.4-0.9c0.2-0.5,0.3-1,0.3-1.5c0-1.7-1.2-3.4-3.4-4.7c-0.9-0.5-1.8-0.9-2.9-1.2c-0.4-0.1-0.6-0.5-0.5-0.9&#xA;&#x9;&#x9;s0.5-0.6,0.9-0.5c1.2,0.4,2.2,0.8,3.2,1.4c2.7,1.5,4.1,3.6,4.1,5.9c0,0.7-0.1,1.4-0.4,2.1C297.1,109.3,296.8,109.5,296.6,109.5&#xA;&#x9;&#x9;L296.6,109.5z M284,115.2c-3.6,0-7-0.8-9.5-2.3c-0.3-0.2-0.4-0.6-0.3-1c0.2-0.3,0.6-0.4,1-0.3c2.3,1.4,5.5,2.1,8.8,2.1&#xA;&#x9;&#x9;c0.8,0,1.6,0,2.4-0.1c0.4,0,0.7,0.2,0.8,0.6c0,0.4-0.2,0.7-0.6,0.8C285.7,115.1,284.8,115.2,284,115.2" />}
                    {(this.state.blink[5]) && <path fill={colB} id="linePhone03" d="M284,97.4c-4.4,0-8.8,1-12.2,2.9c-3.1,1.8-4.9,4.2-4.9,6.6c0,2.5,1.7,4.8,4.8,6.6&#xA;&#x9;&#x9;c6.7,3.9,17.7,3.9,24.4,0c3.1-1.8,4.9-4.2,4.9-6.6s-1.7-4.8-4.8-6.6C292.8,98.4,288.4,97.4,284,97.4L284,97.4z M284,117.9&#xA;&#x9;&#x9;c-4.7,0-9.3-1-12.9-3.1s-5.6-4.9-5.6-7.9s2-5.8,5.6-7.9c7.1-4.1,18.7-4.1,25.8,0c3.6,2.1,5.6,4.9,5.6,7.9s-2,5.8-5.6,7.9&#xA;&#x9;&#x9;S288.7,117.9,284,117.9" />}
                </g>

                <g opacity={1}>
                    {(this.state.blink[62]) && <path className="st38" id="textLine12" d="M294.8,73.5h-5v-2.3h5V73.5" />}
                    {(this.state.blink[59]) && <path className="st38" id="textLine11" d="M305,69.4h2.8v-2.2H305V69.4z" />}
                    {(this.state.blink[57]) && <path className="st38" id="textLine10" d="M300.1,69.4h2.8v-2.2h-2.8V69.4z" />}
                    {(this.state.blink[55]) && <path className="st38" id="textLine09" d="M297.7,69.4h-7.8v-2.2h7.8V69.4" />}
                    {(this.state.blink[53]) && <path className="st38" id="textLine08" d="M294.8,65.4h-5v-2.3h5V65.4" />}
                    {(this.state.blink[50]) && <path className="st38" id="textLine07" d="M302.1,61.3h9.4V59h-9.4V61.3z" />}
                    {(this.state.blink[45]) && <path className="st38" id="textLine06" d="M300.4,61.3h-10.5V59h10.5V61.3" />}
                    {(this.state.blink[40]) && <path className="st38" id="textLine05" d="M317.6,57.3h3.7V55h-3.7V57.3z" />}
                    {(this.state.blink[36]) && <path className="st38" id="textLine04" d="M312.2,57.3h3.7V55h-3.7V57.3z" />}
                    {(this.state.blink[33]) && <path className="st38" id="textLine03" d="M306.8,57.3h3.7V55h-3.7V57.3z" />}
                    {(this.state.blink[29]) && <path className="st38" id="textLine02" d="M305,57.3h-9.3V55h9.3V57.3" />}
                    {(this.state.blink[23]) && <path className="st38" id="textLine01" d="M294,57.3h-4.1V55h4.1V57.3" />}
                    {(this.state.tx) && <path className="st38" id="arrowA" d="M293.5,126.6l6.3,0.9l-1.5-3.7L293.5,126.6z M300.9,128.9L300.9,128.9l-9.4-1.3&#xA;&#x9;&#x9;c-0.3,0-0.5-0.2-0.5-0.5c-0.1-0.3,0.1-0.5,0.3-0.7l7.1-4.1c0.2-0.1,0.4-0.1,0.5-0.1c0.2,0.1,0.3,0.2,0.4,0.4l2.3,5.4&#xA;&#x9;&#x9;c0.1,0.2,0.1,0.5-0.1,0.6C301.3,128.8,301.1,128.9,300.9,128.9" />}
                    {(this.state.rx) && <path className="st38" id="arrowB" d="M311.5,112.1l9,1.3l-6.8,3.9L311.5,112.1z" />}

                    {(this.state.blink[11]) && <path fill={colA} className="st38" id="linePhone05" d="M277.8,110.6c-3.4-2-3.4-5.2,0-7.1s8.9-2,12.4,0s3.4,5.2,0,7.1S281.2,112.5,277.8,110.6" />}

                    <path fill={colB} id="linePhone09" d="M238.2,178.8l-1.4,0.8l-39.7-22.9c-0.7-0.4-1-1-1-1.8s0.4-1.4,1.1-1.8l72.9-40.2l0.7,1.2&#xA;&#x9;&#x9;l-72.9,40.2c-0.3,0.2-0.3,0.4-0.3,0.6c0,0.1,0,0.4,0.3,0.6L238.2,178.8z" />
                    <path fill={colA} opacity={(dataOpacity + 0.5).toFixed(1)} d="M373,196.2l-72.7-42.5c-0.7-0.4-1.1-1.2-1.1-2s0.4-1.6,1.2-2l27.6-15.3&#xA;&#x9;&#x9;c0.2-0.1,0.2-0.3,0.2-0.3c0-0.1,0-0.2-0.2-0.3l-31.8-18.9l0.7-1.2l31.8,18.9c0.6,0.3,0.9,0.9,0.9,1.6s-0.4,1.2-0.9,1.5L301.1,151&#xA;&#x9;&#x9;c-0.3,0.2-0.5,0.4-0.5,0.8c0,0.2,0,0.5,0.4,0.8l72.7,42.5L373,196.2" />
                    <path fill={colA} opacity={(dataOpacity + 0.5).toFixed(1)} d="M443.1,242.6c-0.8,0-1.5-0.2-2-0.5l-71.7-41.4c-0.7-0.4-1.1-1-1.1-1.7c0-0.8,0.5-1.5,1.3-2&#xA;&#x9;&#x9;l5.2-3l1.4,0.8l-5.9,3.4c-0.4,0.2-0.6,0.5-0.6,0.8c0,0.2,0.2,0.4,0.4,0.5l71.7,41.4c0.3,0.2,0.8,0.3,1.3,0.3c0.6,0,1.3-0.1,1.8-0.4&#xA;&#x9;&#x9;l6.1-3.5c0.4-0.2,0.6-0.5,0.6-0.8c0-0.2-0.2-0.4-0.4-0.5l-8.1-4.7l1.4-0.8l7.4,4.3c0.7,0.4,1.1,1,1.1,1.7c0,0.8-0.5,1.5-1.3,2&#xA;&#x9;&#x9;l-6.1,3.5C444.8,242.4,444,242.6,443.1,242.6" />


                    {(this.state.blink[20]) && <rect fill={colA} height="10.3" id="linePhone08" width="2.9" x="282.5" y="55" />}
                    {(this.state.blink[17]) && <rect fill={colA} height="4.6" id="linePhone07" width="2.9" x="282.5" y="67.2" />}
                    {(this.state.blink[12]) && <path fill={colA} id="linePhone06" d="M284,108c-0.8,0-1.4-0.6-1.4-1.4V74.2h2.9v32.3C285.4,107.3,284.8,108,284,108L284,108" />}

                    {(circledashes) && <path fill={colB} id="linePhone04" d="M271.3,109.2c-0.3,0-0.6-0.2-0.7-0.5c-0.2-0.6-0.3-1.1-0.3-1.7c0-2.3,1.5-4.4,4.1-5.9&#xA;&#x9;&#x9;c1.1-0.6,2.3-1.1,3.6-1.5c0.4-0.1,0.8,0.1,0.9,0.5s-0.1,0.8-0.5,0.9c-1.2,0.3-2.3,0.8-3.2,1.3c-2.2,1.3-3.4,2.9-3.4,4.7&#xA;&#x9;&#x9;c0,0.4,0.1,0.8,0.2,1.2c0.1,0.4-0.1,0.8-0.4,0.9L271.3,109.2L271.3,109.2z M296.6,109.5c-0.1,0-0.2,0-0.3-0.1&#xA;&#x9;&#x9;c-0.4-0.2-0.5-0.6-0.4-0.9c0.2-0.5,0.3-1,0.3-1.5c0-1.7-1.2-3.4-3.4-4.7c-0.9-0.5-1.8-0.9-2.9-1.2c-0.4-0.1-0.6-0.5-0.5-0.9&#xA;&#x9;&#x9;s0.5-0.6,0.9-0.5c1.2,0.4,2.2,0.8,3.2,1.4c2.7,1.5,4.1,3.6,4.1,5.9c0,0.7-0.1,1.4-0.4,2.1C297.1,109.3,296.8,109.5,296.6,109.5&#xA;&#x9;&#x9;L296.6,109.5z M284,115.2c-3.6,0-7-0.8-9.5-2.3c-0.3-0.2-0.4-0.6-0.3-1c0.2-0.3,0.6-0.4,1-0.3c2.3,1.4,5.5,2.1,8.8,2.1&#xA;&#x9;&#x9;c0.8,0,1.6,0,2.4-0.1c0.4,0,0.7,0.2,0.8,0.6c0,0.4-0.2,0.7-0.6,0.8C285.7,115.1,284.8,115.2,284,115.2" />}
                    {(this.state.blink[5]) && <path fill={colB} id="linePhone03" d="M284,97.4c-4.4,0-8.8,1-12.2,2.9c-3.1,1.8-4.9,4.2-4.9,6.6c0,2.5,1.7,4.8,4.8,6.6&#xA;&#x9;&#x9;c6.7,3.9,17.7,3.9,24.4,0c3.1-1.8,4.9-4.2,4.9-6.6s-1.7-4.8-4.8-6.6C292.8,98.4,288.4,97.4,284,97.4L284,97.4z M284,117.9&#xA;&#x9;&#x9;c-4.7,0-9.3-1-12.9-3.1s-5.6-4.9-5.6-7.9s2-5.8,5.6-7.9c7.1-4.1,18.7-4.1,25.8,0c3.6,2.1,5.6,4.9,5.6,7.9s-2,5.8-5.6,7.9&#xA;&#x9;&#x9;S288.7,117.9,284,117.9" />}
                </g>

            </g>
        )
    }
}
