// Three-Address Code Functions 
function isOperator(c) {
    return ['+', '-', '*', '/', '='].includes(c);
}

function precedence(op) {
    if (op === '+' || op === '-') return 2;
    if (op === '*' || op === '/') return 3;
    return 0;
}

function tokenize3(exp) {
    let tokens = [];
    let current = "";
    for (let i = 0; i < exp.length; i++) {
        let c = exp[i];
        if (c === ' ') continue;
        if (/[A-Za-z0-9]/.test(c)) {
            current += c;
        } else {
            if (current !== "") {
                tokens.push(current);
                current = "";
            }
            tokens.push(c);
        }
    }
    if (current !== "") tokens.push(current);
    return tokens;
}

function infixToPostfix(exp) {
    let output = [];
    let stack = [];
    let tokens = tokenize3(exp);
    for (let token of tokens) {
        if (/[A-Za-z0-9]/.test(token)) {
            output.push(token);
        } else if (token === '(') {
            stack.push(token);
        } else if (token === ')') {
            while (stack.length && stack[stack.length - 1] !== '(') {
                output.push(stack.pop());
            }
            stack.pop();
        } else if (isOperator(token)) {
            if (token === '=') continue;
            while (stack.length && isOperator(stack[stack.length - 1]) &&
                precedence(token) <= precedence(stack[stack.length - 1])) {
                output.push(stack.pop());
            }
            stack.push(token);
        }
    }
    while (stack.length) {
        output.push(stack.pop());
    }
    return output;
}

function formatOperand3(op) {
    return op.startsWith("R") ? op : "M[" + op + "]";
}

function opMnemonic3(op) {
    switch (op) {
        case '+': return "ADD";
        case '-': return "SUB";
        case '*': return "MUL";
        case '/': return "DIV";
        default: return op;
    }
}

function generateInstructions3(postfix, target) {
    let instructions = [];
    let stack = [];
    let regCount = 1;
    for (let token of postfix) {
        if (/[A-Za-z0-9]/.test(token)) {
            stack.push(token);
        } else if (isOperator(token)) {
            let op2 = stack.pop();
            let op1 = stack.pop();
            let mnemonic = opMnemonic3(token);
            let isFinal = (stack.length === 0);
            let result = (isFinal && target !== null) ? target : ("R" + regCount++);
            let instr = mnemonic + "   " + result + "," + op1 + "," + op2 +
                "   " + result + " <- " + formatOperand3(op1) + " " + token + " " + formatOperand3(op2);
            instructions.push(instr);
            stack.push(result);
        }
    }
    return instructions;
}

//  Two-Address Code Functions 

function generateTwoAddressCode2(postfix) {
    let instructions = [];
    let stack = [];
    let tempCount = 1;
    postfix.forEach(token => {
        if (!isOperator(token)) {
            stack.push(token);
        } else {
            let op2 = stack.pop();
            let op1 = stack.pop();
            let temp = "R" + tempCount++;
            instructions.push("MOV " + temp + ", " + op1);
            if (token === '+') {
                instructions.push("ADD " + temp + ", " + op2);
            } else if (token === '-') {
                instructions.push("SUB " + temp + ", " + op2);
            } else if (token === '*') {
                instructions.push("MUL " + temp + ", " + op2);
            } else if (token === '/') {
                instructions.push("DIV " + temp + ", " + op2);
            }
            stack.push(temp);
        }
    });
    return { code: instructions, result: stack.pop() };
}
function annotateInstruction2(instr) {
    let tokens = instr.split(/[\s,]+/).filter(token => token);
    let op = tokens[0];
    let dest = tokens[1];
    let src = tokens[2];
    let annotation = "";
    if (op === "MOV") {
        annotation = dest + " <- M[" + src + "]";
    } else if (op === "ADD") {
        annotation = dest + " <- " + dest + " + M[" + src + "]";
    } else if (op === "SUB") {
        annotation = dest + " <- " + dest + " - M[" + src + "]";
    } else if (op === "MUL") {
        annotation = dest + " <- " + dest + " * M[" + src + "]";
    } else if (op === "DIV") {
        annotation = dest + " <- " + dest + " / M[" + src + "]";
    }
    return instr + "    " + annotation;
}

// One-Address Code Functions 

