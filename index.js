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
  });
  
  input.preset = input.preset.map(function(row) {
    return row.split(' ').filter(function(x) { return x.length !== 0; }).map(Number);
  });
  
  return input;
}

function Cell() {
  var cell  = {};
  
  // The list links.
  cell.left = cell;
  cell.right = cell;
  cell.up = cell;
  cell.down = cell;
  
  // A pointer to the column header.
  cell.col = undefined;
  
  // The size of the column. This is only valid for the header.
  cell.size = 0;
  
  // Info about the constraint.
  cell.constraint = 0;
  
  // Info about the choice.
  cell.choice = 0;
  
  return cell;
}

function Cover(input) {
  var rows = [];
  var cols = [];
  var squares = [];
  
  var constraints = [];
  var choices = [];
  
  function addConstraint(name) {
    constraints.push(name);
    
    var cell = Cell();
    cell.col = cell;
    cell.constraint = constraints.length - 1;
    return cell;
  }
  
  function addChoice(column, choice) {
    // Create the new cell.
    var cell = Cell();
    cell.col = column;
    cell.constraint = column.constraint;
    cell.choice = choice;
    
    if (choice === undefined) {
      throw new Error('what');
    }
    
    // Link it to the end of column.
    cell.up = column.up;
    cell.up.down = cell;
    cell.down = column;
    cell.down.up = cell;
    
    return cell;
  }
  
  function getSquare(x, y) {
    return squares[x + input.size * y];
  }
  
  function linkRow(cells) {
    for (var i = 0; i < cells.length - 1; i += 1) {
      cells[i].right = cells[i + 1];
      
      if (cells[i].right !== cells[i + 1]) {
        console.log(cells[i + 1]);
        console.log('what');
      }
      
      cells[i].right.left = cells[i];
    }
    
    cells[cells.length - 1].right = cells[0];
    cells[cells.length - 1].right.left = cells[cells.length - 1];
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
    choices.push('row ' + row + ': ' + squares.join(''));
    var choice = choices.length - 1;
    
    var cells = [];
        
    // Fulfill the row constraint.    
    cells.push(addChoice(rows[row], choice));
    
    // For each *filled* square, fulfill the square constraint.
    for (var x = 0; x < input.size; x += 1) {
      if (squares[x] === 1) {
        cells.push(addChoice(getSquare(x, row), choice));
      }
    }
    
    // Link the row.
    linkRow(cells);
  };
  
  methods.addColChoice = function(col, squares) {
    // Add the choice.
    choices.push('col ' + col + ': ' + squares.join(''));
    var choice = choices.length - 1;
    
    var cells = [];
    
    // Fulfill the col constraint.
    cells.push(addChoice(cols[col], choice));
    
    // For each *unfilled* square, fulfill the square constraint.
    for (var y = 0; y < input.size; y += 1) {
      if (squares[y] === 0) {
        cells.push(addChoice(getSquare(col, y), choice));
      }
    }
    
    // Link the row.
    linkRow(cells);
  };
  
  methods.debug = function() {
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

function isPreset(x, y) {
  return input.preset[y].indexOf(x) !== -1;
}

function isValidRow(row, squares) {
  for (var x = 0; x < input.size; x += 1) {
    if (squares[x] === 0 && isPreset(x, row)) {
      return false;
    }
  }
  
  return true;
}

function isValidCol(col, squares) {
  for (var y = 0; y < input.size; y += 1) {
    if (squares[y] === 0 && isPreset(y, col)) {
      return false;
    }
  }
  
  return true;
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
    if (isValidRow(index, squares)) {
      cover.addRowChoice(index, squares);
    }
  });
});

input.cols.forEach(function(block, index) {
  enumChoices(block, 0, 0, squares, function(squares) {
    if (isValidCol(index, squares)) {
      cover.addColChoice(index, squares);
    }
  });
});

cover.debug();
