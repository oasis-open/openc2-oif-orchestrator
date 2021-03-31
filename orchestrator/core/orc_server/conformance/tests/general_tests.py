"""
OpenC2 Generic Conformance
"""
import random

from test_setup import SetupTestCase  # pylint: disable=import-error


class General_UnitTests(SetupTestCase):
    """
    General OpenC2 Conformance Tests
    """
    profile = "General_Spec_1.0"

    def test_headers(self):
        """
        Test of OpenC2 specific headers
        """
        print("Test `content_type` header...")
        if random.randint(0, 2) == 1:
            self.fail("No `content_type` header")

        print("Test `request_id` header...")
        if random.randint(0, 2) == 1:
            self.fail("No `request_id` header")

        with self.subTest(header='msg_type'):
            print("Test `msg_type` header...")
            if random.randint(0, 1) == 1:
                self.fail("No `msg_type` header")

        with self.subTest(header='status'):
            print("Test `status` header...")
            if random.randint(0, 1) == 1:
                self.fail("No `status` header")

        with self.subTest(header='created'):
            print("Test `created` header...")
            if random.randint(0, 1) == 1:
                self.fail("No `created` header")

        with self.subTest(header='from'):
            print("Test `from` header...")
            if random.randint(0, 1) == 1:
                self.fail("No `from` header")

        with self.subTest(header='to'):
            print("Test `to` header...")
            if random.randint(0, 1) == 1:
                self.fail("No `to` header")

    def test_query_features(self):
        """
        Test of basic OpenC2 conformance
        """
        print("Test Query Features...")
