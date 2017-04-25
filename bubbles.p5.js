/*
 * p5.js bubbles visualization v1.0.0
 * https://github.com/pete-rai/p5js-bubbles
 *
 * Copyright 2017 Pete Rai
 * Released under the MIT license
 * https://github.com/pete-rai/p5js-bubbles/blob/master/LICENSE
 *
 * Released with the karmaware tag
 * https://pete-rai.github.io/karmaware
 *
 * Website  : http://www.rai.org.uk
 * GitHub   : https://github.com/pete-rai
 * LinkedIn : https://uk.linkedin.com/in/raipete
 *
 * == IF YOU USE THIS SCRIPT, FEEL FREE TO DROP ME LINE pete (at) rai.org.uk ==
 *
 * == VISIT THE GITHUB PAGE FOR EXTENSIVE USAGE NOTES ===
 */

'use strict';

// *** MODIFIABLE CONSTANTS : Feel free to change these to customise the behaviour and appearance ***

// fonts : controls the font inside the bubbles

const FONT_FACE = "Tahoma";  // a browser safe font - btw Tahoma is a good choice as its quite narrow
const FONT_HEAD = 24;  // pt     - size of page heading
const FONT_MAX  = 36;  // pt     - largest allowed font
const FONT_MIN  =  8;  // pt     - smallest allowed font
const FONT_STEP =  2;  // >= 1   - font size steps, from big to small
const FONT_PAD  =  8;  // pixels - some text padding within the bubble

// colors [r, g, b] : controls colors of various things

const CLR_BACK = [230, 230, 250];  // background world color
const CLR_TEXT = [  0, 102, 153];  // bubble text color
const CLR_BALL = [250, 250, 250];  // background bubble color
const CLR_HOVR = [100,   0,   0];  // hovered bubble text color
const CLR_OVER = [255, 228, 225];  // hovered background bubble color
const CLR_TIPS = [252, 240, 173];  // tooptip color

// visuals : several factors that influence appearance

const VIZ_WORLD_MARGIN =   10;  // pixels    - margin around edge of the world that bubbles will bounce off
const VIZ_RIM_FRACTION =   20;  // >= 1      - fraction of bubble that is the rim, bigger num = smaller rim
const VIZ_DBL_CLICK    =  500;  // millsecs  - time window between which two clicks becomes a double click
const VIZ_ALPHA_DEPTH  = 0.60;  // >0 & <=1  - depth of fading of small bubbles, bigger num = more fading
const VIZ_CROWDEDNESS  = 0.70;  // > 0       - how crowded the world space is, bigger = more crowded (0.78 = PI/4 is the ratio area of square to circle, which is about optimal)
const VIZ_FRAME_RATE   =   50;  // >1 & < 60 - frame rate and hence smoothness of animation, bigger = smoother, but slower overall
const VIZ_FONT_RECALC  =   10;  // >= 1      - how much radius must change before a font recalculation (prevents font 'flickering')

// tooltips : tooltip appearance options

const TIP_WANTED  = true;  // bool     - false = no tooltips at all
const TIP_OFFSET  =   15;  // pixels   - tooltip offset from mouse
const TIP_MARGIN  =    4;  // pixels   - tooltip margin
const TIP_DELAY   = 1500;  // millsecs - tooltip appearance delay
const TIP_POINTSZ =   14;  // pt       - tooltip font point size

// physics : factors affecting the bubble movement

const PHYS_REBOUND     = 0.75;  // 0.0 to 1.0 - bounce velocity factor of hitting the world boundary
const PHYS_FRICTION    = 0.80;  // 0.0 to 1.0 - velocity drag of hitting the world boundary
const PHYS_BIRTH_SPEED = 4.00;  // >  0.0     - intial velocity for new bubbles
const PHYS_REST_JIGGLE = 0.02;  // >= 0.0     - restlessness for existing bubbles, zero means they will eventually come to rest

// *** NON-MODIFIABLE CODE : Not a good idea to tinker below this point, unless you know what you're doing ***

const NO_BUBBLES = "You must declare an instance of the Bubble class, see the header comment in the main script for details";

// --- pass thru processing methods to the single instance of the bubble class

