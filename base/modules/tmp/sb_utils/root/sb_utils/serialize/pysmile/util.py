"""
Miscellaneous helper methods
"""
import struct


def zigzag_encode(inp: int) -> int:
    if inp < 0:
        return (inp << 1) ^ -1
    return inp << 1


def zigzag_decode(encoded: int) -> int:
    return (encoded >> 1) ^ (-(encoded & 1))


def float_to_raw_long_bits(value: float) -> bytes:
    return struct.unpack('Q', struct.pack('d', value))[0]


def long_bits_to_float(bits: bytes) -> float:
    return struct.unpack('d', struct.pack('Q', bits))[0]


def float_to_bits(value: float) -> bytes:
    return struct.unpack('>l', struct.pack('>f', value))[0]


def bits_to_float(bits: bytes) -> float:
    return round(struct.unpack('>f', struct.pack('>l', bits))[0], 6)


def bit_len(i: int) -> int:
    """
    Calculate the bit length of an int
    :param int i: Int
    :return: Length of *i*
    :rtype: int
    """
    length = 0
    while i:
        i >>= 1
        length += 1
    return length


def bit_count(i: int) -> int:
    """
    Calculate the number of set bits (1's) in an int
    :param int i: An int
    :returns: The number of set bits in *i*
    :rtype: int
    """
    count = 0
    while i:
        i &= i - 1
        count += 1
    return count


def bsr(value: int, bits: int) -> int:
    """
    bsr(value, bits) -> value shifted right by bits
    This function is here because an expression in the original java
    source contained the token '>>>' and/or '>>>=' (bit shift right
    and/or bit shift right assign).  In place of these, the python
    source code below contains calls to this function.
    Copyright 2003 Jeffrey Clement.  See pyrijnadel.py for license and original source
    :param value: Value
    :param bits: Bits
    """
    if bits < 0 or bits > 31:
        raise ValueError('bad shift count')
    if bits == 0:
        return value
    minint = -2147483648
    if bits == 31:
        if value & minint:
            return 1
        return 0
    tmp = (value & 0x7FFFFFFE) // 2**bits
    if value & minint:
        tmp |= (0x40000000 // 2 ** (bits - 1))
    return tmp


def hash_string(s: str) -> int:
    """
    This does what Java hashCode does
    :param str s:
    :returns: Hash code
    :rtype: int
    """
    h = 0
    for c in s:
        o = ord(c) if isinstance(c, str) else c
        h = (31 * h + o) & 0xFFFFFFFF
    return ((h + 0x80000000) & 0xFFFFFFFF) - 0x80000000


def is_int32(num: int) -> bool:
    try:
        return not int(num) >> 32
    except ValueError:
        return False
