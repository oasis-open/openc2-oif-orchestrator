"""
OpenC2 Stateless Packet Filtering Profile (SLPF) Conformance
"""
from test_setup import SetupTests


class SLPF_UnitTests(SetupTests):
    """
    SLPF OpenC2 Conformance Tests
    """
    profile = "SLPF"

    def test_allow_ip(self):
        print("Test SLPF Allow:IP...")
