# Marble Computer
Designing a computer that computes using discrete (in time) signals with an emphasis on a physical implementation using marbles

This project was largely inspired by [this marble based adder](https://www.youtube.com/watch?v=GcDshWmhF4A).

## Why

No turing complete purely mechanical computer has ever been built (that I know of). This is a potential way to build one which will be small enough and patterned enough to actually build.

Additionally, a marble based computer is fundementally differenct than a electrical computer. In an electrical computer 1 is representated with a voltage (a pressure); in a marble computer 1 is represented with a marble (an event). Electrical computers cannot use "event" based hardware without significant work. Designing a computer that uses this difference effectively will be interesting.

## TODO
  - [ ] Test all physical components to make sure they work
  - [ ] Develop draft for Marble Hardware Description Language
  - [ ] Develop Hardware Simulator
  - [ ] Build the ALU
    - [ ] Design the ALU
    - [ ] Simulate the ALU
    - [ ] Manufacture the ALU
    - [ ] Test the ALU
  - [ ] MOAR!

## How
### Physical
The basic components are:
  - Flip Flops: a switch which toggles its direction when a marble goes through it
  - Switch: a switch which does not toggle its direction
  - Link: a way to link flip flops and switches so that they match state
  - Reset Link: like a link, but can only set a 1 or a 0 state
  - Duplicator: one marble goes in, two or more come out
  - Delay: extra track to slow down a marble
  - Catch: a hole next to a flip flop which holds a marble

### Design
This will be designed in a custom HDL.

### Simulations and Test
Before assembling hardware the design will be virtually tested.

