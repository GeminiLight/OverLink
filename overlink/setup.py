from setuptools import setup, find_packages

setup(
    name="overlink_bot",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "playwright>=1.41.0",
        "python-dotenv"
    ]
)
