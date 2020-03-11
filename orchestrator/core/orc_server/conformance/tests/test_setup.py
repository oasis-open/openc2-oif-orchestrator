"""
Conformance Test Setup
"""
import unittest

# Local imports
from actuator.models import Actuator


class SetupTests(unittest.TestCase):
    """
    Base OpenC2 Unittest setup class
    """
    actuator: Actuator
    profile: str = None

    def __init__(self, methodName: str, **kwargs):
        super(SetupTests, self).__init__(methodName=methodName)
        self.actuator = kwargs.get('actuator', None)