function preload       () { if (typeof bubbles !== "undefined") bubbles.preload       (); else console.log (NO_BUBBLES); }
function setup         () { if (typeof bubbles !== "undefined") bubbles.setup         (); }
function draw          () { if (typeof bubbles !== "undefined") bubbles.draw          (); }
function mouseReleased () { if (typeof bubbles !== "undefined") bubbles.mouseReleased (); }
function mouseMoved    () { if (typeof bubbles !== "undefined") bubbles.mouseMoved    (); }
function mouseClicked  () { if (typeof bubbles !== "undefined") bubbles.mouseClicked  (); }
function windowResized () { if (typeof bubbles !== "undefined") bubbles.windowResized (); }

// --- the main bubbles class (see above for details of parameters)

function Bubbles (_source, _parent, _onselect, _tiptext)
{
    this.num_bubbles = 0;     // the total number of drawn bubbles
    this.max_occur   = 1;     // max current occurences for any bubbles
    this.all_occur   = 1;     // total occurences for all bubbles
    this.last_move   = 0;     // time of last mouse movement - for tooltip delays
    this.last_click  = 0;     // time of last mouse click - for double click detection
    this.lines       = [];    // lines of source data
    this.datums      = [];    // the source data items loaded from external location
    this.bubbles     = {};    // the array of bubbles
    this.last_over   = "";    // last bubble under the mouse, if any
    this.dragging    = "";    // bubble being dragged by mouse, if any

    this.dragpos     = new Point (0, 0);        // the position being grabbed on a mouse drag
    this.world       = new Rect  (0, 0, 0, 0);  // the rectangle of the enclosing world space
    this.heading     = new Rect  (0, 0, 0, 0);  // the rectangle that encloses the heading

    this.source      = _source;    // the url for the list of data items
    this.parent      = _parent;    // selector for the parent hosting control (can be null)
    this.onselect    = _onselect;  // the "function (key, bubble)" called when a bubble is clicked (can be null)
    this.tiptext     = _tiptext;   // the "function (key, bubble)" used to generate tooltip text (can be null)

    // one time preload code, called once at the start by processing and used to load up async datasets

    this.preload = function ()
    {
        this.datums = loadJSON (this.source);  // async loads the source data from external source
    }

    // one time intialisation code, called once at the start by processing

    this.setup = function ()
    {
        smooth ();
        frameRate (VIZ_FRAME_RATE);
        textFont (FONT_FACE);
        textStyle (NORMAL)

        var canvas = createCanvas (0, 0);

        if (this.parent && document.getElementById (this.parent))  // set the parent if specified
        {
            canvas.parent (this.parent);
        }

        this.windowResized ();
        loop ();

        // by now the preloads are complete and the data is loaded into this.datums
        // we expand the counts into an item per line in this.lines

        var max = 0;

        for (var item in this.datums)
        {
            if (!this.datums [item].count) this.datums [item].count =  0;  // allow for empties and undefineds
            if (!this.datums [item].name ) this.datums [item].name  = "";

            if (this.datums [item].count > max)
            {
                max = this.datums [item].count;
            }
        }

        // how to distribute the data over space and time? the chosen method is
        // to make the max data value worth 1000 and proportionate down from there
        // although it should be noted that any non-zero value will still equal one
        // which may be more than its proportion demands - this all strikes a
        // nice balance for the animation effect

        if (max)  // did we get any useful data?
        {
            for (var item in this.datums)
            {
                var count   = this.datums [item].count * 1.0 / max * 1000;  // see note above as to why 1000
                var tooltip = this.tiptext ? this.tiptext (item, this.datums [item]) : ""; // grab and cache the tooltip text

                for (var i = 0 ; i < count ; i++)
                {
                    append (this.lines, {key  : item,
                                         name : this.datums [item].name,
                                         data : this.datums [item],
                                         tip  : tooltip});
                }
            }

            // the duration of time to exhause new data will be:
            //
            //     duration = this.lines.length / VIZ_FRAME_RATE seconds
            //
            // but the array shuffling below means that this is not really
            // relevant to how the bubbles grow in relation to each other

            shuffle (this.lines, true);  // shuffle for random appearance
        }
    }

    // called by processing when the window is resized

    this.windowResized = function ()
    {
        var parent = this.parent ? document.getElementById (this.parent) : null;  // if no parent specified, then take whole HTML body
        var width  = parent ? parent.offsetWidth  : windowWidth;
        var height = parent ? parent.offsetHeight : windowHeight;

        resizeCanvas (width, height);

        this.world.Set (0, 0, height, width);
        this.world.Shrink (VIZ_WORLD_MARGIN);
    }

    // the main draw tick method, called repeatedly by processing

    this.draw = function ()
    {
        background (color (CLR_BACK));

        if (this.lines.length)  // we will eventually run out of new data
        {
            this.add (this.lines.shift ());  // removes one from the list and add it to bubble pool
        }

        this.tick ();  // move the world on a tick

        if (this.num_bubbles == 0)
        {
            write (FONT_HEAD, 0, this.world.MidX (), this.world.MidY (), CENTER, CENTER, "Nothing");
        }
    }

    // add one key to bubble pool

    this.add = function (item)
    {
        if (item.key in this.bubbles)  // grow an existing bubble
        {
            this.bubbles [item.key].occurred ();
            this.max_occur = max (this.max_occur, this.bubbles [item.key].occurs);
        }
        else  // make a new bubble
        {
            this.num_bubbles++ ;
            this.bubbles [item.key] = new Bubble (item.key, item.name, item.data, item.tip);
        }

        this.all_occur++;
    }

    // move the world on a tick

    this.tick = function ()
    {
        this.last_over = "";

        for (key in this.bubbles)
        {
            this.bubbles [key].live ();  // this will also set this.last_over
        }

        this.cursor ();
        this.tooltip ();
    }

    // sets the cursor depending on the current context

    this.cursor = function ()
    {
        if (this.dragging)
        {
            cursor (MOVE);
        }
        else if (this.last_over)
        {
            cursor (HAND);
        }
        else
        {
            cursor (ARROW);
        }
    }

    // shows the tool tip is wanted and relevant to mouse position

    this.tooltip = function ()
    {
        if (TIP_WANTED && (Date.now () - this.last_move > TIP_DELAY))
        {
            if (!this.dragging && this.last_over)
            {
                this.bubbles [this.last_over].tooltip ();
            }
        }
    }

    // callback for when the bubble under the mouse was selected

    this.select = function ()
    {
        if (this.onselect && this.last_over)
        {
            this.onselect (this.last_over, this.bubbles [this.last_over].data);  // callback
        }
    }

    // mouse was clicked - no native double-click handling in processing

    this.mouseClicked = function ()
    {
        if (Date.now () - this.last_click < VIZ_DBL_CLICK)  // no native double click in processing
        {
            this.select ();
        }

        this.last_click = Date.now ();
    }

    // mouse was moved

    this.mouseMoved = function ()
    {
        this.last_move = Date.now ();  // for tooltip delays
    }

    // mouse was unclicked

    this.mouseReleased = function ()
    {
        this.dragging = "";
    }
}

