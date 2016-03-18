#Design Document
This is where the overall design of the computer will be specified.

## Control unit
### Registers
| Name | Use | Number |
|:-----|:----|:-------|
| Zero | quick access to 0 | 0 |
| t0 | general purpose | 1 |
| t1 | general purpose | 2 |
| t2 | general purpose | 3 |
| s0 | Semi-permanent storage| 4 |
| sp | stack pointer | 5 |
| pc | Program counter | 6 |
| ra | Program counter | 7 |
### Instruction Set
|Instruction | Description | Format | Binary |
|:-----------|:------------|:-------|:-------|
| Branch Not Equals | Change PC to a value if a register does not equal 0| bne $dest, Value | 0000ddd - value|
| Branch Equals  | Change PC to a value if a register equals 0 | beq $dest, Value | 0001ddd - value|
| Calulate | Used to send commands to the ALU | cal $dest | 001ddd- ccccccc|
| Load Immediate | Sets a register equal to a value| li $dest, Value| 010ddd - value|
| Extra Instructions | Maybe fast nop, pc = ra, or syscall|something|011abcd|
| Store word | Stores the data from source into memory at dest| sw $source, $dest| 100ssdd|
| Load word  | Reads  the data from memory at dest into source| lw $source, $dest| 101ssdd|
| Move to Upper| Moves data from a lower register to an upper register | mvt $dest $source| 110ssdd|
| Move from upper| Moves data from an upper register to a lower register | mvf $dest $source| 111ssdd|
## ALU
There is an accumulator
### Operations / modules
I'm not sure what operations the alu should be able to preform.

Possible operations:
  - Add
  - Negate (2's compliment or 1's compliment)
  - Shift Left
  - Shift Right
  - Compare (less than)
  labs

### Instruction Format
