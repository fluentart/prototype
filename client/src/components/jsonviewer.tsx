import React from "react";

interface MyProps {
  object: object;
}

interface MyState {
  [index: string]: any;
}

export class JSONviewer extends React.Component<MyProps, MyState> {
  state = {
    dragging: false
  };

  dragging = false;

  renderData = (data, level, path) => {
    if (data == null) {
    }
    if (typeof data == "string") {
      return (
        <span style={{ float: "right", color: "#CCC" }}>{data.trim()}</span>
      );
    }
    if (typeof data == "number") {
      return <span style={{ float: "right", color: "#15E47A" }}>{data}</span>;
    }
    if (typeof data == "boolean") {
      if (data == true) {
        return (
          <span style={{ float: "right", color: "#E4C315" }}>
            {data.toString()}
          </span>
        );
      } else {
        return (
          <span style={{ float: "right", color: "#15B9E4" }}>
            {data.toString()}
          </span>
        );
      }
    }
    if (typeof data == "object") {
      if (data == null) {
        return <span style={{ float: "right", color: "#f77" }}>null</span>;
      }

      if (Array.isArray(data)) {
        //Arrays
        return <div style={{}}>{this.renderObject(data, level + 1, path)}</div>;
      } else {
        //Objects

        if (Object.keys(data).length > 1) {
          return (
            <div style={{}}>{this.renderObject(data, level + 1, path)}</div>
          );
        } else {
          return (
            <div style={{}}>{this.renderObject(data, level + 1, path)}</div>
          );
        }
      }
    }
  };

  renderObject = (data, level, path) => {
    return (
      <div style={{ overflowY: "hidden", paddingBottom: 25 }}>
        {Object.keys(data).map((name, i) => {
          if (typeof data[name] == "object") {
            return (
              <div
                key={i}
                className="dataView"
                draggable
                onDragStart={e =>
                  this.onDragStart(
                    e,
                    name,
                    i,
                    data[name],
                    level,
                    path + "." + name
                  )
                }
              >
                <div className="dataViewName" style={{ color: "" }}>
                  {name}
                </div>
                <div className="dataViewValue">
                  {this.renderData(data[name], level, path + "." + name)}
                </div>
                <div style={{ clear: "both" }} />
              </div>
            );
          } else {
            return (
              <div
                key={i}
                className="dataView"
                draggable
                onDragStart={e =>
                  this.onDragStart(
                    e,
                    name,
                    i,
                    data[name],
                    level,
                    path + "." + name
                  )
                }
              >
                <div className="dataViewName" style={{ float: "left" }}>
                  {name}
                </div>
                <div className="dataViewValue" style={{ float: "right" }}>
                  {this.renderData(data[name], level, path + "." + name)}
                </div>
                <div style={{ clear: "both" }} />
              </div>
            );
          }
        })}
      </div>
    );
  };

  onDragStart = (e, name, i, data, level, path) => {
    e.dataTransfer.setData("text/plain", "anything");

    if (this.dragging == false) {
      //console.log({ e, name, i, data, level, path })
      this.dragging = true;
      e.data = data;
      e.dataname = name;
      e.datapath = path.slice(5)

      setTimeout(() => {
        this.dragging = false;
      }, 500);
    } else {
      //console.log("already dragging")
    }
  };

  render() {
    if (this.props.object == undefined) {
      return <div></div>;
    }
    return (
      <div
        style={{
          width: "100%",
          height: "100%"
        }}
      >
        <div>{this.renderObject(this.props.object, 0, "root")}</div>
      </div>
    );
  }
}
