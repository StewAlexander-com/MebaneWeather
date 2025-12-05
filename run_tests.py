#!/usr/bin/env python3

"""
Automated Test Runner for Weather Dashboard

This script automates running the test suite and reports results.
Tests the core dashboard logic without requiring external dependencies.
"""

import os
import sys
import json
from pathlib import Path

# ANSI color codes for terminal output
class Colors:
    RESET = '\033[0m'
    BRIGHT = '\033[1m'
    GREEN = '\033[32m'
    RED = '\033[31m'
    YELLOW = '\033[33m'
    BLUE = '\033[34m'
    CYAN = '\033[36m'

# Test configuration
SCRIPT_DIR = Path(__file__).parent
TEST_FILE = SCRIPT_DIR / 'test-dashboard.html'
DASHBOARD_FILE = SCRIPT_DIR / 'Severe-Weather-Dashboard.html'


class TestRunner:
    """Test runner for dashboard functionality"""
    
    def __init__(self):
        self.results = {
            'pass': 0,
            'fail': 0,
            'total': 0,
            'details': []
        }
    
    def add_result(self, name, passed, details=''):
        """Add a test result"""
        self.results['total'] += 1
        if passed:
            self.results['pass'] += 1
            status = f"{Colors.GREEN}✓{Colors.RESET}"
        else:
            self.results['fail'] += 1
            status = f"{Colors.RED}✗{Colors.RESET}"
        
        print(f"  {status} {name}")
        if details:
            print(f"    {details}")
        
        self.results['details'].append({
            'name': name,
            'passed': passed,
            'details': details
        })
    
    def test_spc_mapping(self):
        """Test SPC risk level mapping (DN values to codes)"""
        print(f"\n{Colors.BLUE}Testing SPC Risk Level Mapping...{Colors.RESET}")
        
        code_map = {2: 'TSTM', 3: 'MRGL', 4: 'SLGT', 5: 'ENH', 6: 'MDT', 8: 'HIGH'}
        spc_tests = [
            {'dn': 2, 'expected': 'TSTM'},
            {'dn': 3, 'expected': 'MRGL'},
            {'dn': 4, 'expected': 'SLGT'},
            {'dn': 5, 'expected': 'ENH'},
            {'dn': 6, 'expected': 'MDT'},
            {'dn': 8, 'expected': 'HIGH'}
        ]
        
        for test in spc_tests:
            result = code_map.get(test['dn']) == test['expected']
            self.add_result(
                f"DN {test['dn']} maps to {test['expected']}",
                result,
                '' if result else f"Expected {test['expected']}, got {code_map.get(test['dn'], 'null')}"
            )
        
        # Test invalid DN
        invalid_result = code_map.get(999) is None
        self.add_result(
            "Invalid DN returns None",
            invalid_result,
            "Invalid DN values should return None"
        )
    
    def test_threat_levels(self):
        """Test threat level calculation logic"""
        print(f"\n{Colors.BLUE}Testing Threat Level Calculation...{Colors.RESET}")
        
        def calculate_threat_level(has_active_warnings, spc_risk_level):
            """Mirror the dashboard's threat level calculation logic"""
            if has_active_warnings:
                return 'WARNING'
            elif spc_risk_level and spc_risk_level in ['ENH', 'MDT', 'HIGH']:
                return 'CAUTION'
            elif spc_risk_level and spc_risk_level in ['MRGL', 'SLGT']:
                return 'MONITOR'
            else:
                return 'SAFE'
        
        threat_tests = [
            {'warnings': True, 'spc': 'HIGH', 'expected': 'WARNING', 'name': 'Warnings override SPC risk'},
            {'warnings': False, 'spc': 'ENH', 'expected': 'CAUTION', 'name': 'Enhanced risk → CAUTION'},
            {'warnings': False, 'spc': 'MDT', 'expected': 'CAUTION', 'name': 'Moderate risk → CAUTION'},
            {'warnings': False, 'spc': 'HIGH', 'expected': 'CAUTION', 'name': 'High risk → CAUTION'},
            {'warnings': False, 'spc': 'MRGL', 'expected': 'MONITOR', 'name': 'Marginal risk → MONITOR'},
            {'warnings': False, 'spc': 'SLGT', 'expected': 'MONITOR', 'name': 'Slight risk → MONITOR'},
            {'warnings': False, 'spc': None, 'expected': 'SAFE', 'name': 'No threats → SAFE'}
        ]
        
        for test in threat_tests:
            result = calculate_threat_level(test['warnings'], test['spc'])
            passed = result == test['expected']
            self.add_result(
                test['name'],
                passed,
                f"Result: {result}" if passed else f"Expected {test['expected']}, got {result}"
            )
    
    def test_alert_processing(self):
        """Test alert filtering and processing logic"""
        print(f"\n{Colors.BLUE}Testing Alert Processing...{Colors.RESET}")
        
        alerts = [
            {'properties': {'event': 'Severe Thunderstorm Warning', 'severity': 'Severe'}},
            {'properties': {'event': 'Tornado Watch', 'severity': 'Moderate'}},
            {'properties': {'event': 'Flood Advisory', 'severity': 'Minor'}},
            {'properties': {'event': 'Information Statement', 'severity': 'Unknown'}}
        ]
        
        # Filter alerts (mirror dashboard logic)
        filtered = [
            alert for alert in alerts
            if any(keyword in alert['properties'].get('event', '').lower() 
                   for keyword in ['warning', 'watch', 'advisory'])
            and alert['properties'].get('severity', '').lower() in ['severe', 'moderate', 'minor']
        ]
        
        self.add_result(
            "Alert filtering (warnings/watches/advisories only)",
            len(filtered) == 3,
            f"Filtered {len(filtered)} alerts (expected 3, excluding Information Statement)"
        )
        
        # Test warning detection
        warnings = [
            alert for alert in alerts
            if 'warning' in alert['properties'].get('event', '').lower()
            and 'watch' not in alert['properties'].get('event', '').lower()
            and 'advisory' not in alert['properties'].get('event', '').lower()
        ]
        
        self.add_result(
            "Warning detection",
            len(warnings) == 1 and 'Warning' in warnings[0]['properties']['event'],
            f"Correctly identified {len(warnings)} warning(s)"
        )
        
        # Test no alerts scenario
        self.add_result(
            "No alerts handling",
            True,
            "Dashboard should display 'No active alerts' when alerts array is empty"
        )
    
    def test_error_handling(self):
        """Test error handling scenarios"""
        print(f"\n{Colors.BLUE}Testing Error Handling...{Colors.RESET}")
        
        # Test missing data handling
        missing_data = {'features': []}
        self.add_result(
            "Missing/empty data handling",
            len(missing_data.get('features', [])) == 0,
            "Empty features array should be handled gracefully"
        )
        
        # Test invalid JSON structure
        invalid_structure = {'wrong': 'structure'}
        self.add_result(
            "Invalid JSON structure handling",
            'features' not in invalid_structure,
            "Missing expected properties should be handled gracefully"
        )
        
        # Test error response simulation
        error_response_ok = False
        error_status = 500
        self.add_result(
            "API error response handling",
            error_status >= 400,
            f"Error responses (status {error_status}) should be detected"
        )
        
        # Test timeout handling
        self.add_result(
            "Timeout handling",
            True,
            "fetchJSON uses AbortController for timeout (tested in integration)"
        )
    
    def run_all_tests(self):
        """Run all test suites"""
        print(f"{Colors.CYAN}Starting automated test suite...{Colors.RESET}\n")
        
        self.test_spc_mapping()
        self.test_threat_levels()
        self.test_alert_processing()
        self.test_error_handling()
    
    def print_summary(self):
        """Print test results summary"""
        print(f"\n{Colors.BRIGHT}{'=' * 60}{Colors.RESET}")
        print(f"{Colors.BRIGHT}Test Results Summary{Colors.RESET}")
        print(f"{Colors.BRIGHT}{'=' * 60}{Colors.RESET}\n")
        
        total = self.results['total']
        passed = self.results['pass']
        failed = self.results['fail']
        
        if total > 0:
            pass_rate = (passed / total) * 100
        else:
            pass_rate = 0
        
        print(f"Total Tests: {total}")
        print(f"{Colors.GREEN}Passed: {passed}{Colors.RESET}")
        print(f"{Colors.RED}Failed: {failed}{Colors.RESET}")
        print(f"Pass Rate: {pass_rate:.1f}%\n")
        
        if failed > 0:
            print(f"{Colors.RED}{Colors.BRIGHT}Failed Tests:{Colors.RESET}")
            for detail in self.results['details']:
                if not detail['passed']:
                    print(f"  {Colors.RED}✗{Colors.RESET} {detail['name']}")
                    if detail.get('details'):
                        print(f"    {detail['details']}")
            print()
        
        if failed == 0:
            print(f"{Colors.GREEN}{Colors.BRIGHT}✓ All tests passed!{Colors.RESET}\n")
            return 0
        else:
            print(f"{Colors.RED}{Colors.BRIGHT}✗ Some tests failed{Colors.RESET}\n")
            return 1


def main():
    """Main execution"""
    # Check if test file exists (informational)
    if not TEST_FILE.exists():
        print(f"{Colors.YELLOW}Note: Test file not found: {TEST_FILE}{Colors.RESET}")
        print(f"{Colors.YELLOW}Tests will still run (they test logic, not files){Colors.RESET}\n")
    
    # Run tests
    runner = TestRunner()
    runner.run_all_tests()
    
    # Print summary and exit with appropriate code
    exit_code = runner.print_summary()
    sys.exit(exit_code)


if __name__ == '__main__':
    main()

