var fs = require('fs');

function sizeWithBlank(row, index) {
  var space = row[index];
  
  if (index !== row.length - 1) {
    space += 1;
  }
  
  return space;
}

function sizeWithTrailing(row, index) {
  if (index === row.length - 1) {
    return sizeWithBlank(row, index);
  }
  
  return sizeWithTrailing(row, index + 1) + sizeWithBlank(row, index);
}

function parseInput() {
  var input = JSON.parse(fs.readFileSync('data.json'));
  
  input.rows = input.rows.map(function(row) {
    return row.split(' ').map(Number);
  }).map(function(row) {
    return row.map(function(block, index) {
      return {
        size: row[index], 
        sizeWithBlank: sizeWithBlank(row, index),
        sizeWithTrailing: sizeWithTrailing(row, index) 
      };
    });
  });
  
  input.cols = input.columns.map(function(column) {
    return column.split(' ').map(Number);
  }).map(function(col) {
    return col.map(function(block, index) {
      return {
        size: col[index],
        sizeWithBlank: sizeWithBlank(col, index),
        sizeWithTrailing: sizeWithTrailing(col, index) 
      };
    });
  })
  
  return input;
}

function Cover(input) {
  var rows = [];
  var cols = [];
  var squares = [];
  
  var matrix = [];
  var choices = [];
  
  function addConstraint(name) {
    matrix.push({name: name, choices: []});
    return matrix.length - 1;
  }
  
  function getSquareConstraint(x, y) {
    return matrix[squares[x + input.size * y]];
  }
  
  function init() {
    var i, j;
    
    for (i = 0; i < input.size; i += 1) {
      rows.push(addConstraint('row ' + i));
    }
    
    for (i = 0; i < input.size; i += 1) {
      cols.push(addConstraint('col ' + i));
    }
    
    for (i = 0; i < input.size; i += 1) {
      for (j = 0; j < input.size; j += 1) {
        squares.push(addConstraint('square ' + j + ', ' + i));
      }
    }
  }
 
  var methods = {};
  
  methods.addRowChoice = function(row, squares) {
    // Add the choice.
    choices.push({name: 'row ' + row + ': ' + squares.join('')});
    var choice = choices.length - 1;
    
    // Fulfill the row constraint.
    matrix[rows[row]].choices.push(choice);
    
    // For each *filled* square, fulfill the square constraint.
    for (var x = 0; x < input.size; x += 1) {
      if (squares[x] === 1) {
        getSquareConstraint(x, row).choices.push(choice);
      }
    }
  };
  
  methods.addColChoice = function(col, squares) {
    // Add the choice.
    choices.push({name: 'col ' + col + ': ' + squares.join('')});
    var choice = choices.length - 1;
    
    // Fulfill the col constraint.
    matrix[cols[col]].choices.push(choice);
    
    // For each *unfilled* square, fulfill the square constraint.
    for (var y = 0; y < input.size; y += 1) {
      if (squares[y] === 0) {
        getSquareConstraint(col, y).choices.push(choice);
      }
    }
  };
  
  methods.debug = function() {
    console.log(JSON.stringify(matrix, null, '  '));
  };
  
  init();
  return methods;
}

var input = parseInput();
var cover = Cover(input);

function setSquares(squares, start, size) {
  for (var i = start; i < start + size; i += 1) {
    squares[i] = 1;
  }
}

function clearSquares(squares, start, size) {
  for (var i = start; i < start + size; i += 1) {
    squares[i] = 0;
  }
}

function enumChoices(blocks, index, start, squares, fn) {
  if (index === blocks.length) {
    return fn(squares);
  }
  
  var block = blocks[index];
  
  for (var i = start; i <= input.size - block.sizeWithTrailing; i += 1) {
    setSquares(squares, i, block.size);
    enumChoices(blocks, index + 1, i + block.sizeWithBlank, squares, fn);
    clearSquares(squares, i, block.size);
  }
}

function initSquares() {
  var squares = [];
  
  for (var i = 0; i < input.size; i += 1) {
    squares.push(0);
  }
  
  return squares;
}

var squares = initSquares();

input.rows.forEach(function(block, index) {
  enumChoices(block, 0, 0, squares, function(squares) {
    cover.addRowChoice(index, squares);
  });
});

input.cols.forEach(function(block, index) {
  enumChoices(block, 0, 0, squares, function(squares) {
    cover.addColChoice(index, squares);
  });
});

cover.debug();
