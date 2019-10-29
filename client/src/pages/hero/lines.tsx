import React from "react";

interface MyProps { rx: boolean, tx: boolean, opacity?: number, yoffset?: number }
interface MyState { }

export class Lines extends React.Component<MyProps, MyState> {
    state = {
        blink: []
    };

    counter = 0;
    max = 100;
    frame = 0;

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

        this.frame += 1;



        if (this.counter < this.max) {
            this.counter++;
            blink[this.counter] = true;
            this.setState({ blink })
        } else {
            this.counter = 0;
            var blink: any = []
            for (var a = 0; a <= this.max; a++) {
                blink.push(false);
            }
            this.setState({ blink }) // initial all off;
        }
    }

    render() {
        var linesToDisplay = [];

        //circledashes
        var circledashesvisibility = (this.props.rx || this.props.tx) ? 1 : 0;
        var rx = (this.props.rx) ? 0 : 1
        var tx = (this.props.tx) ? 0 : 1
        var nrx = (!this.props.rx) ? 0 : 1
        var ntx = (!this.props.tx) ? 0 : 1

        var colA = "hsla(" + Math.round(this.frame % 360) + ", 100%, 50%, 1)"
        var colServer = "hsla(" + Math.round((this.frame + 15) % 360) + ", 100%, 50%, 1)"
        var colB = "hsla(" + Math.round((this.frame + 120) % 360) + ", 100%, 50%, 1)"
        var colC = "hsla(" + Math.round((this.frame - 120) % 360) + ", 100%, 50%, 1)"
        var colD = "hsla(" + Math.round((this.frame + 240) % 360) + ", 100%, 50%, 1)"



        var transform1: any = "translate(0 " + (Math.sin((this.frame * 1) / 25) * 2) + ")"
        var transform2: any = "translate(0 " + (Math.sin((this.frame * 1 + 30) / 25) * 2) + ")"
        var transform3: any = "translate(0 " + (Math.sin((this.frame * 1 + 60) / 25) * 2) + ")"
        var transform4: any = "translate(0 " + (Math.sin((this.frame * 1 + 100) / 25) * 2) + ")"
        var transform5: any = "translate(0 " + (Math.sin((this.frame * 1 + 130) / 25) * 2) + ")"
        var transform6: any = "translate(0 " + (Math.sin((this.frame * 1 + 160) / 25) * 2) + ")"

        // var colServer1 = "hsla(" + Math.round((this.frame + 0) % 360) + ", 100%, 50%, 1)"
        // var colServer2 = "hsla(" + Math.round((this.frame + 10) % 360) + ", 100%, 50%, 1)"
        // var colServer3 = "hsla(" + Math.round((this.frame + 20) % 360) + ", 100%, 50%, 1)"
        // var colServer4 = "hsla(" + Math.round((this.frame + 30) % 360) + ", 100%, 50%, 1)"
        // var colServer5 = "hsla(" + Math.round((this.frame + 40) % 360) + ", 100%, 50%, 1)"
        // var colServer6 = "hsla(" + Math.round((this.frame + 50) % 360) + ", 100%, 50%, 1)"

        var colServer1 = "hsla(" + ((Math.sin((this.frame * 5) / 150) * 30)) + ", 100%, 50%, 1)"
        var colServer2 = "hsla(" + ((Math.sin((this.frame * 5 + 30) / 150) * 15) + 40) + ", 100%, 50%, 1)"
        var colServer3 = "hsla(" + ((Math.sin((this.frame * 5 + 60) / 150) * 15) + 70) + ", 100%, 50%, 1)"
        var colServer4 = "hsla(" + ((Math.sin((this.frame * 5 + 100) / 150) * 15) + 140) + ", 100%, 50%, 1)"
        var colServer5 = "hsla(" + ((Math.sin((this.frame * 5 + 130) / 150) * 15) + 180) + ", 100%, 50%, 1)"
        var colServer6 = "hsla(" + ((Math.sin((this.frame * 5 + 160) / 150) * 15) + 200) + ", 100%, 50%, 1)"


        var colWhite = "hsla(100, 0%, 50%, 1)"
        var colWhite = "hsla(100, 0%, 50%, 1)"

        // laptopmain
        var colLaptopMain = "hsla(" + ((Math.sin((this.frame * 5 + 100) / 75) * 15) + 140) + ", 100%, 50%, 1)"
        //1
        var colLaptopTS1 = "hsla(" + ((Math.sin((this.frame * 5 + 100) / 65) * 15) + 80) + ", 100%, 50%, 1)"
        //2
        var colLaptopTS2 = "hsla(" + ((Math.sin((this.frame * 5 + 100) / 55) * 15) + 55) + ", 100%, 50%, 1)"
        //3
        var colLaptopTS3 = "hsla(" + ((Math.sin((this.frame * 5 + 100) / 70) * 15) + 30) + ", 100%, 50%, 1)"
        //4
        var colLaptopTS4 = "hsla(" + ((Math.sin((this.frame * 5 + 100) / 60) * 15) + 10) + ", 100%, 50%, 1)"
        //servermain
        var colServerMain = "hsla(" + ((Math.sin((this.frame * 5 + 100) / 75) * 15) + -20) + ", 100%, 50%, 1)"


        // 3
        var colWatchTS3 = "hsla(" + ((Math.sin((this.frame * 5 + 100) / 75) * 20) + 260) + ", 100%, 50%, 1)"


        // 2
        var colWatchTS2 = "hsla(" + ((Math.sin((this.frame * 5 + 100) / 70) * 15) + 240) + ", 100%, 50%, 1)"
        // 1
        var colWatchTS1 = "hsla(" + ((Math.sin((this.frame * 5 + 100) / 65) * 15) + 230) + ", 100%, 50%, 1)"
        // watchmain
        var colWatchMain = "hsla(" + ((Math.sin((this.frame * 5 + 100) / 60) * 15) + 200) + ", 100%, 50%, 1)"

        var yoffset = (this.props.yoffset) ? this.props.yoffset : 0;
        var maintranslate = "translate(0 " + Math.round(yoffset) + ")"
        var mainopacity = (this.props.opacity) ? this.props.opacity : 1;
        return (
            <g id="layerLines" transform={maintranslate} opacity={mainopacity.toFixed(2)}>

                {(1) && <path fill={colServerMain} opacity={1} id="lineServerJustUnderBase" d="M311.5,326c-0.8,0-1.6-0.2-2.2-0.5l-86-49.9l-1.5-0.9l-5.8-3.4c-1.3-0.8-1.1-2.1,0.4-2.9&#xA;&#x9;&#x9;l0.5-0.3l0,0l2.8-1.6c0.1,0,0.1,0.1,0.2,0.1l1.3,0.7v1.6l0,0c0,0.4,0.3,0.9,0.8,1.2l86.9,50.4c0.5,0.3,1.3,0.5,2,0.5&#xA;&#x9;&#x9;c0.9,0,1.9-0.2,2.6-0.7l58.1-33.6c0.7-0.4,1.1-1,1.1-1.5l0,0v-1l0.9-0.5l0.1-0.1l4,2.3c1.3,0.8,1.1,2.1-0.4,2.9l-5.4,3.1l-1.5,0.9&#xA;&#x9;&#x9;l-56,32.4C313.6,325.7,312.5,326,311.5,326" />}

                {(1) && <path fill={colServerMain} opacity={1} id="SERVERMAIN" d="M311.5,337c-1,0-1.9-0.2-2.6-0.6l-93.2-54.1c-0.8-0.5-1.3-1.1-1.3-1.9&#xA;&#x9;&#x9;c0-0.9,0.6-1.7,1.6-2.3l5.8-3.3l1.5,0.9l-6.5,3.8c-0.6,0.4-0.9,0.8-0.9,1c0,0.3,0.3,0.5,0.5,0.6l93.2,54.1c0.5,0.3,1.1,0.4,1.8,0.4&#xA;&#x9;&#x9;c0.9,0,1.8-0.2,2.5-0.6l63.1-36.4c0.6-0.4,0.9-0.8,0.9-1c0-0.3-0.3-0.5-0.5-0.6l-6.9-4l1.5-0.9l6.2,3.6c0.8,0.5,1.3,1.2,1.3,1.9&#xA;&#x9;&#x9;c0,0.9-0.6,1.7-1.6,2.3l-63.1,36.3C313.8,336.7,312.6,337,311.5,337" />}

                {(1) && <path fill={colLaptopTS4} opacity={1} id="linefromservertolaptopcircle" d="M221.8,308.3c-1,0-1.9-0.2-2.8-0.7l-18-10.4l0.8-1.3l18,10.4c1.3,0.7,2.8,0.7,4.1,0&#xA;&#x9;&#x9;l17.8-10.3l0.8,1.3l-17.8,10.3C223.7,308,222.8,308.3,221.8,308.3" />}
                {(1) && <path fill={colLaptopTS3} opacity={1} id="laptopNodeCircleOutside" d="M191.7,284.6c-3.2,0-6.5,0.7-8.9,2.1c-2.2,1.3-3.5,3-3.5,4.7s1.2,3.4,3.5,4.7&#xA;&#x9;&#x9;c4.9,2.8,12.9,2.8,17.9,0c2.2-1.3,3.5-3,3.5-4.7c0-1.8-1.2-3.4-3.5-4.7C198.1,285.3,194.9,284.6,191.7,284.6L191.7,284.6z&#xA;&#x9;&#x9; M191.7,299.8c-3.5,0-7-0.8-9.7-2.3c-2.7-1.6-4.2-3.7-4.2-6s1.5-4.4,4.2-6c5.3-3.1,14-3.1,19.4,0c2.7,1.6,4.2,3.7,4.2,6&#xA;&#x9;&#x9;s-1.5,4.4-4.2,6C198.7,299,195.2,299.8,191.7,299.8" />}
                {(1) && <path fill={colLaptopTS2} className="st38" opacity={1} id="laptopNodeCircleInside" d="M188,289.3c2-1.2,5.3-1.2,7.4,0c2,1.2,2,3.1,0,4.3s-5.3,1.2-7.4,0&#xA;&#x9;&#x9;C185.9,292.4,185.9,290.5,188,289.3z M184.8,287.5c-3.8,2.2-3.8,5.7,0,7.9c3.8,2.2,9.9,2.2,13.7,0s3.8-5.7,0-7.9&#xA;&#x9;&#x9;S188.6,285.3,184.8,287.5" />}
                {(1) && <path fill={colLaptopTS1} opacity={1} id="laptopToServerNode" d="M162.3,309.2c-0.8,0-1.6-0.2-2.4-0.6l-16.1-9.6l0.7-1.2l16.1,9.6c1,0.6,2.3,0.6,3.3,0&#xA;&#x9;&#x9;l22.2-12.8l0.7,1.2l-22.2,12.8C163.9,308.9,163.1,309.2,162.3,309.2" />}

                {(1) && <path fill={colLaptopMain} opacity={1} id="LAPTOPMAINLINE" d="M37.6,263c-0.2,0.1-0.2,0.3-0.2,0.3s0,0.2,0.2,0.3l79.6,46c1.9,1.1,4.2,1.1,6.1,0l46.1-26.6&#xA;&#x9;&#x9;c0.2-0.1,0.2-0.3,0.2-0.3c0-0.1,0-0.2-0.2-0.3l-82.6-47.7L37.6,263z M120.2,311.8c-1.3,0-2.6-0.3-3.7-1l-79.6-46&#xA;&#x9;&#x9;c-0.6-0.3-0.9-0.9-0.9-1.5s0.3-1.2,0.9-1.5L86.7,233l83.3,48.1c0.6,0.3,0.9,0.9,0.9,1.5s-0.3,1.2-0.9,1.5l-46,26.7&#xA;&#x9;&#x9;C122.8,311.5,121.5,311.8,120.2,311.8" />}

                {(1) && <path className="st38" opacity={rx} id="lineWatch09" d="M385,329.6l4.6,0.6l-1.1-2.6L385,329.6z M390.6,331.7L390.6,331.7l-7.7-1.1&#xA;&#x9;&#x9;c-0.3,0-0.5-0.2-0.5-0.5c-0.1-0.3,0.1-0.6,0.3-0.7l5.8-3.3c0.2-0.1,0.4-0.1,0.5-0.1c0.2,0.1,0.3,0.2,0.4,0.4l1.8,4.4&#xA;&#x9;&#x9;c0.1,0.2,0.1,0.5-0.1,0.6C391,331.6,390.8,331.7,390.6,331.7" />}
                {(1) && <path className="st38" opacity={tx} id="lineWatch08" d="M378.2,325.7l4.6,0.6l-1.1-2.6L378.2,325.7z M383.9,327.8L383.9,327.8l-7.7-1.1&#xA;&#x9;&#x9;c-0.3,0-0.5-0.2-0.5-0.5c-0.1-0.3,0.1-0.5,0.3-0.7l5.8-3.3c0.2-0.1,0.4-0.1,0.5-0.1c0.2,0.1,0.3,0.2,0.4,0.4l1.8,4.4&#xA;&#x9;&#x9;c0.1,0.2,0.1,0.5-0.1,0.6C384.2,327.7,384.1,327.8,383.9,327.8" />}
                {(1) && <path className="st38" opacity={nrx} id="lineWatch07" d="M357.2,340.2l6.7,0.9l-5.1,2.9L357.2,340.2z" />}
                {(1) && <path className="st38" opacity={ntx} id="lineWatch06" d="M363.2,343.6l6.7,0.9l-5.1,2.9L363.2,343.6z" />}

                {(1) && <path fill={colWatchTS3} opacity={1} id="lineFromServerToWatchCircle" d="M361.3,381.5l-0.7-1.2l38.8-23.1c0.7-0.4,1.2-1.2,1.2-2.1c0-0.9-0.4-1.6-1.1-2.1l-54.4-34.8&#xA;&#x9;&#x9;l0.8-1.2l54.4,34.8c1.1,0.7,1.8,2,1.8,3.3s-0.7,2.6-1.9,3.2L361.3,381.5" />}

                {(1) && <path fill={colWatchMain} className="st38" opacity={circledashesvisibility} id="watchCircles" d="M354.5,385.3c-0.1,0-0.2,0-0.3-0.1l-0.1-0.1c-1.3-0.7-3-1.2-4.9-1.3c-0.4,0-0.7-0.4-0.7-0.7&#xA;&#x9;&#x9;c0-0.4,0.3-0.7,0.7-0.7c2.1,0.1,4,0.7,5.5,1.5h0.1c0.3,0.2,0.4,0.6,0.2,0.9C355.1,385.1,354.8,385.3,354.5,385.3L354.5,385.3z&#xA;&#x9;&#x9; M339.5,387.8c-0.4-0.1-0.6-0.5-0.5-0.9c0.4-1.2,1.3-2.2,2.7-3c0.5-0.3,1.2-0.6,1.8-0.8c0.4-0.1,0.8,0.1,0.9,0.4&#xA;&#x9;&#x9;c0.1,0.4-0.1,0.8-0.4,0.9c-0.6,0.2-1.1,0.4-1.6,0.7c-1.1,0.6-1.8,1.4-2.1,2.2C340.2,387.6,339.9,387.8,339.5,387.8L339.5,387.8z&#xA;&#x9;&#x9; M352.9,393.1c-0.3,0-0.6-0.2-0.7-0.5c-0.1-0.4,0.1-0.8,0.4-0.9c0.6-0.2,1.1-0.4,1.5-0.7c1.1-0.6,1.8-1.4,2.1-2.3&#xA;&#x9;&#x9;c0.1-0.4,0.5-0.6,0.9-0.5s0.6,0.5,0.5,0.9c-0.4,1.2-1.3,2.2-2.7,3.1c-0.5,0.3-1.1,0.6-1.8,0.8L352.9,393.1L352.9,393.1z&#xA;&#x9;&#x9; M347.4,393.8L347.4,393.8c-2.2-0.1-4.1-0.7-5.6-1.5l0,0c-0.3-0.2-0.4-0.6-0.2-0.9c0.2-0.3,0.6-0.4,1-0.2c1.3,0.8,3.1,1.2,5,1.4&#xA;&#x9;&#x9;c0.4,0,0.7,0.4,0.7,0.7C348.1,393.5,347.8,393.8,347.4,393.8" />}
                {(1) && <path fill={colWatchTS2} opacity={1} id="lineWatch03" d="M336.1,381.5c-3.1,1.8-4.9,4.2-4.9,6.6c0,2.5,1.7,4.8,4.9,6.6c6.7,3.9,17.7,3.9,24.4,0&#xA;&#x9;&#x9;c3.1-1.8,4.9-4.2,4.9-6.6c0-2.5-1.7-4.8-4.9-6.6c-3.4-1.9-7.8-2.9-12.2-2.9C343.9,378.5,339.5,379.5,336.1,381.5z M348.4,399&#xA;&#x9;&#x9;c-4.7,0-9.3-1-12.9-3.1S330,391,330,388s2-5.8,5.5-7.9c7.1-4.1,18.7-4.1,25.8,0c3.6,2.1,5.6,4.9,5.6,7.9s-2,5.8-5.6,7.9&#xA;&#x9;&#x9;C357.7,398,353,399,348.4,399" />}
                {(1) && <path fill={colWatchTS1} opacity={1} id="lineWatch02" d="M417.3,430c-0.9,0-1.9-0.2-2.7-0.7l-54.9-32.8l0.7-1.2l54.9,32.8c1.1,0.7,2.6,0.7,3.8,0.1&#xA;&#x9;&#x9;l42.4-22.1l0.6,1.2l-42.4,22.1C419,429.8,418.1,430,417.3,430" />}
                {(1) && <path fill={colWatchMain} opacity={1} id="lineWatch01" d="M476.9,414.9c-1.1,0-2.2-0.3-3-0.8L454,402.7c-1-0.6-1.5-1.3-1.5-2.2c0-0.7,0.4-1.4,1.2-1.8&#xA;&#x9;&#x9;l5.4-3.1c0.4,0.3,0.8,0.6,1.2,0.9l-5.8,3.4c-0.2,0.1-0.5,0.3-0.5,0.6c0,0.2,0.2,0.6,0.8,1l19.8,11.4c0.7,0.4,1.5,0.6,2.4,0.6&#xA;&#x9;&#x9;c0.7,0,1.3-0.1,1.7-0.4l13.1-7.6c0.2-0.1,0.5-0.3,0.5-0.6c0-0.2-0.2-0.6-0.8-1l-3.4-2c0.1-0.1,0.2-0.1,0.3-0.2l1.1-0.6l2.7,1.6&#xA;&#x9;&#x9;c1,0.6,1.5,1.3,1.5,2.2c0,0.7-0.4,1.4-1.2,1.8l-13.1,7.6C478.6,414.7,477.8,414.9,476.9,414.9" />}

                {/* {(1) && <path transform={transform1} fill={colServer1} opacity={1} id="lineServer10" d="M257.2,237.1c-0.2-0.4-0.3-0.8-0.3-1.4v-90.3c0-1.6,0.8-3.3,1.9-4.3&#xA;&#x9;&#x9;c0.2-0.2,0.4-0.3,0.6-0.4l0.4-0.2c0.4-0.2,0.7-0.3,1-0.3c0.9,0,1.5,0.8,1.5,2.2v78.1l-1.7,1c-0.8,0.5-1.2,1.1-1.2,1.7l0,0v11.2l0,0&#xA;&#x9;&#x9;c0,0.4,0.2,0.8,0.6,1.1L257.2,237.1" />}
                {(1) && <path transform={transform2} fill={colServer2} opacity={1} id="lineServer09" d="M247.8,251.9c-0.2-0.4-0.3-0.8-0.3-1.4v-90.3c0-1.6,0.8-3.3,1.9-4.3&#xA;&#x9;&#x9;c0.2-0.2,0.4-0.3,0.6-0.4l0.4-0.2c0.3-0.2,0.7-0.3,1-0.3c0.9,0,1.5,0.8,1.5,2.2v78.1l-1.7,1c-0.8,0.5-1.2,1.1-1.2,1.7l0,0v11.2l0,0&#xA;&#x9;&#x9;c0,0.4,0.2,0.8,0.6,1.1L247.8,251.9" />}
                {(1) && <path transform={transform3} fill={colServer3} opacity={1} id="lineServer08" d="M238.7,255.7c-0.2-0.4-0.3-0.8-0.3-1.4V164c0-1.6,0.8-3.3,1.9-4.3c0.2-0.2,0.4-0.3,0.6-0.4&#xA;&#x9;&#x9;l0.4-0.2c0.3-0.2,0.7-0.3,1-0.3c0.9,0,1.5,0.8,1.5,2.2v78.1l-1.7,1c-0.8,0.5-1.2,1.1-1.2,1.7l0,0V253l0,0c0,0.4,0.2,0.8,0.6,1.1&#xA;&#x9;&#x9;L238.7,255.7" />}
                {(1) && <path transform={transform4} fill={colServer4} opacity={1} id="lineServer07" d="M227.1,254c-0.2-0.4-0.3-0.8-0.3-1.4v-90.3c0-1.6,0.8-3.3,1.9-4.3c0.2-0.2,0.4-0.3,0.6-0.4&#xA;&#x9;&#x9;l0.4-0.2c0.3-0.2,0.7-0.3,1-0.3c0.9,0,1.5,0.8,1.5,2.2v78.1l-1.7,1c-0.8,0.5-1.2,1.1-1.2,1.7l0,0v11.2l0,0c0,0.4,0.2,0.8,0.6,1.1&#xA;&#x9;&#x9;L227.1,254" />}
                {(1) && <path transform={transform5} fill={colServer5} opacity={1} id="lineServer06" d="M216.9,268.1c-0.2-0.4-0.3-0.8-0.3-1.4v-90.3c0-1.6,0.8-3.3,1.9-4.3&#xA;&#x9;&#x9;c0.2-0.2,0.4-0.3,0.6-0.4l0.4-0.2c0.3-0.2,0.7-0.3,1-0.3c0.9,0,1.5,0.8,1.5,2.2v78.1l-1.7,1c-0.8,0.5-1.2,1.1-1.2,1.7l0,0v11.2l0,0&#xA;&#x9;&#x9;c0,0.4,0.2,0.8,0.6,1.1L216.9,268.1" />}
                {(1) && <path transform={transform6} fill={colServer6} opacity={1} id="lineServer05" d="M208.1,225.4c-0.9,0-1.5-0.8-1.5-2.2v-33.8c0-1.4,0.6-2.9,1.5-3.9c0.3-0.3,0.6-0.6,1-0.8&#xA;&#x9;&#x9;l0.4-0.2c0.3-0.2,0.6-0.3,0.9-0.3c0,0,0,0,0.1,0l0,0c0.9,0,1.5,0.8,1.5,2.2v33.8c0,1.7-0.9,3.6-2.1,4.5c-0.1,0.1-0.2,0.2-0.3,0.2&#xA;&#x9;&#x9;l-0.4,0.2C208.7,225.3,208.4,225.4,208.1,225.4" />} */}
            </g>
        )
    }
}