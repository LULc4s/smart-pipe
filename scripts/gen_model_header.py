#!/usr/bin/env python3
"""
Generate a C header from a .tflite model file (equivalent to `xxd -i model.tflite`).

Usage:
  python scripts/gen_model_header.py [input.tflite] [output.h]

If no arguments are provided the script will use `modelo_vazao.tflite` and
generate `modelo_vazao.h` in the repository root.

The generated header declares:
  const unsigned char modelo_vazao_tflite[] = { ... };
  const unsigned int modelo_vazao_tflite_len = <size>;

This is safe to include in embedded projects.
"""
import sys
from pathlib import Path


def generate_header(input_path: Path, output_path: Path, var_name: str):
    data = input_path.read_bytes()
    lines = []
    lines.append('#include <stdint.h>')
    lines.append('')
    lines.append(f'const unsigned char {var_name}[] = {{')

    # write 12 bytes per line to resemble xxd -i
    for i in range(0, len(data), 12):
        chunk = data[i:i+12]
        hexs = ', '.join(f'0x{b:02X}' for b in chunk)
        lines.append('  ' + hexs + (',' if i + 12 < len(data) else ','))

    lines.append('};')
    lines.append(f'const unsigned int {var_name}_len = {len(data)};')
    lines.append('')

    output_path.write_text('\n'.join(lines))
    print(f'Written {output_path} ({len(data)} bytes)')


def main(argv):
    in_file = Path(argv[1]) if len(argv) > 1 else Path('modelo_vazao.tflite')
    out_file = Path(argv[2]) if len(argv) > 2 else Path('modelo_vazao.h')

    if not in_file.exists():
        print(f'Error: input file not found: {in_file}')
        return 2

    # safe C identifier
    base = in_file.stem
    var_name = (base + '_tflite').replace('-', '_').replace('.', '_')

    generate_header(in_file, out_file, var_name)
    return 0


if __name__ == '__main__':
    raise SystemExit(main(sys.argv))
