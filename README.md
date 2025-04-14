# Component

> Aardhyn Lavender 2022-2023

A visual programming editor and game engine on the web.

## Installation

```bash
git clone https://github.com/aardhyn/component
```

## Configuration

Create the `.env` file

```bash
cp template.env .env
```

## Build

### Web

> Requires [GNU Make](https://www.gnu.org/software/make/) (agnostic build tool) and [Docker](https://docs.docker.com/?_gl=1*1dpf1tn*_ga*ODY2NDcwMzM5LjE2NjgwMjM2NDE.*_ga_XJWPQMJYHQ*MTY4OTg1MTQwMC40Mi4xLjE2ODk4NTE0MDAuNjAuMC4w) (container management).

Build and run everything in a docker container

```bash
make
```

View `http://localhost:$PORT` in a web browser.

### Native

> Requires [gcc](https://gcc.gnu.org/), [SDL2](https://www.libsdl.org/), and [GNU Make](https://www.gnu.org/software/make/)

It's possible to build the core as a headless CLI native executable.

As I've avoided using **CMake** so far, the Makefile rule for native builds is hardcoded with **gcc**.

You will need to download and extract the [SDL2](https://www.libsdl.org/) library. **SDL** is not bundled with any compilers outside of emscripten that I know of.

> Use the latest stable build of **SDL2** for this project. My include headers are for this version, and I've not tested **SDL3** yet.

#### Windows

Add `SDL2.dll` to `core/lib`. Then build the core with `gcc`

```bash
cd core
make native
```

Write a program in the web client, `download` it, and pass it to the `component` executable

```bash
./component program.json
```

#### Other Systems

I've not tested the native build on macOS or Linux.
