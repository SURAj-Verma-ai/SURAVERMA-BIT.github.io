"""One-time asset preparation. Normal site builds and visits use no map network.

Natural Earth 1:50m, public domain. Crop and simplify before shipping, retaining
only the Indian regional extent needed for the illustrative Delhi–Mumbai flight.
"""
from pathlib import Path
import json
import math
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / '.map-source-cache'
BOUNDS = (60, 8, 92, 36)
SCALE = 72
BASE = math.degrees(math.log(math.tan(math.pi/4 + math.radians(24)/2)))

def download(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent':'XiteAI-static-map-build'}), timeout=60) as response:
        return json.load(response)

def project(point):
    lon, lat = point[:2]
    return [(lon-75)*SCALE, (BASE-math.degrees(math.log(math.tan(math.pi/4+math.radians(lat)/2))))*SCALE]

def simplify(points, tolerance=.6):
    if len(points)<3: return points
    a,b=points[0],points[-1]
    dx,dy=b[0]-a[0],b[1]-a[1]
    length=dx*dx+dy*dy
    best,index=0,0
    for i,p in enumerate(points[1:-1],1):
        t=max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/length)) if length else 0
        distance=(p[0]-a[0]-t*dx)**2+(p[1]-a[1]-t*dy)**2
        if distance>best: best,index=distance,i
    if best>tolerance*tolerance:
        return simplify(points[:index+1],tolerance)[:-1]+simplify(points[index:],tolerance)
    return [a,b]

def clip_ring(points):
    result=[p[:2] for p in points]
    for axis,bound,sign in [(0,BOUNDS[0],1),(0,BOUNDS[2],-1),(1,BOUNDS[1],1),(1,BOUNDS[3],-1)]:
        if not result: break
        output=[]
        previous=result[-1]
        before=(previous[axis]-bound)*sign>=0
        for current in result:
            inside=(current[axis]-bound)*sign>=0
            if before!=inside:
                t=(bound-previous[axis])/(current[axis]-previous[axis])
                output.append([previous[j]+t*(current[j]-previous[j]) for j in (0,1)])
            if inside: output.append(current)
            previous,before=current,inside
        result=output
    return result

def clip_line(points):
    parts=[]
    current=[]
    for start,end in zip(points,points[1:]):
        x,y=start[:2]; dx,dy=end[0]-x,end[1]-y
        lo,hi=0,1
        for p,q in [(-dx,x-BOUNDS[0]),(dx,BOUNDS[2]-x),(-dy,y-BOUNDS[1]),(dy,BOUNDS[3]-y)]:
            if p==0:
                if q<0: lo,hi=1,0; break
            elif p<0: lo=max(lo,q/p)
            else: hi=min(hi,q/p)
        if lo<=hi:
            a=[x+lo*dx,y+lo*dy]; b=[x+hi*dx,y+hi*dy]
            if current and (abs(current[-1][0]-a[0])+abs(current[-1][1]-a[1]))>1e-5:
                parts.append(current);current=[]
            if not current: current=[a]
            current.append(b)
        elif current:
            parts.append(current);current=[]
    if current: parts.append(current)
    return parts

def path(points,closed=False):
    if len(points)<(3 if closed else 2): return ''
    projected=simplify([project(p) for p in points])
    if closed and len(projected)<4: return ''
    return 'M'+'L'.join(f'{x:.1f},{y:.1f}' for x,y in projected)+('Z' if closed else '')

def prepare():
    CACHE.mkdir(exist_ok=True)
    revision_file=CACHE/'revision.txt'
    destination=ROOT/'src/pages/xos1/sections/india-flight-map.json'
    if destination.exists(): revision=json.loads(destination.read_text(encoding='utf-8'))['revision']
    elif revision_file.exists(): revision=revision_file.read_text().strip()
    else:
        revision=download('https://api.github.com/repos/nvkelso/natural-earth-vector/commits/master')['sha']
        revision_file.write_text(revision)
    output={'bounds':list(BOUNDS),'projection':{'origin':[75,24],'scale':SCALE},'revision':revision}
    layers={'land':'ne_50m_land','states':'ne_50m_admin_1_states_provinces_lines','borders':'ne_50m_admin_0_boundary_lines_land','rivers':'ne_50m_rivers_lake_centerlines'}
    for layer,name in layers.items():
        cached=CACHE/(name+'.geojson')
        if not cached.exists():
            data=download(f'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/{revision}/geojson/{name}.geojson')
            cached.write_text(json.dumps(data))
        data=json.loads(cached.read_text())
        paths=[]
        for feature in data['features']:
            geometry=feature.get('geometry')
            if not geometry: continue
            kind=geometry['type'];coordinates=geometry['coordinates']
            if kind in ('Polygon','MultiPolygon'):
                polygons=[coordinates] if kind=='Polygon' else coordinates
                for polygon in polygons:
                    value=''.join(path(clip_ring(ring),True) for ring in polygon)
                    if value: paths.append(value)
            else:
                lines=[coordinates] if kind=='LineString' else coordinates if kind=='MultiLineString' else []
                for line in lines:
                    for part in clip_line(line):
                        value=path(part)
                        if value: paths.append(value)
        output[layer]=paths
    destination.write_text(json.dumps(output,separators=(',',':'))+'\n',encoding='utf-8')
    left,top=project([BOUNDS[0],BOUNDS[3]])
    right,bottom=project([BOUNDS[2],BOUNDS[1]])
    art=[f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{left:.4f} {top:.4f} {right-left:.4f} {bottom-top:.4f}"><title>Delhi–Mumbai regional geography</title>',f'<path fill="#cdd8d4" d="M{left},{top}H{right}V{bottom}H{left}Z"/>']
    for layer,style in [('land','fill="#ede7dc" stroke="#bdb8a7" stroke-width=".7" fill-rule="evenodd"'),('states','fill="none" stroke="#bcb7a7" stroke-width=".65" stroke-opacity=".65"'),('borders','fill="none" stroke="#ada691" stroke-width=".85"'),('rivers','fill="none" stroke="#b8cbc7" stroke-width="1.2"')]:
        art.append(f'<path {style} d="'+''.join(output[layer])+'"/>')
    art.append('</svg>')
    asset=destination.with_suffix('.svg')
    asset.write_text(''.join(art),encoding='utf-8')
    print(f'Regional vector SVG: {asset.stat().st_size:,} bytes; revision {revision[:12]}')

if __name__=='__main__': prepare()
