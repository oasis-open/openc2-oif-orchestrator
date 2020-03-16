"""
OpenC2 Stateless Packet Filtering Profile (SLPF) Conformance
"""
from test_setup import SetupTestCase


class SLPF_UnitTests(SetupTestCase):
    """
    SLPF OpenC2 Conformance Tests
    """
    profile = "SLPF"

    def test_allow_ip(self):
        print("Test SLPF Allow:IP...")
