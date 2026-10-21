// One regional Mercator projection shared by the map, route and aircraft.
// Static geometry is prepared once. Scroll updates only affine transforms.
export const DEL = [77.1,28.56];
export const BOM = [72.87,19.09];
const RAD = Math.PI/180;
const originY = Math.log(Math.tan(Math.PI/4+24*RAD/2))/RAD;
const clamp = value => Math.max(0,Math.min(1,value));
const span = (value,from,to) => clamp((value-from)/(to-from));
const ease = value => value<.5 ? 4*value**3 : 1-(-2*value+2)**3/2;
const mix = (from,to,t) => from+(to-from)*t;

export function project([lon,lat]) {
  return [(lon-75)*72,(originY-Math.log(Math.tan(Math.PI/4+lat*RAD/2))/RAD)*72];
}
const northWest=project([60,36]),southEast=project([92,8]);
export const MAP_EXTENT = {x:northWest[0],y:northWest[1],width:southEast[0]-northWest[0],height:southEast[1]-northWest[1]};

function greatCircle(from,to,count) {
  const [l1,p1]=from.map(n=>n*RAD),[l2,p2]=to.map(n=>n*RAD);
  const distance=2*Math.asin(Math.sqrt(Math.sin((p2-p1)/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin((l2-l1)/2)**2));
  return Array.from({length:count+1},(_,i)=>{
    const t=i/count,a=Math.sin((1-t)*distance)/Math.sin(distance),b=Math.sin(t*distance)/Math.sin(distance);
    const x=a*Math.cos(p1)*Math.cos(l1)+b*Math.cos(p2)*Math.cos(l2);
    const y=a*Math.cos(p1)*Math.sin(l1)+b*Math.cos(p2)*Math.sin(l2);
    const z=a*Math.sin(p1)+b*Math.sin(p2);
    return project([Math.atan2(y,x)/RAD,Math.atan2(z,Math.hypot(x,y))/RAD]);
  });
}
export const ROUTE=greatCircle(DEL,BOM,80);
export const ROUTE_PATH=ROUTE.map(([x,y],i)=>`${i?'L':'M'}${x.toFixed(2)},${y.toFixed(2)}`).join('');
export function pointAt(value) {
  const index=clamp(value)*(ROUTE.length-1),start=Math.min(ROUTE.length-2,Math.floor(index)),t=index-start;
  return [mix(ROUTE[start][0],ROUTE[start+1][0],t),mix(ROUTE[start][1],ROUTE[start+1][1],t)];
}
export const mapPoint=(matrix,[x,y])=>[matrix[0]*x+matrix[2]*y+matrix[4],matrix[1]*x+matrix[3]*y+matrix[5]];

export function flightFrame(value,width,height) {
  width=Math.max(1,width);height=Math.max(1,height);
  const progress=ease(span(value,.78,.92));
  const dive=ease(span(value,.76,.81))*(1-ease(span(value,.92,.97)));
  const from=ROUTE[0],to=ROUTE.at(-1),position=pointAt(progress);
  const overview=Math.min(Math.max(120,width-80)/(Math.abs(to[0]-from[0])+140),Math.max(160,height-240)/(Math.abs(to[1]-from[1])+160));
  const scale=overview*mix(1,width<height?4.4:5.2,dive);
  const angle=-208*RAD*dive,cos=Math.cos(angle),sin=Math.sin(angle),tilt=Math.cos(58*RAD*dive);
  const center=[mix((from[0]+to[0])/2,position[0],dive),mix((from[1]+to[1])/2,position[1],dive)];
  const a=cos*scale,b=sin*scale*tilt,c=-sin*scale,d=cos*scale*tilt;
  const matrix=[a,b,c,d,width/2-a*center[0]-c*center[1],height/2-b*center[0]-d*center[1]];
  const aircraft=mapPoint(matrix,position);
  const before=mapPoint(matrix,pointAt(Math.max(0,progress-.002))),after=mapPoint(matrix,pointAt(Math.min(1,progress+.002)));
  return {matrix,progress,dive,aircraft,angle:Math.atan2(after[1]-before[1],after[0]-before[0])/RAD+90,planeScale:mix(.1,width<760?.27:.44,dive),delhi:mapPoint(matrix,from),mumbai:mapPoint(matrix,to)};
}
