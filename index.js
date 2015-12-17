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

function foo(row, index, start) {
  var total = 0;
  
  if (index === row.length) {
    return 1;
  }
  
  var block = row[index];
  
  for (var i = start; i <= input.size - block.totalSpace; i += 1) {
    total += foo(row, index + 1, i + block.spaceFor);
  }
  
  return total;
}

var total = 0;

input.columns.forEach(function(row) {
  var sum = foo(row, 0, 0);
  console.log(row);
  console.log(sum);
  total += sum;
});

console.log('----------');
console.log(total);
