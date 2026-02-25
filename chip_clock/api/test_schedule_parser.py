import unittest
import os
import sys

# Add the parent directory to the path so we can import the api module
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from api.schedule_parser import parse_time_range, is_name_cell

class TestScheduleParser(unittest.TestCase):

    def test_is_name_cell(self):
        self.assertTrue(is_name_cell("Smith, John"))
        self.assertFalse(is_name_cell("123 Main St"))
        self.assertFalse(is_name_cell(""))

    def test_parse_time_range(self):
        start, end = parse_time_range("8:00am - 4:00pm")
        self.assertEqual(start, "08:00")
        self.assertEqual(end, "16:00")

        start, end = parse_time_range("8a - 4p")
        self.assertEqual(start, "08:00")
        self.assertEqual(end, "16:00")
        
        start, end = parse_time_range("invalid")
        self.assertIsNone(start)
        self.assertIsNone(end)

if __name__ == '__main__':
    unittest.main()