// --- the main bubble class

function Bubble (_key, _name, _data, _tip)
{
    this.occurs      = 1;      // counts up as has effect of greater radius
    this.radius      = 1;      // bubble radius
    this.growth      = 0;      // we use bubble growth to trigger font recalcs to stop font 'flickering'
    this.best_font   = 0;      // the preferred font size to fit the circle
    this.best_clause = null;   // the preferred line breaks to fit the circle
    this.fontcache   = {};     // font processing is expensive, so we will cache font data here
    this.key         = _key;   // unique key
    this.tip         = _tip;   // tooltip text
    this.data        = _data;  // original entry from data source
    this.name        = _name;  // the name to show in the bubble
    this.clauses     = clauses (this.name.split (" "));  // all possible combinations of line-broken text for best fit into a circle

    this.position  = new Point (random (bubbles.world.left, bubbles.world.right), random (bubbles.world.top, bubbles.world.bottom));
    this.velocity  = new Point (random (-PHYS_BIRTH_SPEED , PHYS_BIRTH_SPEED   ), random (-PHYS_BIRTH_SPEED, PHYS_BIRTH_SPEED    ));

    // called on every new occurence of the same key

    this.occurred = function ()
    {
        this.occurs++;
    }

    // one life tick for this one bubble

    this.live = function ()
    {
        this.rescale ();  // do this first, as it sets the radius
        this.bounce  ();
        this.collide ();
        this.jiggle  ();
        this.move    ();
        this.draw    ();

        if (this.hovered ())
        {
            bubbles.last_over = this.key;
        }
    }

    // calculate the new scaling factor for every tick (as bubble are changing size)

    this.rescale = function ()
    {
        var available = bubbles.world.Area () * VIZ_CROWDEDNESS;
        var scaled    = available * this.occurs / bubbles.all_occur;
        this.radius   = sqrt (scaled / PI);  // radius for the scaled area (reverse pi * radius squared)
    }

    // bubbles bouncing against the world boundaries

    this.bounce = function ()
    {
        // note: we don't use a "new RECT" here as it leads to many garbage collection delays

        var trajectory_top    = this.position.y + this.velocity.y - this.radius;
        var trajectory_left   = this.position.x + this.velocity.x - this.radius;
        var trajectory_bottom = this.position.y + this.velocity.y + this.radius;
        var trajectory_right  = this.position.x + this.velocity.x + this.radius;

        if (trajectory_top < bubbles.world.top)  // hit the top
        {
            this.position.y = bubbles.world.top + this.radius;
            this.velocity.Inflate (PHYS_FRICTION, -PHYS_REBOUND);
        }
        else if (trajectory_bottom > bubbles.world.bottom)  // hit the bottom
        {
            this.position.y = bubbles.world.bottom - this.radius;
            this.velocity.Inflate (PHYS_FRICTION, -PHYS_REBOUND);
        }

        if (trajectory_left < bubbles.world.left)  // hit the left
        {
            this.position.x = bubbles.world.left + this.radius;
            this.velocity.Inflate (-PHYS_REBOUND, PHYS_FRICTION);
        }
        else if (trajectory_right > bubbles.world.right)  // hit the right
        {
            this.position.x = bubbles.world.right - this.radius;
            this.velocity.Inflate (-PHYS_REBOUND, PHYS_FRICTION);
        }
    }

    // bubbles colliding with other bubbles

    this.collide = function ()
    {
        for (var neighbour in bubbles.bubbles)
        {
            if (this.key != neighbour)  // can't collide yourself
            {
                var other = bubbles.bubbles [neighbour];

                // note: we don't use a "new POINT" as it leads to many garbage collection delays

                var distancex = other.position.x - this.position.x;
                var distancey = other.position.y - this.position.y;
                var distance  = sqrt (sq (distancex) + sq (distancey));  // good ol' pythagoras

                // note: no abs value for distance, so that bubbles can only collide in one pairing direction

                if (distance > 0 && distance < this.radius + other.radius - 1)  // !bang - a collision - distance less than combined radius
                {
                    var overlap = this.radius + other.radius - distance;
                    var angle   = atan2 (distancey, distancex);
                    var recoilx = overlap * cos (angle) / 2;  // spring away faster the more the overlap
                    var recoily = overlap * sin (angle) / 2;

                    this.velocity.Add (-recoilx, -recoily);
                    this.velocity.Inflate (PHYS_REBOUND, PHYS_REBOUND);

                    other.velocity.Add (recoilx, recoily);  // opposite recoil
                    other.velocity.Inflate (PHYS_REBOUND, PHYS_REBOUND);
                }
            }
        }
    }

    // bubbles can jiggle about with some randomness

    this.jiggle = function ()
    {
        this.velocity.x += random (-PHYS_REST_JIGGLE, PHYS_REST_JIGGLE);
        this.velocity.y += random (-PHYS_REST_JIGGLE, PHYS_REST_JIGGLE);
    }

    // bubbles moving or being dragged by the user

    this.move = function ()
    {
        if (this.hovered () && mouseIsPressed && !bubbles.dragging)  // bubble is now being dragged
        {
            bubbles.dragging = this.key;  // drag me
            bubbles.dragpos.Set (this.position.x - mouseX, this.position.y - mouseY);  // drag offset from bubble center
        }

        if (bubbles.dragging == this.key)  // am I being dragged
        {
            this.position.Set (bubbles.dragpos.x + mouseX, bubbles.dragpos.y + mouseY);
            this.velocity.Set (0, 0);
        }
        else
        {
            this.position.Add (this.velocity.x, this.velocity.y);  // just a normal move
        }
    }

    // whether the bubble is under the mouse pointer

    this.hovered = function ()
    {
        return dist (this.position.x, this.position.y, mouseX, mouseY) < this.radius;
    }

    // draw the bubble

    this.draw = function ()
    {
        var rim      = ceil (this.radius / VIZ_RIM_FRACTION);
        var diameter = this.radius + this.radius;
        var depth    = (bubbles.max_occur - this.occurs) / bubbles.max_occur;
        var alpha    = (1 - depth) * VIZ_ALPHA_DEPTH + (1 - VIZ_ALPHA_DEPTH);
        var hilight  = bubbles.dragging ? bubbles.dragging == this.key : this.hovered ();
        var clr_back = hilight ?  color (CLR_OVER)        :  color (CLR_BALL)
        var clr_fore = hilight ? acolor (CLR_HOVR, alpha) : acolor (CLR_TEXT, alpha);

        circle (clr_fore, clr_back, rim, this.position.x, this.position.y, diameter);
        this.label (diameter - rim, clr_fore);
    }

    // write the bubble label in the biggest font possible with the best line breaks

    this.label = function (space, color)
    {
        if (this.growth == 0 || abs (this.radius - this.growth) > VIZ_FONT_RECALC)  // prevents font 'flickering'
        {
            var best_lines  = Number.MAX_SAFE_INTEGER;
            var best_clause = this.name;
            var best_font   = FONT_MIN;
            var inscribed   = sqrt (2 * sq (space / 2 - FONT_PAD));  // area of largest square inscribed within a circle is sqrt (2 * radius * radius)

            for (var id in this.clauses)
            {
                var clause = this.clauses [id];
                var lines  = clause.split ("\n");

                for (var size = FONT_MAX ; size >= FONT_MIN ; size -= FONT_STEP)
                {
                    if (size >= best_font && lines.length < best_lines)  // only do if bigger font and less line breaks
                    {
                        var key  = size + clause;
                        var keyw = "w"  + key;
                        var keyh = "h"  + key;

                        if (!(keyw in this.fontcache))
                        {
                            this.fontcache [keyw] = textWidest (size, lines);
                        }

                        if (!(keyh in this.fontcache))
                        {
                            this.fontcache [keyh] = textHighest (size, lines);
                        }

                        if (this.fontcache [keyw] <= inscribed && this.fontcache [keyh] <= inscribed)  // fits inside the inscribed square
                        {
                            best_clause = clause;
                            best_font   = size;
                            best_lines  = lines.length;  // its the best so far
                            break;
                        }
                    }
                }
            }

            this.best_font   = best_font;  // cache the best at object level as we don't recalc each tick
            this.best_clause = best_clause;
            this.growth      = this.radius;
        }

        if (best_lines == Number.MAX_SAFE_INTEGER)  // we never found any matches
        {
            this.best_clause = cleave (this.name);  // fallback plan - just cleave it in half
        }

        write (this.best_font, color, this.position.x, this.position.y, CENTER, CENTER, this.best_clause);
    }

    // draws the tooltip for this bubble

    this.tooltip = function ()
    {
        if (this.tip.length)
        {
            textSize (TIP_POINTSZ);

            var size   = textWidth (this.tip);
            var left   = (mouseX < bubbles.world.MidX ()) ? mouseX + TIP_OFFSET : mouseX - size - TIP_OFFSET;
            var top    =  mouseY + TIP_OFFSET;
            var width  = TIP_MARGIN + TIP_MARGIN + size;
            var height = TIP_MARGIN + TIP_MARGIN + TIP_POINTSZ;

            rectangle (0, color (CLR_TIPS), 1, left, top, width, height);
            write (TIP_POINTSZ, 0, left + width / 2 + 1, top + height / 2 + 1, CENTER, CENTER, this.tip);
        }
    }
}

