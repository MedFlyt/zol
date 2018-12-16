#!/bin/sh

set -ex

./tools/del_node_modules.sh
npm install
npm run bootstrap
npm run build-all
npm run build-tests-all

cd packages/zol
npm publish
cd ../zol-datetime
npm publish
cd ../zol-json
npm publish
cd ../zol-math
npm publish
cd ../zol-string
npm publish

echo "All Done. Success!"
