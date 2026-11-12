export const baseline={background:"#080a16",surface:"#111422",text:"#f5f4fa",muted:"#a3a4b8",accent:"#c2a1ff",blue:"#343db5",pink:"#f51b7e",actionPink:"#bc155f",success:"#34d399",danger:"#fb7185",warning:"#fbbf24",info:"#38bdf8",shadow:"#000000",onPrimary:"#ffffff"};
export function rgb(hex){return hex.replace("#","").slice(0,6).match(/../g).map(value=>parseInt(value,16));}
function hsl(hex){
 const [r,g,b]=rgb(hex).map(v=>v/255),max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min,l=(max+min)/2;
 let h=0,s=0;if(d){s=d/(1-Math.abs(2*l-1));h=max===r?((g-b)/d)%6:max===g?(b-r)/d+2:(r-g)/d+4;h=((h*60)%360+360)%360;}return[h,s,l];
}
function hexOf([h,s,l]){
 h=((h%360)+360)%360;const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;
 const v=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];
 return "#"+v.map(n=>Math.round(Math.min(1,Math.max(0,n+m))*255).toString(16).padStart(2,"0")).join("");
}
export function paint(hex,colors){
 const raw="#"+hex.slice(0,6),alpha=hex.slice(6);let role=Object.keys(baseline).find(key=>baseline[key]===raw);
 const old=hsl(raw);
 if(!role){
  if(old[2]<0.025)role="shadow";
  else if(old[1]<0.12)role=old[2]>.5?"text":"surface";
  else if(old[2]<.17)role=old[2]<.07?"background":"surface";
  else if(old[1]<.28)role="muted";
  else role=["accent","blue","pink","success","danger","warning","info"].sort((a,b)=>{const distance=k=>{const delta=Math.abs(hsl(baseline[k])[0]-old[0]);return Math.min(delta,360-delta);};return distance(a)-distance(b);})[0];
 }
 const before=hsl(baseline[role]),after=hsl(colors[role]);
 const out=hexOf([old[0]+after[0]-before[0],Math.max(0,Math.min(1,old[1]+after[1]-before[1])),Math.max(0,Math.min(1,old[2]+after[2]-before[2]))]);
 return out+alpha;
}
export function normalizeColor(value){
 if(value.startsWith("#")){let h=value.slice(1).toLowerCase();if(h.length===3||h.length===4)h=[...h].map(c=>c+c).join("");return h;}
 const body=value.slice(value.indexOf("(")+1,-1).trim();if(!/^[\d.,%\s/]+$/.test(body))return null;
 const p=body.replaceAll("/",",").split(/[,\s]+/).filter(Boolean);if(p.length<3)return null;
 const channels=p.slice(0,3).map(n=>Math.round(n.endsWith("%")?parseFloat(n)*2.55:Number(n)));
 const a=p[3]===undefined?255:Math.round((p[3].endsWith("%")?parseFloat(p[3])/100:Number(p[3]))*255);
 return channels.map(n=>Math.min(255,Math.max(0,n)).toString(16).padStart(2,"0")).join("")+(a===255?"":a.toString(16).padStart(2,"0"));
}
