This is a solution to the first problem in the
[GCHQ Christmas puzzle](http://www.gchq.gov.uk/press_and_media/news_and_features/Pages/Directors-Christmas-puzzle-2015.aspx).
The puzzle is to fill in squares on a grid to satisfy some constraints on the
rows and columns. See [this image of the puzzle](./grid-shading-puzzle.jpg).

I hate solving these kinds of puzzles by hand, so I wrote this computer program
to solve it for me. It converts the problem to an instance of the
[exact cover](https://en.wikipedia.org/wiki/Exact_cover) problem and finds a
solution using [dancing links](https://en.wikipedia.org/wiki/Dancing_Links).

The tricky part was figuring out how to convert the problem into an instance of
the exact cover problem. Like, what sets are we choosing between and what are
the constraints? Eventually I realized that:

* The choices are the ways that each column and row can be filled in. That makes
  for 154318 choices.
* There are two types of constraints: each square can't be white and black at
  the same time, and each row and column must be filled in. There are 675 of
  these constraints.

The program comes to a solution in about 30 seconds on my computer. The file
`solution.html` can be opened to view the solution in a nicer format.

The code is pretty sloppy joe because it's was developed experimentally as I
was solving the problem. Sorry about that.

##### TLDR

    $ node index.js
    675 constraints.
    154318 choices.
    Solving...
    1111111011100010101111111
    1000001011011000001000001
    1011101000001110101011101
    1011101010011111101011101
    1011101001111101101011101
    1000001001100000001000001
    1111111010101010101111111
    0000000011100011100000000
    1011011100101011101001011
    1010000001110110000100010
    0111101011110110100001100
    0101000100010101111010111
    0011001010100000011011111
    0001110110110111111011101
    1011111111101010011000010
    0110100110001101110000010
    1110101010010000111110100
    0000000010001101100011111
    1111111010011000101010111
    1000001011001001100011010
    1011101000111100111110010
    1011101011101111111111011
    1011101010011111101111110
    1000001001100000010101100
    1111111011000101100011111