function generateOneAddressCode1(postfix) {
    let instructions = [];
    let stack = [];
    let tempCount = 1;
    for (let i = 0; i < postfix.length; i++) {
        let token = postfix[i];
        if (!isOperator(token)) {
            stack.push(token);
        } else {
            let right = stack.pop();
            let left = stack.pop();
            instructions.push("LOAD " + left);
            if (token === '+') {
                instructions.push("ADD " + right);
            } else if (token === '-') {
                instructions.push("SUB " + right);
            } else if (token === '*') {
                instructions.push("MUL " + right);
            } else if (token === '/') {
                instructions.push("DIV " + right);
            }
            if (i < postfix.length - 1) {
                let temp = "T" + tempCount++;
                instructions.push("STORE " + temp);
                stack.push(temp);
            } else {
                stack.push("AC");
            }
        }
    }
    return instructions;
}
function annotateInstruction1(instr) {
    let tokens = instr.split(/\s+/);
    let op = tokens[0];
    let operand = tokens[1];
    let annotation = "";
    switch (op) {
        case "LOAD":
            annotation = "AC <- M[" + operand + "]";
            break;
        case "ADD":
            annotation = "AC <- AC + M[" + operand + "]";
            break;
        case "SUB":
            annotation = "AC <- AC - M[" + operand + "]";
            break;
        case "MUL":
            annotation = "AC <- AC * M[" + operand + "]";
            break;
        case "DIV":
            annotation = "AC <- AC / M[" + operand + "]";
            break;
        case "STORE":
            annotation = "M[" + operand + "] <- AC";
            break;
        default:
            annotation = "";
    }
    return instr + "     " + annotation;
}

/********** Zero-Address Code Functions **********/

function generateZeroAddressCode0(postfix) {
    let instructions = [];
    let stack = [];
    postfix.forEach(token => {
        if (!isOperator(token)) {
            instructions.push(`PUSH ${token}     TOS <- M[${token}]`);
            stack.push(token);
        } else {
            let right = stack.pop();
            let left = stack.pop();
            let operation = token === '+' ? 'ADD' :
                token === '-' ? 'SUB' :
                    token === '*' ? 'MUL' : 'DIV';
            instructions.push(`${operation}     TOS <- (TOS ${token} NEXT)`);
            stack.push(`T${stack.length + 1}`);
        }
    });
    return instructions;
}

// RISC Code Functions 

function generateRISCCode(postfix) {
    let instructions = [];
    let registers = [];
    let regCount = 1;
    function getRegister() {
        return `R${regCount++}`;
    }
    postfix.forEach(token => {
        if (!isOperator(token)) {
            let reg = getRegister();
            instructions.push(`LOAD ${reg}, ${token}     ${reg} <- M[${token}]`);
            registers.push(reg);
        } else {
            let right = registers.pop();
            let left = registers.pop();
            let reg = getRegister();
            let operation = token === '+' ? 'ADD' :
                token === '-' ? 'SUB' :
                    token === '*' ? 'MUL' : 'DIV';
            instructions.push(`${operation} ${reg}, ${left}, ${right}     ${reg} <- (${left} ${token} ${right})`);
            registers.push(reg);
        }
    });
    return { instructions, resultRegister: registers.pop() };
}

/********** Combined Generator **********/
function generateAllCodes() {
    let exprInput = document.getElementById("expression").value.trim();
    
    if (!exprInput) {
        alert("Please enter an expression.");
        return;
    }
    
    let parts = exprInput.split("=");
    if (parts.length !== 2) {
        alert("Please provide an expression in the form: LHS = RHS");
        return;
    }
    let lhs = parts[0].trim();
    let rhs = parts[1].trim();

    //  Three-Address Code 
    let postfix3 = infixToPostfix(rhs);
    let threeAddrInstructions = generateInstructions3(postfix3, lhs);
    document.getElementById("output-3addr").textContent = threeAddrInstructions.join("\n");

    // Two-Address Code 
    let postfix2 = infixToPostfix(rhs);
    let twoAddrResult = generateTwoAddressCode2(postfix2);
    let twoAddrInstructions = twoAddrResult.code;
    twoAddrInstructions.push("MOV " + lhs + ", " + twoAddrResult.result);
    let annotatedTwoAddr = twoAddrInstructions.map(instr => annotateInstruction2(instr));
    document.getElementById("output-2addr").textContent = annotatedTwoAddr.join("\n");

    // One-Address Code 
    let postfix1 = infixToPostfix(rhs);
    let oneAddrInstructions = generateOneAddressCode1(postfix1);
    oneAddrInstructions.push("STORE " + lhs);
    let annotatedOneAddr = oneAddrInstructions.map(instr => annotateInstruction1(instr));
    document.getElementById("output-1addr").textContent = annotatedOneAddr.join("\n");

    // Zero-Address Code 
    let postfix0 = infixToPostfix(rhs);
    let zeroAddrInstructions = generateZeroAddressCode0(postfix0);
    zeroAddrInstructions.push(`POP ${lhs}     M[${lhs}] <- TOS`);
    document.getElementById("output-0addr").textContent = zeroAddrInstructions.join("\n");

    // RISC Code 
    let postfixRISC = infixToPostfix(rhs);
    let riscResult = generateRISCCode(postfixRISC);
    let riscInstructions = riscResult.instructions;
    riscInstructions.push(`STORE ${lhs}, ${riscResult.resultRegister}     M[${lhs}] <- ${riscResult.resultRegister}`);
    document.getElementById("output-risc").textContent = riscInstructions.join("\n");
}