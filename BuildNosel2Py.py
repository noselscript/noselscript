import sys
from cx_Freeze import setup, Executable
from setuptools import find_packages

packages = find_packages()

build_exe_options = {
    "packages": packages + ["os", "sys"],
    "includes": [],
    "include_files": [],
    "optimize": 2,
}

base = None
if sys.platform == "win32":
    base = "Win32GUI"

executable = Executable(
    script="ConvertPy/Nosel2Py.py",
    base=base,
    target_name="Nosel2Py.exe"
)

setup(
    name="Nosel2PyConverter",
    version="1.1",
    options={"build_exe": build_exe_options},
    executables=[executable]
)