// --- a simple 2d point class

function Point (x, y)
{
    this.x = x;
    this.y = y;

    this.Set = function (x, y)
    {
        this.x = x;
        this.y = y;
    }

    this.Add = function (dx, dy)
    {
        this.x += dx;
        this.y += dy;
    }

    this.Inflate = function (dx, dy)
    {
        this.x *= dx;
        this.y *= dy;
    }
}

// --- a simple rectangle class - assumes (top, left) < (bottom, right)

function Rect (top, left, bottom, right)
{
    this.top    = top;
    this.left   = left;
    this.bottom = bottom;
    this.right  = right;

    this.Set = function (top, left, bottom, right)
    {
        this.top    = top;
        this.left   = left;
        this.bottom = bottom;
        this.right  = right;
    }

    this.Shrink = function (margin)
    {
        this.top    += margin;
        this.left   += margin;
        this.bottom -= margin;
        this.right  -= margin;
    }

    this.Width = function ()
    {
        return this.right - this.left;
    }

    this.Height = function ()
    {
        return this.bottom - this.top;
    }

    this.Area = function ()
    {
        return this.Width () * this.Height ();
    }

    this.MidX = function ()
    {
        return this.left + (this.Width () / 2);
    }

    this.MidY = function ()
    {
        return this.top + (this.Height () / 2);
    }
}

