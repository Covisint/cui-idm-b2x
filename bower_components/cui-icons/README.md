# cui-icons
Icon Library for Core Covisint UI Functionality

## Preparing icons before adding to the repo

### Setting up an Illustrator file

Instead of creating one Illustrator files for each icon and exporting to SVG in every instance, we can setup one Illustrator file, one artboard, & one layer per icon and export using Iconic's SVG exporter tool: https://github.com/iconic/illustrator-svg-exporter. The basic steps for setting up an Illustrator file is as follows:

1. Setup a single artboard to the size specified in the Covisint Icon Guidelines (180px x 180px)
2. Create a new layer for each Icon, add Icon. Be sure to name that layer as the icon is named in its orignal file.
3. Center Icon vertically and horizontally to artboard
4. Do not worry about about including 'selected' styles. The SVG styles can be modified through code later.

### Exporting from Illustrator to SVG

1. If you haven't already setup Iconic's SVG exporter tool in Illustrator, go here: https://github.com/iconic/illustrator-svg-exporter
2. Follow the section titled 'Setup'
3. In Illustrator, Go to File > Scripts > SVG Exporter.
4. You are now the proud parent of many beautiful SVGs! Congratulations!


## Adding Icons to the Covisint UI Icon Library

1. Add your icons to `src/resources/svg`.
2. <b>(from here on this will have to be done by jenkins)</b> Run `grunt svgmerge` from the root directory. This will read the svgs and concatenate them into 1 svg file that will go in dist/svg.
3. <b>(from here on this is optional, for demo purposes)</b> Run `node generateSvgList.js` from the root. This checks the src/resources/svg folder and outputs a file to the the root called svgList with a list of the svg files.
4. Run `grunt` to get a visual demo of all your svgs.
