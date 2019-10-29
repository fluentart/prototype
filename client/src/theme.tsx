import { string } from "prop-types";

var parse = require('color-parse')

export const prototypeTheme = {
  padding: "10px"
};

export const colors = {
  spotA: "rgb(242, 53, 58)", // main colour
  spotB: "#3b3b3b", // "#0a203b", //gradientBot
  spotC: "#1a1a1a", // "#09111a", //gradientTop
  spotD: "#353535", // "#0d243d", //background
  spotE: "#fff",
  spotF: "#2b2b2b", //"#17232b", //panelbg
  panels: "#262626", // "#131E27",
  good: "#119752", //green buttons
  public: "#1fb6d1", //blue planet
  share: "#18d66d", // green share
  warning: "#ecb81f",
  alarm: "#d9283a",
  checkmark: "#16d271", //green
  transparent: 0.15,
  lines: "#333", //same as borders below
  borders: "1px solid rgba(255,255,255,0.2)", // 
  padding: 10,
  widgetDefault: "#11CC88",
  backgroundPopup: "rgba(32, 32, 32, 0.95)",
  bgDarker: "rgba(0,0,0,0.2)",
  p: { color: "#999999", fontSize: "15pt" },
  cardShadow: {
    //background: "rgb(35, 35, 35)",
    background: "rgb(40,40,40)",
    width: "100%",
    position: "relative",
    boxSizing: "border-box",
    boxShadow: "0px 10px 15px -2px rgba(0,0,0,0.25)",
    border: "1px solid rgba(128,128,128,0.03)",
    borderTop: "2px solid rgba(255, 255, 255, 0.15)"
  },
  quickShadow: {
    boxShadow: "0px 10px 15px -2px rgba(0,0,0,0.25)",
    border: "1px solid rgba(128,128,128,0.03)",
    borderTop: "2px solid rgba(255, 255, 255, 0.15)"
  }

};

// DEFINE COLOURS HERE:

const paddings = {
  default: 10
};

export const theme: any = {
  global: {
    colors: {
      brand: "#f00",
      "light-2": "#0f0",
      text: {
        light: "rgba(0, 0, 0, 0.87)"
      },
      primary: "#0f0",
      "neutral-2": "#f00",
      panelbg: colors.panels
    },
    edgeSize: {
      small: "14px"
    },
    elevation: {
      light: {
        medium:
          "0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12)"
      }
    },
    font: {
      size: "14px",
      height: "20px"
    },
    // NAVBAR
    navbar: {
      background: colors.panels
    },
    navbarlogo: {
      padding: paddings.default,
      float: "right"
    },
    navlinksmall: {
      float: "right",
      padding: paddings.default
    },
    navlinklarge: {
      float: "right",
      padding: paddings.default
    },
    searchresults: {
      background: colors.panels,
      border: "1px solid"
    },
    //////
    devicelist: {
      columnleftselect: {
        marginLeft: 6,
        padding: 5,
        width: 20,
        textAlign: "center"
      },
      columnleftsortselect: {
        width: 26,
        marginLeft: 6,
        padding: 5
      },
      addevice: {
        borderRadius: 0,
        margin: 0,
        padding: paddings.default,
        background: colors.good
      },
      columns: {
        flex: "0 1",
        padding: 5,
        textAlign: "center"
      },
      columnFill: {
        flex: "1",
        padding: 5,
        textAlign: "left"
      },
      timecolumn: {
        flex: 1,
        textAlign: "right",
        padding: 5
      },
      menusortcollapse: {
        flex: "0 1",
        padding: "5px 6px 0 1px",
        textAlign: "center",
        cursor: "pointer"
      },
      menutimesort: {
        width: 50,
        cursor: "pointer"
      },
      menucolumn: {
        width: 26,
        cursor: "pointer"
      },
      menuright: {
        width: 26,
        marginRight: 9,
        cursor: "pointer"
      }
    },
    titlebars: {
      background: colors.panels
    },
    menubars: {
      background: shadeColor(colors.panels, 15)
    },
    menuoptions: {
      padding: paddings.default,
      float: "left"
    },
    sortbuttons: {
      textAlign: "center",
      float: "left"
    },
    responsive: {
      wrapper: {
        display: "flex",
        flexDirection: "column"
      },
      navbar: { flex: "0 1 auto" },
      content: {
        flex: "1 1 auto",
        flexFlow: "column",
        //overflowY: "auto",
        boxSizing: "border-box",
        width: "100%"
      }
    }
  },
  paddings,
  colors
};


/** used for calendar widget 
 * todo: simplify themes.
*/
export const widgetCalendar: any = {
  dayBorderColor: "rgba(247, 57, 67,0)",
  monthBorderColor: "rgba(125, 125, 125,0.15)",
  emptyColor: "rgba(125, 125, 125,0.05)",
  margin: {
    "top": 35,
    "right": 35,
    "bottom": 0,
    "left": 35
  },
  colors: [
    "rgba(255, 57, 66,0.4)",
    "rgba(255, 57, 66,0.5)",
    "rgba(255, 57, 66,0.7)",
    "rgba(255, 57, 66,1)"
  ],
  theme: {
    axis: {
      domain: {
        line: {
          strokeWidth: 0,
          stroke: '#889eae',
        },
      },
      ticks: {
        line: {
          stroke: '#889eae',
        },
        text: {
          fill: '#6a7c89',
        },
      },
      legend: {
        fill: '#fff',
      },
    },
    grid: {
      line: {
        stroke: 'rgba(125, 125, 125,0.15)',
      },
    },
    legends: {
      text: {
        fontSize: 12,
        fill: '#fff',
        color: "#fff"
      },
    },
    tooltip: {
      container: {
        fontSize: '13px',
        background: 'rgba(18, 28, 33, 0.9)',
        color: '#ddd',
      }
    },
    labels: {
      text: {
        fill: '#eee',
        fontSize: 12,
        fontWeight: 500,
      },
    }
  }
}

// https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors

export function shadeColor(color, percent) {
  var R = parseInt(color.substring(1, 3), 16);
  var G = parseInt(color.substring(3, 5), 16);
  var B = parseInt(color.substring(5, 7), 16);

  R = Math.round((R * (100 + percent)) / 100);
  G = Math.round((G * (100 + percent)) / 100);
  B = Math.round((B * (100 + percent)) / 100);

  R = R < 255 ? R : 255;
  G = G < 255 ? G : 255;
  B = B < 255 ? B : 255;

  var RR = R.toString(16).length == 1 ? "0" + R.toString(16) : R.toString(16);
  var GG = G.toString(16).length == 1 ? "0" + G.toString(16) : G.toString(16);
  var BB = B.toString(16).length == 1 ? "0" + B.toString(16) : B.toString(16);

  return "#" + RR + GG + BB;
}

export var icons = [];

export function opacity(color: string, opacity: number): string {
  var col = parse(color);
  const colourout: string = "rgba(" + col.values[0] + "," + col.values[1] + "," + col.values[2] + "," + opacity + ")"
  return colourout;
}

/*
 ,
    extend: props => `
     text-transform: uppercase;
     font-size: 0.875rem;
     font-weight: 500;
     line-height: normal;

    ${!props.primary && `
      border-color: ${rgba(normalizeColor(props.colorValue, props.theme), 0.5)};
      color: ${normalizeColor(props.colorValue, props.theme)};
      :hover {
         box-shadow: none;
         background-color: ${rgba(normalizeColor(props.colorValue, props.theme), 0.08)};
       }
     `}
   `,
   */