// ---  some useful wrappers around common processing primitive combinations

// makes a color from an rgb array and an alpha value

function acolor (rgb, alpha)
{
    return "rgba(" + rgb.concat ([alpha]).join () + ")";
}

// draws a rectangle of a given size and color

function rectangle (fore, back, edge, left, top, width, height)
{
    strokeWeight (edge);
    fill (back);
    stroke (fore);
    rect (left, top, width, height);
}

// draws a circle of a given size and color

function circle (fore, back, edge, x, y, diameter)
{
    fill (back);
    strokeWeight (edge);
    stroke (fore);
    ellipse (x, y, diameter, diameter);
}

// outputs text of a given size, alignment and color

function write (size, fore, x, y, halign, valign, output)
{
    fill (fore);
    strokeWeight (0);
    textSize (size);
    textAlign (halign, valign);
    text (output, x, y);
}

// returns the widest line of a collection of lines given the current font

function textWidest (size, lines)
{
    textSize (size);

    var widest = 0;

    for (var line in lines)
    {
        var width = textWidth (lines [line]);
        if (width > widest)
        {
            widest = width;
        }
    }

    return widest;
}

// returns the highest line of a collection of lines given the current font

function textHighest (size, lines)
{
    return size * lines.length;  // just a function of font size
}

// filters out duplicate items from an array

