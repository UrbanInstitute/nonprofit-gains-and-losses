topojson \
  -e data/test.csv \
  --id-property +CBSAFP \
  -o data/data.json \
  -p \
  --shapefile-encoding utf8\
  -- data/shapefile/cb_2015_us_cbsa_500k.shp