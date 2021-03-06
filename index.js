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
  
  var header = undefined;
  
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
    
    column.size += 1;
    
    return cell;
  }
  
  function getSquare(x, y) {
    return squares[x + input.size * y];
  }
  
  function linkRow(cells) {
    for (var i = 0; i < cells.length - 1; i += 1) {
      cells[i].right = cells[i + 1];
      cells[i].right.left = cells[i];
    }
    
    cells[cells.length - 1].right = cells[0];
    cells[cells.length - 1].right.left = cells[cells.length - 1];
  }
  
  function init() {
    var i, j, cell;
    
    var cells = [];
    
    header = Cell();
    cells.push(header);
    
    // Add the row constraint headers.
    for (i = 0; i < input.size; i += 1) {
      cell = addConstraint('row ' + i);
      cells.push(cell);
      rows.push(cell);
    }
    
    // Add the column constraint headers.
    for (i = 0; i < input.size; i += 1) {
      cell = addConstraint('col ' + i);
      cells.push(cell);
      cols.push(cell);
    }
    
    // Add the square constraint headers.
    for (i = 0; i < input.size; i += 1) {
      for (j = 0; j < input.size; j += 1) {
        cell = addConstraint('square ' + j + ', ' + i);
        cells.push(cell);
        squares.push(cell);
      }
    }
    
    // Link the column row.
    linkRow(cells);
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
  
  function chooseColumn() {
    var cell = header.right;
    
    var minSize = cell.size;
    var minCell = cell;
    
    while (cell !== header) {
      if (cell.size < minSize) {
        minSize = cell.size;
        minCell = cell;
      }
      
      cell = cell.right;
    }
    
    return minCell;
  }
  
  function cover(column) {
    column.right.left = column.left;
    column.left.right = column.right;

    for (var i = column.down; i !== column; i = i.down) {
      for (var j = i.right; j !== i; j = j.right) {      
        j.down.up = j.up;
        j.up.down = j.down;
    
        j.col.size -= 1;
      }
    }
  }
  
  function uncover(column) {
    for (var i = column.up; i !== column; i = i.up) {
      for (var j = i.left; j !== i; j = j.left) {
        j.down.up = j;
        j.up.down = j;

        j.col.size += 1;
      }
    }
    
    column.right.left = column;
    column.left.right = column;
  }
  
  function search(solution) {
    var column = chooseColumn();
    
    if (column === header) {
      return true;
    }
    
    if (column.size === 0) {
      return false;
    }
    
    cover(column);
    
    for (var r = column.down; r !== column; r = r.down) {
      solution.push(r);
      
      for (var j = r.right; j !== r; j = j.right) {
        cover(j.col);
      }
      
      if (search(solution)) {
        return true;
      }
      
      solution.pop();
      for (var j = r.left; j !== r; j = j.left) {
        uncover(j.col);
      }
    }
    
    uncover(column);
    return false;
  };
  
  methods.logMatrix = function() {
    console.log(constraints.length.toString() + ' constraints.');
    console.log(choices.length.toString() + ' choices.');
  }
  
  methods.dance = function() {
    var solution = [];
    if (!search(solution)) {
      console.log('no solution found');
      return undefined;
    }
    
    var rows = [];
    for (var i = 0; i < 25; i += 1) {
      rows.push([]);
    }
    
    solution.forEach(function(cell) {
      var match = choices[cell.choice].match(/row (\d+): (.*)/);
      if (match) {
        rows[parseInt(match[1])] = match[2].split('');
      }
    });
    
    return rows;
  }
  
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
    if (squares[y] === 0 && isPreset(col, y)) {
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

cover.logMatrix();
console.log('Solving...');
var solution = cover.dance();

console.log(solution.map(function(row) {
  return row.join('');
}).join('\n'));

function getRow(arr, row) {
  return arr[row];
}

function getCol(arr, col) {
  var result = [];
  
  for (var i = 0; i < input.size; i += 1) {
    result.push(arr[i][col]);
  }
  
  return result;
}

function getRuns(arr) {
  var result = [];
  var count = 0;
  
  arr.forEach(function(cell) {
    if (cell === '1') {
      count += 1;
    } else if (count !== 0) {
      result.push(count);
      count = 0;
    }
  });
  
  if (count !== 0) {
    result.push(count);
  }
  
  return result;
}

function isCorrect(arr, constraint) {
  var actual = getRuns(arr);
  var expected = constraint.map(function(cell) {
    return cell.size;
  });
  
  if (actual.length !== expected.length) {
    return false;
  }
  
  for (var i = 0; i < expected.length; i += 1) {
    if (actual[i] !== expected[i]) {
      return false;
    }
  }
  
  return true;
}

function prettyConstraint(constraint) {
  return constraint.map(function(cell) {
    return cell.size;
  }).join(', ');
}

for (var i = 0; i < input.size; i += 1) {
  if (!isCorrect(getRow(solution, i), input.rows[i])) {
    console.log('row ' + i + ': ' + getRow(solution, i).toString() + ' FAILS ' + prettyConstraint(input.rows[i]));
  }
}

for (var i = 0; i < input.size; i += 1) {
  if (!isCorrect(getCol(solution, i), input.cols[i])) {
    console.log('col ' + i + ': ' + getCol(solution, i).toString() + ' FAILS ' + prettyConstraint(input.cols[i]));
  }
}
