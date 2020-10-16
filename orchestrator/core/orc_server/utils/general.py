"""
General Utilities
"""
import random
import string
import sys
import uuid

from typing import Any, Tuple

valid_hex = set(string.hexdigits)
valid_hex.add(" ")


def prefixUUID(pre: str = "PREFIX", max_length: int = 30) -> str:
    """
    Create a unique name with a prefix and a UUID string
    :param pre: prefix to use
    :param max_length: max length of the unique name
    :return: unique name with the given prefix
    """
    if len(pre) > max_length:
        raise ValueError(f"max_length is greater than the length of the prefix: {len(pre)}")

    uid_max = max_length - len(pre)
    uid = str(uuid.uuid4()).replace("-", "")[:uid_max]
    if pre in ["", " ", None]:
        return f"{uid}"[:max_length]
    return f"{pre}-{uid}"[:max_length]


def to_str(s: Any) -> str:
    """
    Convert a given type to a default string
    :param s: item to convert to a string
    :return: converted string
    """
    return s.decode(sys.getdefaultencoding(), "backslashreplace") if hasattr(s, "decode") else str(s)


def to_bytes(s: Any) -> bytes:
    """
    Convert a given type to a default byte string
    :param s: item to convert to a byte string
    :return: converted byte string
    """
    enc = sys.getdefaultencoding()
    return s.encode(enc, "backslashreplace") if hasattr(s, "encode") else bytes(str(s), enc)


def randBytes(b: int = 2) -> bytes:
    """
    Get a random number of bytes
    :param b: number of bytes generate
    :return: random number of bytes requested
    """
    return bytes([random.getrandbits(8) for _ in range(b)])


def isHex(val: str) -> bool:
    """
    Determine if the given value is a valid hexadecimal string
    :param val: string to validate
    :return: bool - valid/invalid hexadecimal
    """
    val = ''.join(val.split("0x"))
    return len(set(val) - valid_hex) == 0


def removeDuplicates(*args: Tuple[list]):
    combo = [i for a in args for i in a]
    return tuple(set(combo))
