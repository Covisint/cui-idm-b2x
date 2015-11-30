# cui-styleguide
Digital Style Guide for Core CUI Elements

## assets

There are two css files one can choose to include in their projects in order to access cui-styleguide styles:

* **styles.min.css**: This file is ideal for use in projects that contain no other style frameworks (ie. Bootstrap, AUI, etc.). The class names are namespaced and written with a low specificity

* **styles.specific.min.css**: This file is ideal for use in projects that contain another css framework. The styles are wrapped in an ID (#cui-wrapper, which should be added to the body element in your markup), which gives the CUI styles an extra level of specificity. This ensures CUI styles do not lose a specificity battle with other CSS frameworks used in a project.

In addition to these two CSS assets, one can access scss files. This is ideal if a user wants to @import the base files (which include vars), @import their own variable overrides and then @import the styleguide elements and blocks.