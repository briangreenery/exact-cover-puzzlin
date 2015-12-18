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
