# Marble Computer
Designing a computer that computes using discrete (in time) signals with an emphasis on a physical implementation using marbles

This project was largely inspired by [this marble based adder](https://www.youtube.com/watch?v=GcDshWmhF4A). [This calculator](https://www.youtube.com/watch?v=_tZdE-3nR3w) shows most of the basic functions we would want to do, but it is not a computer because it doesn't have any conditionals or programming whatsoever.

## Why

Practical turing complete mechanical machines have never been built. [This lego computer](http://rubens.ens-lyon.fr/fr/) one comes close, but if my understanding is correct it only runs one turing machine program and is not programable. [This turing machine](http://hackaday.com/2011/03/25/mechanical-turing-machine-can-compute-anything-slowly/) is a turing complete mechanical computer, but is _incredibly slow_. This is a potential way to build one which will be small enough and patterned enough to actually build.

Additionally, a marble based computer is fundementally differenct than a electrical computer. In an electrical computer 1 is representated with a voltage (a pressure); in a marble computer 1 is represented with a marble (an event). Electrical computers cannot use "event" based hardware without significant work. Designing a computer that uses this difference effectively will be interesting.

## TODO
  - [ ] Test all physical components to make sure they work
  - [X] Develop drafts for all specifications
    - [X] Develop draft for Marble Hardware Description Language
    - [X] Develop Draft for IR
  - [ ] Finalize drafts for all specifications
    - [ ] Finalize draft for Marble Hardware Description Language
    - [ ] Finalize Draft for IR
  - [ ] Develop Tools
    - [ ] Develop Hardware Simulator
    - [ ] Develop compiler
    - [ ] Develop debugger / visualizer
  - [ ] Build the ALU
    - [ ] Decide instruction format
    - [ ] Design the ALU
    - [ ] Decide bit width
    - [ ] Simulate the ALU
    - [ ] Manufacture the ALU
    - [ ] Test the ALU
  - [ ] Build the CPU
  - [ ] Build Memory
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
This will be designed in a custom HDL called [MHDL](MHDL.md). This is because compiling Verilog or VHDL to the low level [IR](IR.md) format would be difficult, but with a lower level (no longer in electronics) lanaguage it is possible to quickly write compilcated structures with useful abstractions.  

### Simulations and Test
Before assembling hardware the design will be virtually tested.

