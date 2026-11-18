import {spawn} from "node:child_process";
import {watch} from "node:fs";
const server=spawn(process.execPath,["node_modules/next/dist/bin/next","dev","--webpack",...process.argv.slice(2)],{stdio:"inherit"});
let timer,running=false,queued=false;
function generate(){
 if(running){queued=true;return;}
 running=true;const generator=spawn(process.execPath,["scripts/generate-theme.mjs"],{stdio:"inherit"});
 generator.once("exit",()=>{running=false;if(queued){queued=false;generate();}});
}
const watcher=watch("theme",(_,name)=>{if(name!=="theme.json")return;clearTimeout(timer);timer=setTimeout(generate,160);});
function stop(){watcher.close();clearTimeout(timer);if(server.exitCode===null)server.kill("SIGTERM");}
process.on("SIGINT",stop);process.on("SIGTERM",stop);
server.on("exit",code=>{stop();process.exitCode=code||0;});
