"""
OpenC2 Generic Conformance
"""
from test_setup import SetupTests


class General_UseCases(SetupTests):
    """
    General OpenC2 Conformance Tests
    """
    profile = "General"

    def test_headers(self):
        """
        Test of OpenC2 specific headers
        """
        print("Test Headers...")
        self.fail("testing failure")

    def test_query_features(self):
        """
        Test of basic OpenC2 conformance
        """
        print("Test SLPF Query Features...")
