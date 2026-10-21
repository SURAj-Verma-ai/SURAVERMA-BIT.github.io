# Regional flight-map data

The illustrative Delhi–Mumbai flight uses a bundled vector map, rather than
a network map service. Geographic source: [Natural Earth 1:50m](https://www.naturalearthdata.com/downloads/50m-physical-vectors/), public domain.

Source repository: https://github.com/nvkelso/natural-earth-vector

The pinned revision is recorded in `india-flight-map.json`. Only the regional
extent 60°–92°E, 8°–36°N is retained, providing an overscan margin for the
rotating Delhi–Mumbai camera. Land, state lines, country lines and rivers are
clipped and simplified before export. The customer-facing bundle contains the
SVG only, with no source GeoJSON, world tiles, map fonts or map worker.

To regenerate deliberately: `python scripts/prepare-flight-map.py`. Its source
cache is ignored by Git. Normal development, production builds and page visits
use the prepared asset without contacting a map service.
