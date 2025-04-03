# CodeGen-ArchSim

## Project Overview
CodeGen-ArchSim is a simulation tool that translates mathematical expressions into assembly-like code using various addressing modes: Three-Address, Two-Address, One-Address, Zero-Address, and RISC. The project demonstrates the working principles of code generation in compilers and CPU instruction sets.

## Features
- Supports infix to postfix conversion.
- Generates code for:
  - Three-Address Code
  - Two-Address Code
  - One-Address Code
  - Zero-Address Code
  - RISC Instruction Set
- Provides annotated instructions for better understanding.

## Usage
1. Clone the repository:
```bash
git clone https://github.com/your-username/CodeGen-ArchSim.git
```
2. Open the project in your preferred IDE.
3. Execute the HTML file in a web browser.
4. Enter an expression in the form "LHS = RHS" (e.g., A = B + C * D).
5. View the generated instructions in different formats.

## Example
For the expression `A = B + C * D`, the outputs are:
- **Three-Address Code:**
```
MUL   R1,C,D   R1 <- M[C] * M[D]
ADD   A,B,R1   A <- M[B] + R1
```
- **Two-Address Code:**
```
MOV R1, C    R1 <- M[C]
MUL R1, D    R1 <- R1 * M[D]
MOV R2, B    R2 <- M[B]
ADD R2, R1    R2 <- R2 + M[R1]
MOV A, R2    A <- M[R2]
```
- **One-Address Code:**
```
LOAD C     AC <- M[C]
MUL D     AC <- AC * M[D]
STORE T1     M[T1] <- AC
LOAD B     AC <- M[B]
ADD T1     AC <- AC + M[T1]
STORE A     M[A] <- AC
```
- **Zero-Address Code:**
```
PUSH B     TOS <- M[B]
PUSH C     TOS <- M[C]
PUSH D     TOS <- M[D]
MUL     TOS <- (TOS * NEXT)
ADD     TOS <- (TOS + NEXT)
POP A     M[A] <- TOS
```
- **RISC Code:**
```
LOAD R1, B     R1 <- M[B]
LOAD R2, C     R2 <- M[C]
LOAD R3, D     R3 <- M[D]
MUL R4, R2, R3     R4 <- (R2 * R3)
ADD R5, R1, R4     R5 <- (R1 + R4)
STORE A, R5     M[A] <- R5
```

## License
This project is licensed under the MIT License. Feel free to use and modify it!

