import unittest
import os
import sys
from datetime import datetime

# Add the parent directory to the path so we can import the api module
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from api.schedule_parser import extract_sales_projections

class TestSalesExtraction(unittest.TestCase):

    def test_extract_sales_projections(self):
        pdf_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../Chipotle Weekly Schedule.pdf'))
        
        # This function doesn't exist yet, so this should fail to import or call
        sales_projections = extract_sales_projections(pdf_path)
        
        self.assertIsNotNone(sales_projections)
        self.assertEqual(len(sales_projections), 7)
        
        expected_sales = [
            ("2026-03-16", 5800.00),
            ("2026-03-17", 6100.00),
            ("2026-03-18", 6800.00),
            ("2026-03-19", 7500.00),
            ("2026-03-20", 9800.00),
            ("2026-03-21", 9200.00),
            ("2026-03-22", 7500.00),
        ]
        
        for date_str, expected_value in expected_sales:
            self.assertIn(date_str, sales_projections)
            self.assertEqual(sales_projections[date_str], expected_value)

if __name__ == '__main__':
    unittest.main()