function unique (array)
{
    var unique = [];

    if (array.length > 0)
    {
        var sorted = sort (array);
        unique.push (sorted [0]);

        for (var i = 1; i < sorted.length; i++)
        {
            if (sorted [i - 1] !== sorted [i])
            {
                unique.push (sorted [i]);
            }
        }
    }

    return unique;
}

// for a given set of words return all possible combinations of lines with linebreaks

function clauses (words, sofar)
{
    if (typeof sofar === "undefined")
    {
        sofar = [words.join (" ")];
    }

    append (sofar, join (words, "\n"));

    for (var i = 0 ; i < words.length - 1 ; i++)
    {
        var line  = words [i] + " " + words [i + 1];
        var start = subset (words, 0, i );
        var end   = subset (words, i + 2);
        var next  = concat (append (start, line), end);

        if (next.length > 1)
        {
            sofar = clauses (next, sofar);  // recursive call
        }
    }

    return unique (sofar);
}

// cleaves the parameter text as near the mid point as possible

function cleave (text)
{
    var chop    = 0;
    var closest = Number.MAX_SAFE_INTEGER;
    var length  = text.length;
    var center  = length / 2;

    for (var chr = 0; chr < length ; chr++)
    {
        if (text [chr] === " ")
        {
            var close = abs (center - chr);
            if (close < closest)
            {
                closest = close;
                chop    = chr;
            }
        }
    }

    if (chop > 0)
    {
        text = text.substr (0, chop) + "\n" + text.substr (chop + 1);
    }

    return text;
}

// --- this is the end, beautiful friend...
