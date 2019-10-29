import { LogEvent } from "./interfaces"

/*
import { createLogger, format, transports } from 'winston';
const { label, combine, timestamp , prettyPrint, json, colorize, splat } = format;

export const logger:any = createLogger({
  format: combine(
        timestamp(),
        format.json(),
      ),
  transports: [
    new transports.Console({format: combine(format.timestamp(), format.prettyPrint({colorize:true}))}),
    new transports.File({ filename: './error.log' , level: 'error'  }),
    new transports.File({ filename: './info.log' , level: 'info'  }),
  ],
  exitOnError: false,
});

*/

class Logger {
  logverbosity: number;
  showdata: boolean = false;

  constructor() {
    this.logverbosity = 1;
  }

  /**
   * Logging
   * @param event message test
   */
  log(event: LogEvent) {

    // less logging.. we only want to know about errors.
    //if (event.level != "error") { return; }

    if (event.message) {
      var tabs = "\t"
      if (event.message.length < 10) { tabs = "\t\t" }

      var data = "";
      if (this.showdata) {
        if (event.data) { data = JSON.stringify(event.data) }
      }

      var leveltabs = "\t"
      if (event.level.length <= 5) {
        leveltabs = "\t\t"
      }

      var level = event.level;
      var processid, group;

      if (process) {
        processid = process.pid;
      }

      if (processid == undefined) { processid = "" }

      if (event.group) {
        group = event.group
      } else { group = "" }

      console.log(new Date().toISOString() + " " + padString(group) + " " + padString(event.level) + padString(processid) + " " + event.message + tabs + data);
    }
  }

}


function padString(instr) {
  return String(instr + "                 ").slice(0, 15);
}

export const logger = new Logger();