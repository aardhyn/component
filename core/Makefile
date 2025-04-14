include .env

.PHONY: build

build:
	mkdir -p out \
	&& emcc \
		src/main.cpp \
		src/file.cpp \
		src/vec2.cpp \
		src/rec2.cpp \
		src/stack.cpp \
		src/window.cpp \
		src/parser.cpp \
		src/runtime.cpp \
		src/renderer.cpp \
		src/stackMachine.cpp \
		src/variableStore.cpp \
		-D __DEBUG__=$(DEBUG_MODE) \
		-D __NOEXCEPT__=$(NO_EXCEPT) \
		-o out/core.mjs \
		-I include \
		--pre-js pre/pre.js \
		--js-library lib/print.js \
		-O$(OPTIMIZATION_LEVEL) \
		-l embind \
		-s ENVIRONMENT='web' \
		-s NO_DISABLE_EXCEPTION_CATCHING \
		-s EXPORT_NAME=$(MODULE_NAME) \
		-s USE_SDL=2 \
		-std=c++$(CPP_STD) 

native:
	mkdir -p out \
	&& [ -f lib/SDL2.dll ] \
		&& cp lib/SDL2.dll out \
	&& g++ \
		src/main.cpp \
		src/file.cpp \
		src/vec2.cpp \
		src/rec2.cpp \
		src/stack.cpp
