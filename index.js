var fs = require('fs');

function spaceFor(row, index) {
  var space = row[index];
  
  if (index !== row.length - 1) {
    space += 1;
  }
  
  return space;
}

function totalSpace(row, index) {
  if (index === row.length - 1) {
    return spaceFor(row, index);
  }
  
  return totalSpace(row, index + 1) + spaceFor(row, index);
}

function parseInput() {
  var input = JSON.parse(fs.readFileSync('data.json'));
  
  input.rows = input.rows.map(function(row) {
    return row.split(' ').map(Number);
  }).map(function(row) {
    return row.map(function(block, index) {
      return {
        size: row[index], 
        spaceFor: spaceFor(row, index),
        totalSpace: totalSpace(row, index) 
      };
    });
  });
  
  input.columns = input.columns.map(function(column) {
    return column.split(' ').map(Number);
  }).map(function(col) {
    return col.map(function(block, index) {
      return {
        size: col[index],
        spaceFor: spaceFor(col, index),
        totalSpace: totalSpace(col, index) 
      };
    });
  })
  
  return input;
}

function makeBoard(size) {
  var board = [];
  
  for (var i = 0; i < input.size; i += 1) {
    var columns = [];
    for (var j = 0; j < input.size; j += 1) {
      columns.push(0);
    }
    
    board.push(columns);
  }
  
  return board;
}

var input = parseInput();

// console.log(makeBoard(input.size));
// console.log(JSON.stringify(input));

function set(arr, start, size) {
  for (var i = start; i < start + size; i += 1) {
    arr[i] = 1;
  }
}

function clear(arr, start, size) {
  for (var i = start; i < start + size; i += 1) {
    arr[i] = 0;
  }
}

function foo(row, index, start, marks) {
  if (index === row.length) {
    console.log(marks);
    return;
  }
  
  var block = row[index];
  
  for (var i = start; i <= input.size - block.totalSpace; i += 1) {
    set(marks, i, block.size);
    foo(row, index + 1, i + block.spaceFor, marks);
    clear(marks, i, block.size);
  }
}

var marks = [];
for (var i = 0; i < 25; i += 1) {
  marks.push(0);
}

console.log(input.rows[0]);
foo(input.rows[0], 0, 0, marks);
