# p5js-bubbles

> Visit my [GitHub Pages site](https://pete-rai.github.io/) to get in touch or to
see demos of this and much more.

## Overview

A bubbles visualisation for p5.js. A fun way to represent quantative data as set of bubbles
that grow, move and collide on the screen.

### Demos and Example Usage

Here are a couple of examples that you can use to understand how the visualisation looks in use:

* Click [here](https://pete-rai.github.io/p5js-bubbles/sample-bubbles.html?movies) to see an example based on _Top Grossing Movies_ (inflation adjusted)
* Click [here](https://pete-rai.github.io/p5js-bubbles/sample-bubbles.html?populations) to see an example based on _Country by Population_ (2016 figures)

### License

This project is available under [the MIT license](https://github.com/pete-rai/p5js-bubbles/blob/master/LICENSE). _Please respect the terms of the license._

### Karmaware

This software is released with the [karmaware](https://pete-rai.github.io/karmaware) tag

### Disclaimer

I've done best efforts testing on a range of modern browsers. If you find any problems,
do let me know by raising an issue [here](https://github.com/p5js-bubbles/pete-rai.github.io/issues). Better still, create a fix for the problem too and drop
in the changes; that way everyone can benefit from it.

### Dependencies

This plug relies on [p5.js](https://p5js.org/) (version 0.5.8+)

## Example Usage

Its really easy to use the Bubbles visualisation in your own project. You just need to include the script (after the main p5.js script) then declare one instance of the Bubbles class and point it to a dataset. The process is all documented below, or just take a look at one of the samples listed above.

### Declaring an Instance

In order to use this script, you *must* declare one instance of the Bubbles class in your code called 'bubbles' as shown below:

```html
 <script>
   var bubbles = new Bubbles ("mydata.json");
 </script>
```

or more fully:

```html
 <script>
   var bubbles = new Bubbles ("mydata.json", "hosting-control", onselect, tooltip);
 </script>
```

The parameters for the Bubbles class is as follows:

| Pos | Param | Description | Notes |
| --- | --- | --- | --- |
| 1 | data-source | The URL for the JSON list of data items | See below for examples |
| 2 | parent-control | The ID of the hosting parent control | Set to _null_ to fill the whole HTML body |
| 3 | onselect&nbsp;(key,&nbsp;bubble) | The callback function for when a bubble is double-clicked | Set to _null_ for no action |
| 4 | tooltip&nbsp;(key,&nbsp;bubble) | The callback function to return the bubble tooltip | Set to _null_ for no tooltip |

### Source Data Format

The data returned from your data-source must be a JSON structure that (at least) has a "key", a "name" and a "count".
The "name" is what is displayed inside each bubble and the "count" governs the bubbles area:

```json
{
    "foo1": { "name": "bar1", "count": 1000    },
    "foo2": { "name": "bar2", "count":  750    },
    "foo3": { "name": "bar3", "count":  123.45 }
}
```

You can also include other data in the JSON. These won't be read by Bubbles, but will be passed to your callback functions on-select and tooltip. For example, the 'year' data item in the example below:

```json
{
    "Forrest_Gump"  : { "name": "Forrest Gump" , "count": 680016, "year": 1994 },
    "The_Godfather" : { "name": "The Godfather", "count": 682680, "year": 1972 },
    "Jurassic_Park" : { "name": "Jurassic Park", "count": 795124, "year": 1993 },
}
```

In these examples and the project samples, we only show static data. In a real system, you could dynamically generate your dataset by reading values of a backing store or database.

### Modifiable Constants

There are several constants at the top of the script, which you can modify in order to change the behaviour and appearance.

#### Fonts

The following constants control the font inside the bubbles:

| Constant | Default | Unit | Description |
| --- | --- | --- | --- |
| FONT_FACE | "Tahoma" | string | A browser safe font (btw Tahoma is a good choice as its quite narrow) |
| FONT_HEAD | 24 | point | The Size of page heading |
| FONT_MAX | 36 | point | The Largest allowed font |
| FONT_MIN | 8 | point | The Smallest allowed font |
| FONT_STEP | 2 | >=&nbsp;1 | The font size steps, from big to small |
| FONT_PAD | 8 | pixels | Some text padding within the bubble |

#### Colors

The following constants control the colors of various things:

| Constant | Default | Unit | Description |
| --- | --- | --- | --- |
| CLR_BACK | [230, 230, 250] | [r,g,b] | Background world color |
| CLR_TEXT | [  0, 102, 153] | [r,g,b] | Bubble text color |
| CLR_BALL | [250, 250, 250] | [r,g,b] | Background bubble color |
| CLR_HOVR | [100,   0,   0] | [r,g,b] | Hovered bubble text color |
| CLR_OVER | [255, 228, 225] | [r,g,b] | Hovered background bubble color |
| CLR_TIPS | [252, 240, 173] | [r,g,b] | Tooptip color |

#### Visuals

The following constants control factors that influence appearance:

| Constant | Default | Unit | Description |
| --- | --- | --- | --- |
| VIZ_WORLD_MARGIN | 10 | pixels | The margin around edge of the world that bubbles will bounce off |
| VIZ_RIM_FRACTION | 20 | >=&nbsp;1 | The fraction of each bubble that is the rim, bigger num = smaller rim |
| VIZ_DBL_CLICK | 500 | millsecs | The time window between which two clicks becomes a double click |
| VIZ_ALPHA_DEPTH | 0.60 | >0&nbsp;&&nbsp;<=1 | The depth of fading of small bubbles, bigger num = more fading |
| VIZ_CROWDEDNESS | 0.70 | >&nbsp;0 | How crowded the world space is, bigger = more crowded (0.78 = &Pi;/4 is the ratio area of square to circle, which is about optimal) |
| VIZ_FRAME_RATE | 50 | >1&nbsp;&&nbsp;<&nbsp;60 | The frame rate and hence smoothness of animation, bigger = smoother, but slower overall |
| VIZ_FONT_RECALC | 10 | >=&nbsp;1 | How much radius must change before a font recalculation (prevents font 'flickering') |

#### Tooltips

The following constants control the tooltip appearance:

| Constant | Default | Unit | Description |
| --- | --- | --- | --- |
| TIP_WANTED | true | bool | false = no tooltips at all |
| TIP_OFFSET | 15 | pixels | The tooltip offset from mouse |
| TIP_MARGIN | 4 | pixels | The tooltip margin |
| TIP_DELAY | 1500 | millsecs | The tooltip appearance delay |
| TIP_POINTSZ | 14 | point | The tooltip font point size |

#### Physics

The following constants control bubble movement and interaction (change with care):

| Constant | Default | Unit | Description |
| --- | --- | --- | --- |
| PHYS_REBOUND | 0.75 | 0.0&nbsp;to&nbsp;1.0 | The bounce velocity factor of hitting the world boundary |
| PHYS_FRICTION | 0.80 | 0.0&nbsp;to&nbsp;1.0 | The velocity drag of hitting the world boundary |
| PHYS_BIRTH_SPEED | 4.00 | >&nbsp;0.0 | The intial velocity for new bubbles |
| PHYS_REST_JIGGLE | 0.02 | >=&nbsp;0.0 | The restlessness for existing bubbles (zero means they will eventually come to rest) |

### Background

There is no need to understand the background maths and algorithms to use the bubbles visualisation, however for those who are interested I have detailed some aspects here.

#### Proportionality of Area

TODO

#### Scaling and Crowdedness of Bubbles

TODO

#### Collisions of Bubbles

TODO

#### Fitting Text Inside Circles

TODO

_– [Pete Rai](http://www.rai.org.uk/)_
