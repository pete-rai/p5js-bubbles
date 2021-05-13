# p5js-bubbles

> Visit my [Blog](http://www.rai.org.uk) to get in touch or to
see demos of this and much more.

## Overview

A bubbles visualization for p5js. A fun way to represent quantitative data as set of bubbles
that grow, move and collide on the screen.

### Demos and Example Usage

Here are a couple of examples that you can use to understand how the visualization looks:

* Click [here](https://pete-rai.github.io/p5js-bubbles/sample-bubbles.html?movies) to see an example based on _Top Grossing Movies_ (inflation adjusted)
* Click [here](https://pete-rai.github.io/p5js-bubbles/sample-bubbles.html?populations) to see an example based on _Country by Population_ (2016 figures)

_Note: The sample html included within this project contains useful examples of how to use the visualization. Do take a moment to read through this sample file to better understand how it all works._

> Important Note on Performance: I discovered that my script can be slow when the bubble labels are long strings. If this is the case for you, then you can probably speed things up by playing with the constant ```VIZ_FONT_RECALC``` at the top of the script. The higher you set this, the faster things will become - as it cuts down on costly font recalculating. It is currently set to 10px, which is very low. The danger is that, if its too high, you might not get the best fitted font for each bubble. Anyways, do play with this setting if you find performance is an issue for you.

### License

This project is available under [the MIT license](https://github.com/pete-rai/p5js-bubbles/blob/master/LICENSE). _Please respect the terms of the license._

### Karmaware

This software is released with the [karmaware](https://pete-rai.github.io/karmaware) tag

### Disclaimer

I've done best efforts testing on a range of modern browsers. If you find any problems,
do let me know by raising an issue [here](https://github.com/pete-rai/p5js-bubbles/issues). Better still, create a fix for the problem too and drop
in the changes; that way everyone can benefit from it.

### Dependencies

This plug relies on [p5js](https://p5js.org/) (version 0.5.8+)

## Example Usage

Its really easy to use the Bubbles visualization in your own project. You just need to include the script (after the main p5js script) then declare one instance of the Bubbles class and point it to a dataset. The process is all documented below, or just take a look at one of the samples listed above.

### Declaring an Instance

In order to use this script, you *must* declare one instance of the Bubbles class in your code (it must be called 'bubbles') as shown below:

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

The parameters for the Bubbles class are as follows:

| Pos | Param | Description | Notes |
| --- | --- | --- | --- |
| 1 | data-source | The URL for the JSON list of data items or a local JSON array | See below for examples |
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

You can also include other data in the JSON structure. These won't be read by Bubbles, but will be passed to your callback functions on-select and tooltip. For example, see the 'year' data item in the example below:

```json
{
    "Forrest_Gump"  : { "name": "Forrest Gump" , "count": 680016, "year": 1994 },
    "The_Godfather" : { "name": "The Godfather", "count": 682680, "year": 1972 },
    "Jurassic_Park" : { "name": "Jurassic Park", "count": 795124, "year": 1993 },
}
```

In these examples and the project samples, we only show static JSON data. In a real system, you could dynamically generate your JSON dataset by reading values from a backing store or database.

### Dynamic Data Sets

The easiest way to have dynamic datasets is to simply reload a new page and point the newly created bubbles object at a new data source. _The data source that you point to, does not need to be a static file_. You could point to a server side end-point which dynamically creates the required JSON after loading data from a database.

If, for some reason, you don't want to reload a new page (for example you have a one-page app), you can still have dynamic data by calling the restart method at any time and specifying a new data source .

| Method | Description |
| --- | --- |
| restart (datasource) | Live reloads the animation with a new data source |

### Controlling Colors

Within your code, you can control the color of the bubbles, tooltips and the world background by using CSS. If you do not specify any color information anywhere, the default color set will be used. The defaults are documented further down within this readme.

#### Overriding the Default Colors

You can override the default bubble color scheme by specify your alternative colors in some CSS.

```html
<style type="text/css">
   .bubbles_bubble       { background-color: #FAFAFA;   color: #000080;   }
   .bubbles_bubble:hover { background-color: lightblue; color: indianred; }
   .bubbles_world        { background-color: lightgrey; }
</style>
```

The CSS is evaluated on every draw request, so you can even change the CSS dynamically in response to things like user actions or time. Here is a complete list of the CSS selectors you can use along with what each does:

| Class | Selector | Description |
| --- | --- | --- |
| .bubbles_bubble | background-color | The background color of the bubble circle |
| .bubbles_bubble | color | The color of the bubble text and bubble rim |
| .bubbles_bubble:hover | background-color | The background color of the bubble circle - when the mouse is hovered over it |
| .bubbles_bubble:hover | color | The color of the bubble text and bubble rim - when the mouse is hovered over it |
| .bubbles_tooltip | background-color | The background color of the bubble tooltip |
| .bubbles_tooltip | color | The color of the text on the bubble tooltip |
| .bubbles_world | background-color | The background color of the canvas |

You can specify any subset of these CSS selectors - any that you don't specify will fall back to the default color scheme.

#### Per Bubble Coloring

If you want to specify a different color for specific (or even each) bubble, you can do that by including CSS information within the source data as below:

```json
{
    "DE": {"name": "Germany", "count": 3466},
    "UK": {"name": "United Kingdom", "count": 2629,  
        "css": {
            ".bubbles_bubble":       { "background-color": "DarkSeaGreen", "color": "#006400"},
            ".bubbles_bubble:hover": { "background-color": "#000" , "color": "hotpink" } } },
    "FR": {"name": "France", "count": 2463},
}
```

The following CSS styles can be overridden within the source data.

* .bubbles_bubble { background-color }
* .bubbles_bubble { color }
* .bubbles_bubble:hover { background-color }
* .bubbles_bubble:hover { color }

You can specify any subset of these CSS selectors - any that you don't specify will fall back to the default color scheme. You can apply per bubble coloring to any subset of your source data - any that you don't specify will fall back to the default color scheme.

#### Precedence of Specified Colors

The following is the precedence of specified colors on a per selector basis:

1. Per bubble colors within the source data
2. Any CSS that you have included
3. The default coloring scheme

### Modifiable Constants

There are several constants at the top of the main script file, which you can modify in order to change the behavior and appearance of the visualization.

#### Fonts

The following constants control the font inside the bubbles:

| Constant | Default | Unit | Description |
| --- | --- | --- | --- |
| FONT_FACE | Tahoma | string | A browser safe font (btw Tahoma is a good choice as its quite narrow) |
| FONT_HEAD | 24 | point | The size of page heading |
| FONT_MAX | 36 | point | The largest allowed font |
| FONT_MIN | 8 | point | The smallest allowed font |
| FONT_STEP | 2 | >=&nbsp;1 | The font size steps, from big to small |
| FONT_PAD | 8 | pixels | Some text padding within the bubble |

#### Colors

The following constants control the default colors of various things:

_Note: The best way to control the colors of bubbles is to use CSS - either at page level or within the source data. See the earlier section of this readme for more information about how to do that._

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
| VIZ_CROWDEDNESS | 0.70 | >&nbsp;0 | How crowded the world space is, bigger = more crowded (0.78 = &pi;/4 is the ratio area of square to circle, which is about optimal) |
| VIZ_FRAME_RATE | 50 | >1&nbsp;&&nbsp;<&nbsp;60 | The frame rate and hence smoothness of animation, bigger = smoother, but slower overall |
| VIZ_FONT_RECALC | 10 | >=&nbsp;1 | How much the radius must change before a font recalculation (prevents font 'flickering') |

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
| PHYS_REST_JIGGLE | 0.02 | >=&nbsp;0.0 | The restlessness for existing bubbles (zero means they will eventually come to a complete rest) |

## Background

_There is absolutely no need to understand the background maths and algorithms to use the bubbles visualization_. However, for those who are interested, I have included some details here. I've also tried hard to make the code in the main script as easy as possible to read and follow.

### Proportionality of Area

In the visualization, the _area_ of the bubbles is in proportion to the data counts specified in the source data document. I've seen other similar works that scale the _radius_ instead. That is, of course, dead wrong - as it over emphases larger data counts. Given we are presenting our output in a 2D plane, then _area_ is clearly the right scaling domain. Similarly, if you do something like this on a VR headset, then you'd need to scale on _volume_.

![bubble scaling](https://github.com/pete-rai/p5js-bubbles/raw/master/doc/scale.png)

As you can see in the diagram above, it's fairly easy to calculate the required radius of the bubble given a fixed area - its a simple reworking of the formula of the area of a circle.

### Scaling and Crowdedness of Bubbles

How do we scale the bubbles for maximal effect? We start by looking at the largest count for all the elements in the source data. We then allocate that as 1000 'units'. We then scale every other element, in proportion to that 1000-unit largest bubble. Bubbles smaller than 1 (in this scale) are rounded up to 1 unit. These units are logical values only, on each draw cycle, we scale the units into the available screen real-estate.

So hence the bubbles are re-scaled on every frame tick. Why? So that it is maximally responsive to resolution changes. Shrink and grow the window whilst the visualization is running to see the effect. The bubbles don't immediately grow to their end size; instead the source data is filtered-in, a frame tick at a time. This gives a more dynamic experience, allowing the bubbles to slowly take on their end sizes.

In order to scale to the available screen real-estate, we start by calculating the available space and then we factor by a 'crowdedness' scalar. The higher this scalar, the more 'bunched up' the bubbles will be. The optimal value for this scalar is pretty much the ratio of the area of a circle to its _circumscribed square_ (which is &pi; / 4 - see background section below). Essentially turning the difficulties of tessellating circles, into the easier problem of tessellating squares.

![circumscribed square](https://github.com/pete-rai/p5js-bubbles/raw/master/doc/crowdedness.png)

You can easily change the 'crowdedness' scalar, as it’s just a constant at the top of the main script file. Generally, the bigger your screen real-estate, the more you will need to play around with crowdedness to get the most pleasing results.

### Collisions of Bubbles

Collisions are always fun! On every frame tick, we check if any bubble has collided with any other bubble, using the technique below:

![collisions](https://github.com/pete-rai/p5js-bubbles/raw/master/doc/collide.png)

This is also the same code which gets executed whenever you drag a bubble around - causing it to bump into others and pushing them away. It amazing that this high-school trigonometry can lead to such realistic movement - there is some deeper truth in that for sure!

### Fitting Text Inside Circles

Buried in this script, is a neat way to optimize the fitting of text within a circle with the largest font. I might (should) extract it one day into its own script.

In order to make life easier, we start by finding the _inscribed square_ within the circle; then we find the largest text that fits within that square.

![inscribed square](https://github.com/pete-rai/p5js-bubbles/raw/master/doc/inscribed.png)

Why the inscribed square? Why not the radius of the circle? Well the radius it a more tempting space, as it larger - but it's only better on the horizontal and vertical lateral. On the diagonals, the text could well 'poke out' the bounds of the circle, if we just use the radius. In fact, using the radius is logically the same as using the _circumscribed square_ (as described earlier when we spoke about crowdedness). But, to be fair, using bounding square at all is just a shortcut. If you are better than me at geometry, please do have a go at treating the text bounds as the true circular circumference.

Now we have the bounding box, we work out all the ways in which we can line-break the phrases inside the box (in the code these are call _clauses_). Here is the complete, exhaustive line-break set for an example phrase:

![line break combinations](https://github.com/pete-rai/p5js-bubbles/raw/master/doc/clauses.png)

As you can see in the code, the best way to get the full list of line-broken strings is to use a _recursive function_.

So finally, we brute-force all the clauses, for all the font sizes in order to find the one that fills the bounding box with the greatest area. That is expensive (text width measuring costs many machine cycles), but there is also a simple cache so that it is only done once per bubble.

_– [Pete Rai](http://www.rai.org.uk)_
