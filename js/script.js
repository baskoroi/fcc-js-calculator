(function() {

	let operationStr = '';
	let tempValue = '';
	let tempResult = '';

	let operators = {
		'+': { // addition
			precedence: 1
		},
		'―': { // binary minus (subtraction)
			precedence: 1
		},
		'×': { // multiplication
			precedence: 2
		},
		'÷': { // division
			precedence: 2
		},
		'-': { // unary minus
			precedence: 3
		}
	};

	let engine = {
		// convert the operation string (infix) to postfix notation or 
		// RPN (Reverse Polish Notation)
		convertToRPN: () => {		   
			// separate the operation string into tokens
			let tokens = operationStr.split(/(\+|―|×|÷|-)/).
				filter((token) => { // to prevent empty string occurring 
									// because of split()
					return token !== '';
				});

			// convert the sequence of tokens into RPN
			let rpn = tokens.reduce((acc, curr, index, array) => {
				console.log('acc.stack = ', acc.stack);

				if (!!Number(curr)) { // if current token is a number
					acc.output += curr + ' '; // push the token into the output
				} else { // if current token is an operator
					
					// as long as there is an operator on top of the stack
					// with precedence less than or equal to the 
					// current operator
					while (acc.stack.length > 0) {
						if (operators[curr].precedence <= operators[
								acc.stack[acc.stack.length - 1]
							].precedence) {

							// keep popping the top of the stack
							acc.output += acc.stack.pop() + ' ';
						}
					}

					// then, push the current token/operator into the stack
					acc.stack.push(curr);
				}

				// if there are no more elements in the array
				// pop all the remaining operators in the stack
				if (index === array.length - 1) {
					while (acc.stack.length > 0) {
						acc.output += acc.stack.pop() + ' ';
					}
				}

				// return the accumulator object
				return acc;
			}, {output: '', stack: []}).output; // just extract the output

			// remove the last space of the notation, and
			// return the entire RPN string
			return rpn.slice(0, rpn.length - 1);
		},
		computeRPN: (rpn) => {
			let tokens = rpn.split(' ');
			let result = tokens.reduce((stack, curr, index, array) => {
				if (!!Number(curr)) { // if current token is a number
					stack.push(Number(curr));
				} else { // if current token is an operator
					if (stack.length < 2 && curr !== '-') {
						return [Math.min()]; // error, don't have two operands
					} else {
						// pop two elements, except for unary minus
						var val1 = Number(stack.pop());
						var val2 = (curr === '-') ? -1 : Number(stack.pop());

						// NOTE: val2 must become the first operand in 
						// the operation, otherwise the result will be
						// incorrect
						switch(curr) {
							case '+':
								stack.push(val2 + val1);
								break;
							case '―':
								stack.push(val2 - val1);
								break;
							case '×':
								stack.push(val2 * val1);
								break;
							case '÷':
								stack.push(val2 / val1);
								break;
							case '-':
								stack.push(val2 * val1); // times (-1)
								break;
						}
					}
				}

				if (index === array.length - 1) {
					if (stack.length === 1) {
						return stack;
					} else {
						return [Math.min()]; // error, too many remaining values to compute
					}
				}

				return stack;
			}, []);

			// return the remaining element (result) from the previous stack
			return result[0];
		},
	};

	let display = {
		result: document.getElementById('disp-result'),
		operations: document.getElementById('disp-operations'),
		updateOperation: (ch, isResult) => {
			if (isResult) {
				tempValue = ch;
				operationStr += '=' + ch;
			} else {
				if (ch >= '0' && ch <= '9') {
					if (tempResult.length > 0) tempResult = '';

					// prevent leading zeros from being displayed
					tempValue += (ch === '0' && tempValue.length === 0) ? '' : ch;
					operationStr += (ch === '0' && tempValue.length === 0) ? '' : ch;
				} else {
					if (tempResult.length > 0) operationStr = tempResult;

					tempValue = '';
					operationStr += ch;
				}
			}

			// change the value in the display
			display.result.setAttribute('value', 
				tempValue === '' ? '0' : 
					tempValue === Math.min().toString() ? 'ERROR' : tempValue);
			display.operations.setAttribute('value', 
				operationStr === '' ? '0' : 
					tempValue === Math.min().toString () ? 
						"Press 'AC' to try again." : operationStr);

			// reset both temp value and operation string after displayed
			if (isResult) {
				tempResult = ch;
				operationStr = '';
				tempValue = '';
			}
		},
	};

	let buttons = {
		control: {
			ac: document.getElementById('ac'),
			ce: document.getElementById('ce'),
			about: document.getElementById('about'),
		},
		operations: {
			add: document.getElementById('add'),
			subtract: document.getElementById('subtract'),
			multiply: document.getElementById('multiply'),
			divide: document.getElementById('divide'),
			percent: document.getElementById('percent'),
			equal: document.getElementById('equal'),
		},
		numbers: [
			document.getElementById('zero'),
			document.getElementById('one'),
			document.getElementById('two'),
			document.getElementById('three'),
			document.getElementById('four'),
			document.getElementById('five'),
			document.getElementById('six'),
			document.getElementById('seven'),
			document.getElementById('eight'),
			document.getElementById('nine'),	
		],
	};

	buttons.numbers.map((btn, num) => {
		btn.addEventListener('click', (event) => {
			display.updateOperation(num.toString(), false);
		});
	});

	buttons.operations.add.addEventListener('click', (event) => {
		display.updateOperation('+', false);
	});

	buttons.operations.subtract.addEventListener('click', (event) => {
		if (tempValue.length === 0) display.updateOperation('-', false);
		else display.updateOperation('―', false);
	});

	buttons.operations.multiply.addEventListener('click', (event) => {
		display.updateOperation('×', false);
	});

	buttons.operations.divide.addEventListener('click', (event) => {
		display.updateOperation('÷', false);
	});

	buttons.operations.equal.addEventListener('click', (event) => {
		let rpn = engine.convertToRPN();
		console.log('rpn = ', rpn);

		let result = engine.computeRPN(rpn);
		
		result = result.toString();
		if (result.indexOf('.') >= 0 && result.length > 10) {
			result = Number(result).toFixed(8);
		}

		display.updateOperation(result, true);
	});

	buttons.control.ac.addEventListener('click', (event) => {
		tempValue = '';
		operationStr = '';

		// reset current value back to 0
		display.updateOperation('0', false); 
	});

	buttons.control.ce.addEventListener('click', (event) => {
		tempValue = '';
		operationStr = operationStr.split(/(\+|―|×|÷|-)/).slice(0, -1).join('');

		// reset current value back to 0
		display.updateOperation('0', false);
	});
}());