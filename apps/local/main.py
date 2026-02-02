import sys
import os

# Add the shared package to the path so we don't need to pip install it for local dev
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../packages/python-core')))

from backend.cli import main

if __name__ == "__main__":
    main()
