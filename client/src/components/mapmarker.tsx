import React from "react";
import PropTypes from 'prop-types'
import { colors, opacity } from "../theme";
import { CorePacket } from "../../../server/shared/interfaces";
import { escapeNonUnicode } from "../../../server/shared/shared";
import { Link } from "react-router-dom";
import { blendrgba } from "../../../server/utils/utils";
import { moment } from "../utils/momentalt";

// import pin from './img/pin.png'
// import pinRetina from './img/pin@2x.png'
// import pinHover from './img/pin-hover.png'
// import pinHoverRetina from './img/pin-hover@2x.png'

const imageOffset = {
    left: 15,
    top: 31
}

interface MarkerProps {
    device: CorePacket;
    anchor: any;
    payload: any;
    onClick: Function;
    opacity?: number;
    [index: string]: any;
}

interface MarkerState {

}

export default class Marker extends React.Component<MarkerProps, MarkerState> {
    state = {
        showDetails: false
    }

    // static propTypes = process.env.BABEL_ENV === 'inferno' ? {} : {
    //     // input, passed to events
    //     anchor: PropTypes.array.isRequired,
    //     payload: PropTypes.any,

    //     // optional modifiers
    //     hover: PropTypes.bool,

    //     // callbacks
    //     onClick: PropTypes.func,
    //     onContextMenu: PropTypes.func,
    //     onMouseOver: PropTypes.func,
    //     onMouseOut: PropTypes.func,

    //     // pigeon variables
    //     left: PropTypes.number,
    //     top: PropTypes.number,

    //     // pigeon functions
    //     latLngToPixel: PropTypes.func,
    //     pixelToLatLng: PropTypes.func
    // }

    constructor(props) {
        super(props)

        this.state = {
            showDetails: false
        }
    }

    // what do you expect to get back with the event
    eventParameters = (event) => ({
        // event,
        // anchor: this.props.anchor,
        // payload: this.props.payload
    })

    // controls
    isRetina() {
        //return typeof window !== 'undefined' && window.devicePixelRatio >= 2
    }

    // modifiers
    isHover() {
        //return typeof this.props.hover === 'boolean' ? this.props.hover : this.state.hover
    }

    image() {
        //return this.isRetina() ? (this.isHover() ? pinHoverRetina : pinRetina) : (this.isHover() ? pinHover : pin)
    }

    // lifecycle

    componentDidMount() {
        // let images = this.isRetina() ? [
        //     pinRetina, pinHoverRetina
        // ] : [
        //         pin, pinHover
        //     ]

        // images.forEach(image => {
        //     let img = new window.Image()
        //     img.src = image
        // })
    }

    // delegators

    handleClick = (event) => {
        //this.props.onClick && this.props.onClick(this.eventParameters(event))
        this.setState({ showDetails: !this.state.showDetails })
    }

    handleContextMenu = (event) => {
        //this.props.onContextMenu && this.props.onContextMenu(this.eventParameters(event))
    }

    handleMouseOver = (event) => {
        // this.props.onMouseOver && this.props.onMouseOver(this.eventParameters(event))
        this.setState({ showDetails: true })
    }

    handleMouseOut = (event) => {
        //this.props.onMouseOut && this.props.onMouseOut(this.eventParameters(event))
        this.setState({ showDetails: false })
    }

    /** same as device list item */

    /* returns a ratio of how long ago something occurred between 0 and 1. Intended to be used as a time fade. */
    timeratio(timestamp, duration, options?: ({ clamp: boolean })): number {
        var activity = new Date(timestamp);
        var clock = new Date();
        var delta = clock.getTime() - activity.getTime();

        var ratio = (duration - delta) / duration
        if (options) {
            if (options.clamp == true) {
                if (ratio < 0) {
                    ratio = 0;
                }
                if (ratio > 1) {
                    ratio = 1;
                }
            }
        }

        return ratio
    }

    calcColorFade = () => {
        var quickfade = this.timeratio(this.props.device["_last_seen"], 1000 * 60 * 60, { clamp: true });
        var slowfade = this.timeratio(this.props.device["_last_seen"], 1000 * 60 * 60 * 24, { clamp: true });



        return blendrgba({ r: 75, g: 75, b: 75, a: 1 }, { r: 25, g: 179, b: 109, a: 1.0 }, slowfade)
    }

    // render

    render() {
        const { left, top, onClick } = this.props

        var color = (this.state.showDetails) ? colors.good : colors.spotA
        var opacityFade = (this.props.opacity) ? this.props.opacity : 1
        const style: any = {
            position: 'absolute',
            //transform: `translate(${left - imageOffset.left}px, ${top - imageOffset.top}px)`,
            transform: `translate(${left - 9}px, ${top - 24}px)`,
            cursor: onClick ? 'pointer' : 'default',
            color: this.calcColorFade(),
            fontSize: "24px",
            opacity: opacityFade
        }



        var styleHover: any = {
            ...colors.quickShadow, ...{
                position: 'absolute',
                //transform: `translate(${left - imageOffset.left}px, ${top - imageOffset.top}px)`,
                transform: `translate(${left - 100}px, ${top - 114}px)`,
                width: 200,
                height: 100,
                background: opacity(colors.panels, 0.8),
                borderRadius: "2px",
                padding: colors.padding,
                boxSizing: "border-box",
                textAlign: "center"
            }
        }

        var wrapperstyle = (this.state.showDetails) ? { zIndex: 1000 } : {}

        return <div style={wrapperstyle}>

            {(this.state.showDetails) &&
                <div className="arrow_box" style={styleHover}>
                    <Link to={"/u/" + this.props.device.username + "/view/" + escapeNonUnicode(this.props.device.id)} >{this.props.device.id}</Link><br />
                    <span style={{ fontSize: "75%", opacity: 0.5, fontWeight: "bold", paddingTop: 10 }}>last seen:</span><br />
                    {moment(this.props.device["_last_seen"]).fromNow()}
                </div>
            }

            <div style={style}
                className='pigeon-click-block'
                onClick={this.handleClick}
                onContextMenu={this.handleContextMenu}
            ><i className="fas fa-map-marker-alt"></i>
            </div>
        </div>



    }
}