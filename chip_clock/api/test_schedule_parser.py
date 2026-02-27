import unittest
import os
import sys
from unittest.mock import patch
from datetime import datetime
import csv
import pytz

# Add the parent directory to the path so we can import the api module
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from api.schedule_parser import parse_time_range, is_name_cell, extract_data_from_pdf

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
        
    def test_extract_schedule_integration(self):
        pdf_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../Schedule.pdf'))
        
        schedule, start_date = extract_data_from_pdf(pdf_path)
        
        self.assertIsNotNone(schedule, "Schedule extraction returned None")
        self.assertIsNotNone(start_date, "Start date extraction returned None")
        
        has_johnston = any("Johnston" in name for name in schedule.keys())
        self.assertTrue(has_johnston, "Madison Johnston not found in extracted schedule")
        
    def test_compare_with_csv(self):
        pdf_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../Schedule.pdf'))
        csv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../Extracted_Schedule.csv'))
        
        schedule, _ = extract_data_from_pdf(pdf_path)
        
        expected_shifts = []
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                expected_shifts.append(row)
                
        # Transform the parsed schedule into a comparable format
        parsed_shifts = []
        for raw_name, shifts in schedule.items():
            # Format name from "Last, First" to "First Last"
            name_parts = [p.strip() for p in raw_name.split(',')]
            if len(name_parts) == 2:
                formatted_name = f"{name_parts[1]} {name_parts[0]}"
            else:
                formatted_name = raw_name
                
            for shift in shifts:
                parsed_shifts.append({
                    'employee_name': formatted_name,
                    'position': shift['type'],
                    # DB has format like "2026-02-23 22:00:00.000", but it might be local time converted to UTC in DB?
                    # The CSV has UTC strings without T or Z, just YYYY-MM-DD HH:MM:SS.000
                    # My parser outputs ISO string: YYYY-MM-DDTHH:MM:SS+00:00
                    'shift_start': shift['start'].replace('T', ' ').split('+')[0] + '.000',
                    'shift_end': shift['end'].replace('T', ' ').split('+')[0] + '.000'
                })
                
        # To make comparison robust, we check if every expected shift is found in the parsed shifts
        # Note: the PDF might have extra shifts (like training or weekly totals) not in DB, 
        # or DB might have deleted/edited shifts. But assuming the CSV is a direct extraction of the original PDF:
        
        for expected in expected_shifts:
            found = False
            for parsed in parsed_shifts:
                if (expected['employee_name'] == parsed['employee_name'] and
                    expected['position'] == parsed['position'] and
                    expected['shift_start'] == parsed['shift_start'] and
                    expected['shift_end'] == parsed['shift_end']):
                    found = True
                    break
            
            # If not found exactly, try to find a close match to give helpful error
            if not found:
                close_matches = [p for p in parsed_shifts if p['employee_name'] == expected['employee_name']]
                self.fail(f"Expected shift not found: {expected}. Close matches for this employee: {close_matches}")

if __name__ == '__main__':
    unittest.main()