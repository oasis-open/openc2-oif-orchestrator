"""
OpenC2 Stateless Packet Filtering Profile (SLPF) Conformance
"""
from test_setup import SetupTestCase  # pylint: disable=import-error


class SLPF_UnitTests(SetupTestCase):
    """
    SLPF OpenC2 Conformance Tests
    """
    profile = "SLPF_Spec_1.0"

    def test_allow_ip4_conn(self):
        print("Test SLPF Allow:IPv4_Connection...")

    def test_deny_ip4_conn(self):
        print("Test SLPF Deny:IPv4_Connection...")

    def test_allow_ip6_conn(self):
        print("Test SLPF Allow:IPv6_Connection...")

    def test_deny_ip6_conn(self):
        print("Test SLPF Deny:IPv6_Connection...")

    def test_allow_ip4_net(self):
        print("Test SLPF Allow:IPv4_Net...")

    def test_deny_ip4_net(self):
        print("Test SLPF Deny:IPv4_Net...")

    def test_allow_ip6_net(self):
        print("Test SLPF Allow:IPv6_Net...")

    def test_deny_ip6_net(self):
        print("Test SLPF Deny:IPv6_Net...")

    def test_delete_slpf_rule(self):
        print("Test SLPF Delete:SLPF_Rule...")

    def test_update_file(self):
        print("Test SLPF Update:File...")
